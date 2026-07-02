# Runtime smoke report

Generated: 2026-06-20T07:14:02.826Z · Base URL: `http://localhost:8080`

## Unauthenticated redirect assertions

| Case             | Requested                                           | Final    | Expected | Status | Issue |
| ---------------- | --------------------------------------------------- | -------- | -------- | ------ | ----- |
| subject (unauth) | `/subject/Mathematics`                              | `/login` | `/login` | ✅     | —     |
| lesson (unauth)  | `/lesson/00000000-0000-0000-0000-000000000000`      | `/login` | `/login` | ✅     | —     |
| quiz (unauth)    | `/lesson/00000000-0000-0000-0000-000000000000/quiz` | `/login` | `/login` | ✅     | —     |

## Invalid-ID friendly fallback assertions

| Case                                   | Requested                                           | Expected text              | Status              | Issue |
| -------------------------------------- | --------------------------------------------------- | -------------------------- | ------------------- | ----- | --- |
| invalid subjectId → friendly fallback  | `/subject/ThisSubjectDoesNotExist123`               | "No lessons here yet"      | ✅                  | —     |
| invalid lessonId → friendly fallback   | `/lesson/00000000-0000-0000-0000-000000000000`      | "Quest page was not found" | ✅                  | —     |
| invalid quiz route → friendly fallback | `/lesson/00000000-0000-0000-0000-000000000000/quiz` | "No Quiz Questions Found   | Error Loading Quiz" | ✅    | —   |
