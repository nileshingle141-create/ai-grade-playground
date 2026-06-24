#!/usr/bin/env node
// Pre-publish smoke test:
//   1. Ensure every critical route is registered in src/routeTree.gen.ts.
//   2. Assert each route's auth posture — public routes must live at the
//      top level, protected routes must live under `/__authenticated/...`
//      so the layout gate redirects unauthenticated students to /login.
//   3. Emit a machine + human readable report (JSON + Markdown) under
//      ./route-report/ so CI can upload it as an artifact for debugging.
import { readFileSync, existsSync, mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const ROUTE_TREE = resolve(process.cwd(), "src/routeTree.gen.ts");
const REPORT_DIR = resolve(process.cwd(), "route-report");

/**
 * access:
 *   "public"        -> reachable without a session (login, signup, landing)
 *   "authenticated" -> must be under /__authenticated/* (redirect to /login when signed out)
 */
const ROUTES = [
  { path: "/", access: "public", dynamic: false },
  { path: "/login", access: "public", dynamic: false },
  { path: "/signup", access: "public", dynamic: false },
  { path: "/admin", access: "public", dynamic: false },
  { path: "/__authenticated/dashboard", access: "authenticated", dynamic: false },
  { path: "/__authenticated/subjects", access: "authenticated", dynamic: false },
  { path: "/__authenticated/progress", access: "authenticated", dynamic: false },
  { path: "/__authenticated/subject/$subjectId", access: "authenticated", dynamic: true },
  { path: "/__authenticated/lesson/$lessonId", access: "authenticated", dynamic: true },
  { path: "/__authenticated/lesson/$lessonId/quiz", access: "authenticated", dynamic: true },
];

const RED = "\u001b[31m";
const GREEN = "\u001b[32m";
const YELLOW = "\u001b[33m";
const RESET = "\u001b[0m";

if (!existsSync(ROUTE_TREE)) {
  console.error(
    `\n${RED}✗ Route smoke test failed:${RESET} Missing ${ROUTE_TREE}. Run dev/build to regenerate.\n`,
  );
  process.exit(1);
}

const src = readFileSync(ROUTE_TREE, "utf8");

const results = ROUTES.map((r) => {
  const registered = src.includes(`'${r.path}'`) || src.includes(`"${r.path}"`);
  const underAuthLayout = r.path.startsWith("/__authenticated/");
  const expectedRedirect =
    r.access === "authenticated" ? "/login (when signed out)" : "renders directly";

  let status = "ok";
  const issues = [];
  if (!registered) {
    status = "missing";
    issues.push("not registered in routeTree.gen.ts");
  }
  if (r.access === "authenticated" && !underAuthLayout) {
    status = "fail";
    issues.push("protected route not under /__authenticated/* layout — no auth redirect");
  }
  if (r.access === "public" && underAuthLayout) {
    status = "fail";
    issues.push(
      "public route nested under /__authenticated/* — students would be redirected to /login",
    );
  }

  return { ...r, registered, expectedRedirect, status, issues };
});

// Write artifacts (JSON + Markdown) for CI upload.
mkdirSync(REPORT_DIR, { recursive: true });

writeFileSync(
  resolve(REPORT_DIR, "routes.json"),
  JSON.stringify({ generatedAt: new Date().toISOString(), routes: results }, null, 2),
);

const md = [
  "# Route smoke test report",
  "",
  `Generated: ${new Date().toISOString()}`,
  "",
  "| Route | Access | Dynamic | Registered | Expected behavior | Status | Issues |",
  "| --- | --- | --- | --- | --- | --- | --- |",
  ...results.map(
    (r) =>
      `| \`${r.path}\` | ${r.access} | ${r.dynamic ? "yes" : "no"} | ${
        r.registered ? "✅" : "❌"
      } | ${r.expectedRedirect} | ${
        r.status === "ok" ? "✅ ok" : `❌ ${r.status}`
      } | ${r.issues.join("; ") || "—"} |`,
  ),
  "",
].join("\n");
writeFileSync(resolve(REPORT_DIR, "routes.md"), md);

// Console summary
console.log("\nValidated routes:");
for (const r of results) {
  const tag =
    r.status === "ok"
      ? `${GREEN}✓${RESET}`
      : r.status === "missing"
        ? `${YELLOW}!${RESET}`
        : `${RED}✗${RESET}`;
  console.log(
    `  ${tag} ${r.path.padEnd(42)} [${r.access.padEnd(13)}] → ${r.expectedRedirect}${
      r.issues.length ? `  (${r.issues.join("; ")})` : ""
    }`,
  );
}

const failures = results.filter((r) => r.status !== "ok");
console.log(`\nReport written to ${REPORT_DIR}/routes.json and ${REPORT_DIR}/routes.md`);

if (failures.length > 0) {
  console.error(
    `\n${RED}✗ Route smoke test failed:${RESET} ${failures.length} of ${results.length} routes have issues.\n` +
      failures.map((f) => `  - ${f.path}: ${f.issues.join("; ")}`).join("\n") +
      "\n",
  );
  process.exit(1);
}

console.log(
  `\n${GREEN}✓ Route smoke test passed${RESET} (${results.length} routes verified — public + authenticated postures correct)\n`,
);
