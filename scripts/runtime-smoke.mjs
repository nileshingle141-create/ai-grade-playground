#!/usr/bin/env node
/**
 * Runtime smoke test — drives a real browser against the running app to assert:
 *
 *   1. Unauthenticated requests to protected dynamic routes
 *      (/subject/:id, /lesson/:id, /lesson/:id/quiz) are redirected to /login.
 *   2. Authenticated requests to invalid / non-existent subjectId, lessonId,
 *      and quiz routes render the friendly fallback page (NOT a generic 404).
 *
 * Results are written to route-report/runtime-smoke.{json,md} so CI can
 * upload them as the same artifact emitted by check-routes.mjs.
 *
 * Usage:
 *   SMOKE_BASE_URL=http://localhost:8080 node scripts/runtime-smoke.mjs
 *
 * Auth and DB calls are intercepted at the network layer with page.route(),
 * so the test does not require a real Supabase session or seeded data.
 */
import { chromium } from "playwright";
import { mkdirSync, writeFileSync, readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

/** Read VITE_SUPABASE_PROJECT_ID from .env so we can compute the Supabase auth storage key. */
function readProjectRef() {
  if (process.env.VITE_SUPABASE_PROJECT_ID) return process.env.VITE_SUPABASE_PROJECT_ID;
  const envPath = resolve(process.cwd(), ".env");
  if (!existsSync(envPath)) return null;
  const m = readFileSync(envPath, "utf8").match(/^VITE_SUPABASE_PROJECT_ID=(.+)$/m);
  return m ? m[1].trim() : null;
}
const PROJECT_REF = readProjectRef();
const STORAGE_KEY = PROJECT_REF ? `sb-${PROJECT_REF}-auth-token` : null;

const BASE_URL = process.env.SMOKE_BASE_URL || "http://localhost:8080";
const REPORT_DIR = resolve(process.cwd(), "route-report");
const LOGIN_PATH = "/login";

const RED = "\u001b[31m";
const GREEN = "\u001b[32m";
const RESET = "\u001b[0m";

const INVALID_SUBJECT = "ThisSubjectDoesNotExist123";
const INVALID_LESSON_ID = "00000000-0000-0000-0000-000000000000";
const FAKE_USER_ID = "11111111-1111-1111-1111-111111111111";

const PROTECTED_ROUTES = [
  { name: "subject (unauth)", path: `/subject/Mathematics` },
  { name: "lesson (unauth)",  path: `/lesson/${INVALID_LESSON_ID}` },
  { name: "quiz (unauth)",    path: `/lesson/${INVALID_LESSON_ID}/quiz` },
];

const FALLBACK_CASES = [
  {
    name: "invalid subjectId → friendly fallback",
    path: `/subject/${INVALID_SUBJECT}`,
    expectText: "No lessons here yet",
    table: "lessons",
  },
  {
    name: "invalid lessonId → friendly fallback",
    path: `/lesson/${INVALID_LESSON_ID}`,
    expectText: "Quest page was not found",
    table: "lessons",
  },
  {
    name: "invalid quiz route → friendly fallback",
    path: `/lesson/${INVALID_LESSON_ID}/quiz`,
    expectText: "No Quiz Questions Found",
    table: "quizzes",
  },
];

/** Intercept Supabase calls so the page renders without a real backend. */
async function stubSupabase(page, { authenticated }) {
  await page.route("**/auth/v1/user**", (route) => {
    if (!authenticated) {
      return route.fulfill({ status: 401, contentType: "application/json", body: JSON.stringify({ msg: "unauthorized" }) });
    }
    return route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({ id: FAKE_USER_ID, email: "smoke@test.local", aud: "authenticated" }),
    });
  });

  // Profile, lessons, quizzes, progress — return empty so fallback paths trigger.
  await page.route("**/rest/v1/**", (route) => {
    const req = route.request();
    const url = req.url();
    const accept = req.headers()["accept"] || "";
    const wantsSingle = accept.includes("application/vnd.pgrst.object+json");

    if (url.includes("/rest/v1/profiles")) {
      // The profile lookup uses .single(); return a real object so the auth flow proceeds.
      return route.fulfill({
        status: 200,
        contentType: "application/vnd.pgrst.object+json",
        body: JSON.stringify({ id: FAKE_USER_ID, grade: 1 }),
      });
    }
    if (wantsSingle) {
      // Simulate "row not found" — drives the friendly "not found" fallback.
      return route.fulfill({
        status: 406,
        contentType: "application/json",
        body: JSON.stringify({ code: "PGRST116", message: "Row not found", details: "0 rows" }),
      });
    }
    // Default list response — empty so "no lessons / no quiz" fallbacks trigger.
    return route.fulfill({ status: 200, contentType: "application/json", body: "[]" });
  });

  await page.route("**/rpc/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "false" })
  );
}

