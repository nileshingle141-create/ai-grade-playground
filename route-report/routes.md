# Route smoke test report

Generated: 2026-06-20T07:03:07.150Z

| Route | Access | Dynamic | Registered | Expected behavior | Status | Issues |
| --- | --- | --- | --- | --- | --- | --- |
| `/` | public | no | ✅ | renders directly | ✅ ok | — |
| `/login` | public | no | ✅ | renders directly | ✅ ok | — |
| `/signup` | public | no | ✅ | renders directly | ✅ ok | — |
| `/admin` | public | no | ✅ | renders directly | ✅ ok | — |
| `/__authenticated/dashboard` | authenticated | no | ✅ | /login (when signed out) | ✅ ok | — |
| `/__authenticated/subjects` | authenticated | no | ✅ | /login (when signed out) | ✅ ok | — |
| `/__authenticated/progress` | authenticated | no | ✅ | /login (when signed out) | ✅ ok | — |
| `/__authenticated/subject/$subjectId` | authenticated | yes | ✅ | /login (when signed out) | ✅ ok | — |
| `/__authenticated/lesson/$lessonId` | authenticated | yes | ✅ | /login (when signed out) | ✅ ok | — |
| `/__authenticated/lesson/$lessonId/quiz` | authenticated | yes | ✅ | /login (when signed out) | ✅ ok | — |
