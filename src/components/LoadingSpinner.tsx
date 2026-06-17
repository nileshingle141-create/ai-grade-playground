import { Loader2 } from "lucide-react";

type Props = {
  label?: string;
  fullScreen?: boolean;
  className?: string;
};

export function LoadingSpinner({ label, fullScreen = false, className = "" }: Props) {
  const wrapper = fullScreen
    ? "flex min-h-screen items-center justify-center bg-gradient-to-tr from-slate-50 via-indigo-50/30 to-slate-100 dark:from-[#0F172A] dark:via-[#1E1B4B] dark:to-[#1E293B]"
    : "flex items-center justify-center py-8";
  return (
    <div className={`${wrapper} ${className}`}>
      <div className="flex flex-col items-center gap-3">
        <div className="relative">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 blur-md opacity-40 animate-pulse" />
          <Loader2 className="relative h-9 w-9 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
        {label && (
          <p className="text-xs font-black uppercase tracking-widest text-slate-500 dark:text-white/60">
            {label}
          </p>
        )}
      </div>
    </div>
  );
}