async function assertRedirect(browser, { name, path }) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await stubSupabase(page, { authenticated: false });
  const target = `${BASE_URL}${path}`;
  try {
    await page.goto(target, { waitUntil: "domcontentloaded", timeout: 15000 });
    // Auth gate redirects from a client-side useEffect — wait for URL to settle on /login.
    await page.waitForURL((u) => new URL(u).pathname === LOGIN_PATH, { timeout: 10000 });
    const finalPath = new URL(page.url()).pathname;
    return { name, requested: path, finalPath, expected: LOGIN_PATH, status: finalPath === LOGIN_PATH ? "ok" : "fail", issue: finalPath === LOGIN_PATH ? null : `landed at ${finalPath}` };
  } catch (err) {
    const finalPath = (() => { try { return new URL(page.url()).pathname; } catch { return "(unknown)"; } })();
    return { name, requested: path, finalPath, expected: LOGIN_PATH, status: "fail", issue: `did not redirect to ${LOGIN_PATH} (${err.message.split("\n")[0]})` };
  } finally {
    await context.close();
  }
}

async function assertFallback(browser, { name, path, expectText }) {
  const context = await browser.newContext();
  const page = await context.newPage();
  await stubSupabase(page, { authenticated: true });
  try {
    // Seed a fake Supabase session so the auth gate calls /auth/v1/user (which we intercept).
    if (!STORAGE_KEY) throw new Error("VITE_SUPABASE_PROJECT_ID not found in env/.env — cannot seed fake session");
    await page.goto(`${BASE_URL}/`, { waitUntil: "domcontentloaded", timeout: 15000 });
    const fakeSession = {
      access_token: "fake.fake.fake",
      refresh_token: "fake-refresh",
      token_type: "bearer",
      expires_at: Math.floor(Date.now() / 1000) + 3600,
      expires_in: 3600,
      user: { id: FAKE_USER_ID, email: "smoke@test.local", aud: "authenticated", role: "authenticated" },
    };
    await page.evaluate(
      ([k, v]) => window.localStorage.setItem(k, v),
      [STORAGE_KEY, JSON.stringify(fakeSession)],
    );
    await page.goto(`${BASE_URL}${path}`, { waitUntil: "domcontentloaded", timeout: 15000 });
    await page.waitForFunction(
      (needle) => document.body && document.body.innerText.includes(needle),
      expectText,
      { timeout: 10000 }
    );
    const finalPath = new URL(page.url()).pathname;
    return { name, requested: path, finalPath, expectedText: expectText, status: "ok", issue: null };
  } catch (err) {
    const bodyText = await page.evaluate(() => document.body?.innerText?.slice(0, 200) || "");
    return {
      name,
      requested: path,
      finalPath: (() => { try { return new URL(page.url()).pathname; } catch { return "(unknown)"; } })(),
      expectedText: expectText,
      status: "fail",
      issue: `expected text "${expectText}" not found. Body preview: ${bodyText.replace(/\s+/g, " ")}`,
    };
  } finally {
    await context.close();
  }
}

(async () => {
  console.log(`Runtime smoke against ${BASE_URL}\n`);
  const browser = await chromium.launch();
  const redirects = [];
  for (const r of PROTECTED_ROUTES) redirects.push(await assertRedirect(browser, r));
  const fallbacks = [];
  for (const f of FALLBACK_CASES) fallbacks.push(await assertFallback(browser, f));
  await browser.close();

  const all = [...redirects, ...fallbacks];
  for (const r of all) {
    const tag = r.status === "ok" ? `${GREEN}✓${RESET}` : `${RED}✗${RESET}`;
    console.log(`  ${tag} ${r.name.padEnd(38)} ${r.requested} → ${r.finalPath}${r.issue ? `  (${r.issue})` : ""}`);
  }

  mkdirSync(REPORT_DIR, { recursive: true });
  writeFileSync(
    resolve(REPORT_DIR, "runtime-smoke.json"),
    JSON.stringify({ generatedAt: new Date().toISOString(), baseUrl: BASE_URL, redirects, fallbacks }, null, 2),
  );
  const md = [
    "# Runtime smoke report",
    "",
    `Generated: ${new Date().toISOString()}  ·  Base URL: \`${BASE_URL}\``,
    "",
    "## Unauthenticated redirect assertions",
    "| Case | Requested | Final | Expected | Status | Issue |",
    "| --- | --- | --- | --- | --- | --- |",
    ...redirects.map((r) => `| ${r.name} | \`${r.requested}\` | \`${r.finalPath}\` | \`${r.expected}\` | ${r.status === "ok" ? "✅" : "❌"} | ${r.issue || "—"} |`),
    "",
    "## Invalid-ID friendly fallback assertions",
    "| Case | Requested | Expected text | Status | Issue |",
    "| --- | --- | --- | --- | --- |",
    ...fallbacks.map((f) => `| ${f.name} | \`${f.requested}\` | "${f.expectedText}" | ${f.status === "ok" ? "✅" : "❌"} | ${f.issue || "—"} |`),
    "",
  ].join("\n");
  writeFileSync(resolve(REPORT_DIR, "runtime-smoke.md"), md);
  console.log(`\nReport written to ${REPORT_DIR}/runtime-smoke.{json,md}`);

  const failed = all.filter((r) => r.status !== "ok");
  if (failed.length) {
    console.error(`\n${RED}✗ Runtime smoke failed:${RESET} ${failed.length} of ${all.length} assertions failed.\n`);
    process.exit(1);
  }
  console.log(`\n${GREEN}✓ Runtime smoke passed${RESET} (${all.length} assertions)\n`);
})().catch((err) => {
  console.error(`\n${RED}✗ Runtime smoke crashed:${RESET} ${err.stack || err.message}\n`);
  process.exit(1);
});
