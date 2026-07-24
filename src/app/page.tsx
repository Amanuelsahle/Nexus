import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  FileText,
  Sparkles,
  Command,
  FolderTree,
  Users2,
} from "lucide-react";

// Import your custom background image
import bgImage from "@/image/homepage background.png";

export default function Home() {
  return (
    <div className="relative min-h-screen text-slate-900 dark:text-slate-100 selection:bg-emerald-500/20 transition-colors duration-300 overflow-hidden">
      {/* --- BACKGROUND IMAGE WITH OVERLAYS --- */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        <Image
          src={bgImage}
          alt="Homepage Background"
          fill
          priority
          className="object-cover object-center opacity-60 dark:opacity-35"
        />
        {/* Gradient overlays to ensure text readability */}
        <div className="absolute inset-0 bg-gradient-to-b from-white/60 via-white/30 to-white dark:from-[#07090e]/50 dark:via-[#07090e]/30 dark:to-[#07090e]/70" />
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <main className="max-w-6xl mx-auto px-6 pt-16 pb-24 relative z-10">
        {/* --- HERO SECTION --- */}
        <div className="text-center max-w-3xl mx-auto space-y-6 pt-8 mb-16">
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
            Think, write, and structure —{" "}
            <span className="underline decoration-emerald-500 decoration-4 underline-offset-8">
              without boundaries
            </span>
            .
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto">
            A minimalist workspace combining nested documentation, live
            multiplayer editing, and instant keyboard workflows into one fluid
            canvas.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center pt-4">
            <Link href="/auth/register" className="w-full sm:w-auto">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md px-8 h-12 rounded-xl transition-all"
              >
                Start Writing Free
                <ArrowRight className="w-4 h-4 ml-2 opacity-80" />
              </Button>
            </Link>
            <Link href="/auth/login" className="w-full sm:w-auto">
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto bg-white/50 dark:bg-slate-900/50 backdrop-blur-md text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 px-8 h-12 rounded-xl"
              >
                Sign In
              </Button>
            </Link>
          </div>
        </div>

        {/* --- PRODUCT SHOWCASE CANVAS --- */}
        <div className="relative mx-auto mb-28 max-w-4xl rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-950/70 backdrop-blur-xl shadow-2xl p-4 sm:p-6">
          {/* Top Mock Window Bar */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-200/60 dark:border-slate-800/80 mb-6">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-400/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-400/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/80" />
            </div>
            <div className="flex items-center gap-2 text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100/80 dark:bg-slate-900/80 px-3 py-1 rounded-md border border-slate-200/50 dark:border-slate-800">
              <FileText className="w-3.5 h-3.5 text-emerald-500" />
              <span>Q3 Engineering Specs</span>
            </div>
            <div className="flex items-center gap-2">
              {/* Active User Avatars */}
              <div className="flex -space-x-1.5">
                <span className="w-6 h-6 rounded-full bg-emerald-500 border-2 border-white dark:border-slate-950 flex items-center justify-center text-[10px] font-bold text-white">
                  AM
                </span>
                <span className="w-6 h-6 rounded-full bg-teal-500 border-2 border-white dark:border-slate-950 flex items-center justify-center text-[10px] font-bold text-white">
                  SK
                </span>
              </div>
            </div>
          </div>

          {/* Editor Canvas Mock Content */}
          <div className="space-y-4 px-2 sm:px-6 py-2">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
              🚀 Infrastructure Migration Plan
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
              We are shifting our state sync engine to real-time CRDTs to reduce
              latency across collaborative sessions to{" "}
              <span className="bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 font-mono px-1.5 py-0.5 rounded text-xs">
                &lt; 15ms
              </span>{" "}
              globally.
            </p>

            {/* Slash Command Popover Mock */}
            <div className="mt-4 p-3 rounded-xl border border-emerald-500/30 bg-emerald-50/70 dark:bg-emerald-950/40 backdrop-blur-md max-w-sm shadow-lg">
              <div className="text-[11px] font-mono text-emerald-700 dark:text-emerald-400 font-semibold mb-2 flex items-center gap-1.5">
                <Command className="w-3.5 h-3.5" /> Directives Menu
              </div>
              <div className="space-y-1">
                <div className="flex items-center justify-between text-xs p-1.5 rounded bg-emerald-600 text-white font-medium">
                  <span>/nested-doc</span>
                  <span className="text-[10px] opacity-75">
                    Create linked sub-document
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs p-1.5 text-slate-600 dark:text-slate-400">
                  <span>/code-block</span>
                  <span className="text-[10px]">
                    Syntax highlighted snippet
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- KEY FEATURE CARDS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md space-y-3">
            <div className="w-9 h-9 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Users2 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Multiplayer Sync Engine
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Every keystroke, highlight, and cursor movement renders smoothly
              across teams with conflict-free state resolution.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md space-y-3">
            <div className="w-9 h-9 rounded-lg bg-teal-100 dark:bg-teal-500/10 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <FolderTree className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Infinite Document Trees
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Organize complex knowledge bases intuitively by nesting pages
              directly inside sentences and blocks.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-white/60 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-md space-y-3">
            <div className="w-9 h-9 rounded-lg bg-cyan-100 dark:bg-cyan-500/10 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <Command className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white">
              Keyboard-Driven Editing
            </h3>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
              Never touch your mouse. Invoke formatting, media embeds, and block
              movements directly via extensible slash commands.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
