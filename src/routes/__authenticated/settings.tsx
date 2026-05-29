import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, Sun, Moon, Laptop, User, GraduationCap, Mail, Save, Loader2 } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const Route = createFileRoute("/__authenticated/settings")({
  head: () => ({
    meta: [
      { title: "Settings - AI Teaching Studio" },
      { name: "description", content: "Customize your dashboard theme and manage your student profile." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  const { theme, setTheme } = useTheme();
  const [profile, setProfile] = useState<any>(null);
  const [name, setName] = useState("");
  const [grade, setGrade] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function loadProfile() {
      try {
        setLoading(true);
        const { data: userData, error: userErr } = await supabase.auth.getUser();
        if (userErr) throw userErr;
        if (!userData?.user) return;

        setEmail(userData.user.email || "");

        const { data: profileData, error: profileErr } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", userData.user.id)
          .single();
        if (profileErr) throw profileErr;
        
        setProfile(profileData);
        setName(profileData.name || "");
        setGrade(String(profileData.grade || 1));
      } catch (err: any) {
        console.error(err);
        toast.error(err.message || "Failed to load profile settings");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  async function handleSaveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please enter your name");
      return;
    }
    setSaving(true);
    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData?.user) throw new Error("No active session");

      const { error } = await supabase
        .from("profiles")
        .update({
          name: name.trim(),
          grade: parseInt(grade),
        })
        .eq("id", userData.user.id);

      if (error) throw error;
      toast.success("Profile saved! Great job! 🌟");
    } catch (err: any) {
      toast.error(err.message || "Failed to save profile");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 sm:p-6 lg:p-8 bg-gradient-to-tr from-slate-50 via-indigo-50/30 to-slate-100 dark:from-[#0F172A] dark:via-[#1E1B4B] dark:to-[#1E293B]">
      <div className="mx-auto max-w-3xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 dark:bg-indigo-500/20 border border-indigo-500/20 px-3 py-1 text-xs font-black text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
            <Sparkles className="h-3.5 w-3.5" /> Customize your Studio
          </span>
          <h1 className="mt-3 font-heading text-3xl font-black text-slate-800 dark:text-white tracking-tight leading-tight">
            Settings Arena ⚙️
          </h1>
          <p className="mt-2 text-slate-600 dark:text-white/60 font-semibold">
            Choose your learning theme and manage your champion profile!
          </p>
        </motion.div>

        <div className="grid gap-6 md:grid-cols-3">
          {/* Main Settings Card */}
          <div className="md:col-span-2 space-y-6">
            {/* Theme Picker */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md p-6 shadow-md dark:shadow-none"
            >
              <h2 className="font-heading text-xl font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span>Choose Your Theme 🎨</span>
              </h2>
              
              <div className="grid grid-cols-3 gap-4">
                {/* Light */}
                <button
                  type="button"
                  onClick={() => {
                    setTheme("light");
                    toast.success("Day Mode activated! ☀️");
                  }}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl p-4 border-2 transition-all duration-300 cursor-pointer ${
                    theme === "light"
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                      : "border-slate-200 dark:border-white/5 hover:border-indigo-200 dark:hover:border-white/10 bg-slate-50 dark:bg-white/5"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-500/10 text-orange-500 shadow-sm">
                    <Sun className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-white">Light Mode</span>
                  {theme === "light" && (
                    <div className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  )}
                </button>

                {/* Dark */}
                <button
                  type="button"
                  onClick={() => {
                    setTheme("dark");
                    toast.success("Night Mode activated! 🌙");
                  }}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl p-4 border-2 transition-all duration-300 cursor-pointer ${
                    theme === "dark"
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                      : "border-slate-200 dark:border-white/5 hover:border-indigo-200 dark:hover:border-white/10 bg-slate-50 dark:bg-white/5"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 shadow-sm">
                    <Moon className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-white">Dark Mode</span>
                  {theme === "dark" && (
                    <div className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  )}
                </button>

                {/* System */}
                <button
                  type="button"
                  onClick={() => {
                    setTheme("system");
                    toast.success("Synced with System Default! 💻");
                  }}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl p-4 border-2 transition-all duration-300 cursor-pointer ${
                    theme === "system"
                      ? "border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20"
                      : "border-slate-200 dark:border-white/5 hover:border-indigo-200 dark:hover:border-white/10 bg-slate-50 dark:bg-white/5"
                  }`}
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-500/10 text-purple-500 dark:text-purple-400 shadow-sm">
                    <Laptop className="h-6 w-6" />
                  </div>
                  <span className="text-xs font-black text-slate-800 dark:text-white">System</span>
                  {theme === "system" && (
                    <div className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-indigo-500" />
                  )}
                </button>
              </div>
            </motion.div>

            {/* Profile Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md p-6 shadow-md dark:shadow-none"
            >
              <h2 className="font-heading text-xl font-black text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                <span>Profile Info 🏆</span>
              </h2>

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest mb-1.5">
                    <User className="h-3.5 w-3.5" /> Full Name
                  </Label>
                  <Input
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Enter your name"
                    className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold shadow-sm"
                  />
                </div>

                <div>
                  <Label className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest mb-1.5">
                    <GraduationCap className="h-3.5 w-3.5" /> Grade Level
                  </Label>
                  <Select value={grade} onValueChange={setGrade}>
                    <SelectTrigger className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/5 font-bold shadow-sm">
                      <SelectValue placeholder="Select Grade" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-[#1E1B4B]">
                      <SelectItem value="1" className="font-bold">Grade 1</SelectItem>
                      <SelectItem value="2" className="font-bold">Grade 2</SelectItem>
                      <SelectItem value="3" className="font-bold">Grade 3</SelectItem>
                      <SelectItem value="4" className="font-bold">Grade 4</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="email" className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-white/40 uppercase tracking-widest mb-1.5">
                    <Mail className="h-3.5 w-3.5" /> Email (Read-Only)
                  </Label>
                  <Input
                    id="email"
                    value={email}
                    disabled
                    className="rounded-xl border border-slate-200 dark:border-white/5 bg-slate-100 dark:bg-white/5 font-bold opacity-60 cursor-not-allowed"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full rounded-2xl py-6 font-black bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-md transform hover:-translate-y-0.5 transition-all text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    <>
                      <Save className="h-4.5 w-4.5" /> Save Champion Profile
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>

          {/* Quick Tips Side Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="rounded-3xl border border-slate-200/80 dark:border-white/10 bg-white dark:bg-white/5 backdrop-blur-md p-5 shadow-lg dark:shadow-none space-y-4 relative overflow-hidden"
          >
            <div className="absolute -left-12 -top-12 w-28 h-28 bg-gradient-to-br from-indigo-500 to-pink-500 rounded-full opacity-10 blur-xl" />
            <h2 className="font-heading text-lg font-black text-slate-800 dark:text-white tracking-tight flex items-center gap-2">
              <Sparkles className="h-4.5 w-4.5 text-yellow-500" />
              <span>Learning Tips</span>
            </h2>

            <div className="space-y-3.5 text-xs font-bold text-slate-600 dark:text-white/70">
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-transparent">
                ☀️ <strong>Day Mode:</strong> Perfect for morning studies and high-sun environments to stay focused and active.
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-transparent">
                🌙 <strong>Night Mode:</strong> Soft warm colors ideal for evening review sessions before sleeping.
              </div>
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-100 dark:border-transparent">
                ⚙️ <strong>Keep Details Fresh:</strong> Keep your Grade level correct to get customized learning content matched exactly to your school level.
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
