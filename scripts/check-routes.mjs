#!/usr/bin/env node
// Pre-publish smoke test: ensure critical dynamic routes are registered
// in the generated route tree. Fails the build if any expected route
// is missing so a stale/incomplete deploy can't ship.
import { readFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

const ROUTE_TREE = resolve(process.cwd(), "src/routeTree.gen.ts");

const REQUIRED_ROUTES = [
  "/",
  "/login",
  "/signup",
  "/admin",
  "/__authenticated/dashboard",
  "/__authenticated/subjects",
  "/__authenticated/progress",
  "/__authenticated/subject/$subjectId",
  "/__authenticated/lesson/$lessonId",
  "/__authenticated/lesson/$lessonId/quiz",
];

function fail(msg) {
  console.error(`\n\u001b[31m✗ Route smoke test failed:\u001b[0m ${msg}\n`);
  process.exit(1);
}

if (!existsSync(ROUTE_TREE)) {
  fail(`Missing ${ROUTE_TREE}. Run dev/build to regenerate.`);
}

const src = readFileSync(ROUTE_TREE, "utf8");
const missing = REQUIRED_ROUTES.filter((r) => {
  // The generated file stores both `id: '<route>'` and `'<route>': { id: '<route>' ...}`
  return !src.includes(`'${r}'`) && !src.includes(`"${r}"`);
});

if (missing.length > 0) {
  fail(
    `The following routes are not registered in routeTree.gen.ts:\n  - ${missing.join(
      "\n  - "
    )}\nMake sure the matching files exist under src/routes/ and the TanStack Router plugin regenerated the tree.`
  );
}

console.log(
  `\u001b[32m✓ Route smoke test passed\u001b[0m (${REQUIRED_ROUTES.length} routes verified)`
);
