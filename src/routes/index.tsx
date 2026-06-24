import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  BookOpen,
  Brain,
  Gamepad2,
  Trophy,
  Sparkles,
  ArrowRight,
  Star,
  Zap,
  Heart,
} from "lucide-react";
import heroImg from "@/assets/hero-illustration.png";

const features = [
  {
    icon: Brain,
    title: "AI-Powered Lessons",
    desc: "Smart lessons that adapt to your child's learning pace with AI-generated content.",
  },
  {
    icon: Gamepad2,
    title: "Interactive Quizzes",
    desc: "Fun MCQ quizzes with instant feedback, timers, and celebration animations.",
  },
  {
    icon: BookOpen,
    title: "CBSE Curriculum",
    desc: "Aligned with CBSE standards for Grades 1-4 covering all core subjects.",
  },
  {
    icon: Trophy,
    title: "Track Progress",
    desc: "Visual progress bars, streak badges, and XP points to keep kids motivated.",
  },
  {
    icon: Sparkles,
    title: "Worksheets",
    desc: "Downloadable practice worksheets with answer keys for offline learning.",
  },
  {
    icon: Zap,
    title: "Story-Based Learning",
    desc: "Every lesson includes a fun story to make concepts memorable and engaging.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "AI Teaching Studio - Smart Learning for Kids" },
      { name: "description", content: "AI-powered CBSE education platform for Grade 1-4 students" },
    ],
  }),
  component: LandingPage,
});

function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-lg">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary">
              <Sparkles className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">
              AI Teaching Studio
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden rounded-xl px-4 py-2 text-sm font-bold text-foreground transition-colors hover:bg-muted sm:inline-flex"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-bold text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-primary/30"
            >
              Sign Up Free <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-16 sm:py-24">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-12 lg:flex-row lg:gap-16">
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            className="flex-1 text-center lg:text-left"
          >
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 text-sm font-bold text-primary">
              <Star className="h-4 w-4" /> CBSE Grades 1-4
            </div>
            <h1 className="font-heading text-4xl font-extrabold leading-tight text-foreground sm:text-5xl lg:text-6xl">
              Learning Made <span className="text-primary">Magical</span> with AI
            </h1>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              Fun, interactive lessons, quizzes, and stories tailored for young minds. Your child's
              smartest study buddy!
            </p>
            <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row lg:justify-start">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-2xl bg-primary px-8 py-4 text-base font-bold text-primary-foreground shadow-xl shadow-primary/20 transition-all hover:scale-105 hover:bg-primary/90"
              >
                Start Learning Free <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-border bg-card px-8 py-4 text-base font-bold text-foreground transition-all hover:bg-muted"
              >
                I already have an account
              </Link>
            </div>
            <div className="mt-6 flex items-center justify-center gap-4 text-sm text-muted-foreground lg:justify-start">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-background bg-accent text-xs font-bold text-accent-foreground"
                  >
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
              </div>
              <span>
                Join <span className="font-bold text-foreground">500+</span> happy learners
              </span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="flex-1"
          >
            <img
              src={heroImg}
              alt="Children learning with AI"
              className="w-full max-w-lg rounded-3xl shadow-2xl lg:max-w-xl"
            />
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="px-4 py-16 sm:py-24">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h2 className="font-heading text-3xl font-bold text-foreground sm:text-4xl">
              Why Kids <Heart className="inline h-6 w-6 text-accent" /> AI Teaching Studio
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Everything your child needs to love learning
            </p>
          </motion.div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -6 }}
                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-lg"
              >
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-bold text-foreground">{f.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-16">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="mx-auto max-w-3xl rounded-3xl bg-primary p-8 text-center sm:p-12"
        >
          <h2 className="font-heading text-2xl font-bold text-primary-foreground sm:text-3xl">
            Ready to Make Learning Fun?
          </h2>
          <p className="mt-3 text-primary-foreground/80">
            Sign up today and give your child the gift of joyful, AI-powered education.
          </p>
          <Link
            to="/signup"
            className="mt-6 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 text-base font-bold text-primary shadow-lg transition-all hover:scale-105"
          >
            Get Started Free <ArrowRight className="h-5 w-5" />
          </Link>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-8">
        <div className="mx-auto max-w-7xl text-center text-sm text-muted-foreground">
          &copy; {new Date().getFullYear()} AI Teaching Studio. Made with{" "}
          <Heart className="inline h-3 w-3 text-accent" /> for young learners.
        </div>
      </footer>
    </div>
  );
}
