# AI Teaching Studio

An AI-powered CBSE education platform built for Grade 1–4 students. Features interactive lessons, gamified quizzes, story-based learning, progress tracking with XP/streaks, and an AI tutor chat — all wrapped in a delightful, child-friendly UI.

![Tech Stack](https://img.shields.io/badge/TanStack%20Start-v1-blue)
![React](https://img.shields.io/badge/React-19-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.8-3178C6?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v4-06B6D4?logo=tailwindcss)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase)

---

## Features

- **AI-Generated Lessons** — Admins generate comprehensive, story-based lessons via an AI webhook (Make.com). Topics, quizzes, and worksheets are auto-created and editable before publishing.
- **Interactive Quizzes** — Multiple-choice quizzes with instant answer checking, timers, and score calculation. Results sync to the student's progress.
- **Gamified Dashboard** — Duolingo/BYJU'S-inspired progress tracking with XP points, daily streaks, accuracy scores, and a live leaderboard.
- **Story-Based Learning** — Every lesson includes a child-friendly story to make concepts memorable and engaging.
- **Progress Arena** — Visual activity logs, completion badges, and per-subject progress bars.
- **Worksheets** — Downloadable practice worksheets with auto-generated answer keys for offline learning.
- **AI Tutor Chat** — Context-aware AI tutor that knows the current lesson subject, topic, and content to help students in real time.
- **Dark/Light Mode** — Full theme toggle with smooth transitions.
- **Role-Based Access** — Separate student and admin experiences with secure role checks.
- **Mobile-First Responsive** — Optimized for tablets and phones with a custom mobile navigation.

---

## Tech Stack

| Layer              | Technology                                                                                                            |
| ------------------ | --------------------------------------------------------------------------------------------------------------------- |
| Framework          | [TanStack Start v1](https://tanstack.com/start) — full-stack React with SSR, file-based routing, and server functions |
| UI Library         | React 19 + TypeScript                                                                                                 |
| Styling            | Tailwind CSS v4 + custom semantic design tokens (`oklch`)                                                             |
| Components         | [shadcn/ui](https://ui.shadcn.com) (Radix UI primitives)                                                              |
| Animation          | Framer Motion                                                                                                         |
| Backend / Database | Supabase (PostgreSQL + Auth + RLS)                                                                                    |
| Server Runtime     | Cloudflare Workers (edge) via `@cloudflare/vite-plugin`                                                               |
| Validation         | Zod                                                                                                                   |
| AI Integration     | Make.com webhook for content generation                                                                               |
| Icons              | Lucide React                                                                                                          |
| Charts             | Recharts                                                                                                              |
| Carousel           | Embla Carousel                                                                                                        |

---

## Project Structure

```
├── src/
│   ├── routes/                    # File-based routes (TanStack Router)
│   │   ├── index.tsx              # Landing page
│   │   ├── login.tsx              # Auth login
│   │   ├── signup.tsx             # Auth signup
│   │   ├── admin.tsx              # Admin content generator
│   │   ├── __authenticated.tsx    # Protected layout (sidebar, nav, AI chat)
│   │   ├── __authenticated/
│   │   │   ├── dashboard.tsx      # Student gamified dashboard
│   │   │   ├── subjects.tsx       # Subject browser
│   │   │   ├── subject.$subjectId.tsx   # Lessons per subject
│   │   │   ├── lesson.$lessonId.tsx      # Lesson reader
│   │   │   ├── lesson.$lessonId.quiz.tsx  # Interactive quiz
│   │   │   └── progress.tsx       # Progress tracker
│   │   └── __root.tsx            # Root layout (HTML shell)
│   ├── components/
│   │   ├── ui/                    # shadcn/ui components
│   │   ├── AppSidebar.tsx         # Desktop sidebar navigation
│   │   ├── MobileNav.tsx          # Mobile bottom navigation
│   │   └── AITutorChat.tsx        # Context-aware AI tutor chatbot
│   ├── lib/
│   │   ├── admin.functions.ts     # Admin server functions (content gen, save)
│   │   ├── auth.functions.ts      # Auth server functions (sign up, sign in, sign out)
│   │   └── lessons.functions.ts   # Lesson/quiz/progress server functions
│   ├── integrations/
│   │   └── supabase/
│   │       ├── client.ts          # Browser Supabase client
│   │       ├── client.server.ts   # Admin/service-role client (server only)
│   │       ├── auth-middleware.ts # Auth guard for server functions
│   │       └── auth-attacher.ts   # Attaches auth header to RPC calls
│   ├── router.tsx                 # TanStack Router setup
│   ├── server.ts                  # SSR entry / error wrapper
│   ├── start.ts                   # TanStack Start instance config
│   └── styles.css                 # Tailwind + design tokens
├── supabase/
│   └── config.toml                # Supabase project config
├── .env                           # Environment variables (auto-managed)
├── vite.config.ts                 # Vite + TanStack Start config
├── wrangler.jsonc                 # Cloudflare Workers config
└── package.json
```

---

## Database Schema (Supabase)

| Table              | Purpose                                                                |
| ------------------ | ---------------------------------------------------------------------- |
| `profiles`         | Extended user data (name, grade)                                       |
| `subjects`         | CBSE subjects per grade (Math, English, Science, EVS, Hindi, Computer) |
| `lessons`          | AI-generated lesson content, stories, key points, duration             |
| `quizzes`          | MCQ questions linked to lessons (options A–D + correct answer)         |
| `worksheets`       | Practice worksheet content + answer key                                |
| `student_progress` | Tracks completion, score, and time spent per student/lesson            |
| `user_roles`       | Role-based access control (`admin`, `user`)                            |

All tables use Row Level Security (RLS) with policies scoped to `auth.uid()`. Admin functions bypass RLS via the service-role client.

---

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) 18+ or [Bun](https://bun.sh)
- A Supabase project (or [Lovable Cloud](https://lovable.dev) backend)
- A Make.com webhook URL for AI content generation (optional — admin feature)

### Installation

```bash
# Clone the repo
git clone https://github.com/yourusername/ai-teaching-studio.git
cd ai-teaching-studio

# Install dependencies
bun install
# or
npm install
```

### Environment Variables

The project uses a `.env` file with the following variables (auto-configured when using Lovable Cloud):

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key
VITE_SUPABASE_PROJECT_ID=your-project-id
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-key
```

> **Note:** `SUPABASE_SERVICE_ROLE_KEY` is read server-side via `process.env` and should never be exposed to the client.

### Run Locally

```bash
# Start the dev server
bun dev
# or
npm run dev
```

The app will be available at `http://localhost:3000`.

### Build for Production

```bash
bun run build
# or
npm run build
```

This produces a Cloudflare Workers-compatible bundle.

---

## Key Design Decisions

1. **File-Based Routing** — TanStack Router's flat, dot-separated convention keeps the route tree declarative and type-safe (`lesson.$lessonId.quiz.tsx` → `/lesson/:lessonId/quiz`).
2. **Server Functions over Edge Functions** — All backend logic lives in `createServerFn` handlers inside the app codebase, co-located with the frontend and deployed as part of the same Cloudflare Worker bundle.
3. **Semantic Design Tokens** — Colors, spacing, and surfaces are defined as CSS custom properties in `src/styles.css` using `oklch` for consistent theming across light and dark modes.
4. **Gamification Engine** — XP, streaks, and leaderboard are computed client-side from `student_progress` data, making the experience feel instant without extra backend endpoints.
5. **Security-First RLS** — Every user-facing table has strict RLS policies. Admin operations use a service-role client after verifying the `admin` role via the `has_role` RPC function.

---

## Admin Workflow

1. Navigate to `/admin` (requires `admin` role).
2. Select **Grade**, **Subject**, **Duration**, and enter a **Topic**.
3. Click **Generate Content** — the Make.com webhook calls an AI service and returns a lesson, quiz, worksheet, and answer key.
4. Review and edit the generated content in the preview tabs.
5. Click **Save to Database** — the lesson and quizzes are persisted and immediately available to students.

---

## Scripts

| Script  | Command           | Description                             |
| ------- | ----------------- | --------------------------------------- |
| Dev     | `bun dev`         | Start Vite dev server with HMR          |
| Build   | `bun run build`   | Production build for Cloudflare Workers |
| Preview | `bun run preview` | Preview production build locally        |
| Lint    | `bun run lint`    | ESLint check                            |
| Format  | `bun run format`  | Prettier format all files               |

---

## License

[MIT](LICENSE)

---

## Acknowledgements

Built with [Lovable](https://lovable.dev), [TanStack](https://tanstack.com), [Supabase](https://supabase.com), and [shadcn/ui](https://ui.shadcn.com).
