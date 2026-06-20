# Runtime smoke report

Generated: 2026-06-20T07:12:49.556Z  ·  Base URL: `http://localhost:8080`

## Unauthenticated redirect assertions
| Case | Requested | Final | Expected | Status | Issue |
| --- | --- | --- | --- | --- | --- |
| subject (unauth) | `/subject/Mathematics` | `/login` | `/login` | ✅ | — |
| lesson (unauth) | `/lesson/00000000-0000-0000-0000-000000000000` | `/login` | `/login` | ✅ | — |
| quiz (unauth) | `/lesson/00000000-0000-0000-0000-000000000000/quiz` | `/login` | `/login` | ✅ | — |

## Invalid-ID friendly fallback assertions
| Case | Requested | Expected text | Status | Issue |
| --- | --- | --- | --- | --- |
| invalid subjectId → friendly fallback | `/subject/ThisSubjectDoesNotExist123` | "No lessons here yet" | ✅ | — |
| invalid lessonId → friendly fallback | `/lesson/00000000-0000-0000-0000-000000000000` | "Quest page was not found" | ✅ | — |
| invalid quiz route → friendly fallback | `/lesson/00000000-0000-0000-0000-000000000000/quiz` | "No Quiz Questions Found" | ❌ | expected text "No Quiz Questions Found" not found. Body preview: AI Tutor Studio SUPER SCHOOL LEARNING PATH Dashboard Subjects Progress Log Out Learning Quest 🚀 Error Loading Quiz Invalid UTF-8 sequence Back to Dashboard |
