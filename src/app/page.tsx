import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowRight, Sparkles, Layers, Zap, Users } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#050b0a] dark:text-slate-100 selection:bg-emerald-500/20 dark:selection:bg-emerald-500/30 overflow-x-hidden transition-colors duration-300">
      {/* Background Glow Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[500px] bg-gradient-to-b from-emerald-500/5 via-teal-500/5 to-transparent dark:from-emerald-500/10 dark:via-teal-500/5 blur-3xl pointer-events-none" />

      <main className="max-w-6xl mx-auto px-6 pt-20 pb-24 relative z-10">
        {/* --- HERO SECTION --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center mb-24">
          <div className="lg:col-span-7 space-y-6 text-left">
            {/* Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 text-xs font-medium text-emerald-700 dark:text-emerald-300">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>The Next Generation of Workspace</span>
            </div>

            <h1 className="text-5xl sm:text-6xl font-black tracking-tight leading-[1.1] text-slate-900 dark:text-white">
              Where teams align. <br />
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 dark:from-emerald-400 dark:via-teal-400 dark:to-cyan-400 bg-clip-text text-transparent">
                Nexus happens.
              </span>
            </h1>

            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-xl font-normal leading-relaxed">
              An interconnected workspace designed for real-time collaboration,
              fluid document hierarchy, and frictionless building.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              <Link href="/auth/register">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white dark:text-slate-950 font-semibold shadow-lg shadow-emerald-600/10 dark:shadow-emerald-500/10 px-8 transition-all duration-200"
                >
                  Get Started Free
                  <ArrowRight className="w-4 h-4 ml-2 opacity-80" />
                </Button>
              </Link>
              <Link href="/auth/login">
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto bg-white hover:bg-slate-50 text-slate-700 border-slate-200 dark:variant-ghost dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-900/50 dark:border-slate-800 px-8"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>

          {/* Interactive Visual Element */}
          <div className="lg:col-span-5 relative hidden lg:block">
            <div className="w-full aspect-square rounded-2xl bg-white border border-slate-200 dark:bg-gradient-to-br dark:from-slate-900 dark:to-[#09110f] dark:border-slate-800/80 p-6 shadow-xl dark:shadow-2xl relative overflow-hidden group">
              <div className="absolute top-0 left-0 right-0 h-8 bg-slate-50 dark:bg-slate-900/80 border-b border-slate-200 dark:border-slate-800/60 flex items-center px-4 gap-2">
                <div className="w-2.5 h-2.5 rounded-full bg-red-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/40" />
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/40" />
                <span className="text-[10px] text-slate-400 dark:text-slate-500 ml-2 font-mono">
                  nexus_main_doc.md
                </span>
              </div>
              <div className="mt-8 space-y-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                <p className="text-emerald-600 dark:text-emerald-400 font-semibold dark:font-normal">
                  # Project Roadmap
                </p>
                <div className="pl-4 border-l border-emerald-200 dark:border-emerald-500/20 space-y-2">
                  <p className="text-teal-600 dark:text-teal-400">
                    ## Phase 1: Architecture
                  </p>
                  <p className="text-slate-400 dark:text-slate-500">
                    └─ Fully nested documentation tree
                  </p>
                  <p className="text-cyan-600 dark:text-cyan-400">
                    ## Phase 2: Live Sync Active
                  </p>
                </div>
                <div className="h-20 w-full rounded bg-slate-50 border border-slate-100 dark:bg-slate-950/40 dark:border-slate-800/60 p-3 flex items-center justify-between">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400">
                    Amanuel joined the canvas
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-500/20 dark:text-emerald-400 text-[10px] font-medium dark:font-normal">
                    Live
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- ASYMMETRIC BENTO GRID FEATURE SECTION --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Feature 1: Big Highlight Card */}
          <div className="md:col-span-2 group relative rounded-2xl bg-white border border-slate-200 dark:bg-gradient-to-b dark:from-slate-900 dark:to-[#070f0d] dark:border-slate-800/80 p-8 hover:border-emerald-300 dark:hover:border-emerald-500/20 transition-all duration-300 flex flex-col justify-between overflow-hidden shadow-sm dark:shadow-none">
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-emerald-500/[0.03] dark:bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/[0.06] dark:group-hover:bg-emerald-500/10 transition-all" />
            <div>
              <div className="w-10 h-10 rounded-lg bg-emerald-50 border border-emerald-100 dark:bg-emerald-500/10 dark:border-emerald-500/20 flex items-center justify-center mb-6">
                <Users className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Real-time Collaboration
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm max-w-md leading-relaxed">
                Work side-by-side with your team. Live multi-user text editing,
                instant cursor presence, and instant global state
                synchronization.
              </p>
            </div>
            <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-900 text-xs text-emerald-600 dark:text-emerald-400 font-mono flex items-center gap-2">
              <span>⚡ Zero lag conflicts handled</span>
            </div>
          </div>

          {/* Feature 2: Tall/Standard Card */}
          <div className="group relative rounded-2xl bg-white border border-slate-200 dark:bg-gradient-to-b dark:from-slate-900 dark:to-[#070f0d] dark:border-slate-800/80 p-8 hover:border-teal-300 dark:hover:border-teal-500/20 transition-all duration-300 flex flex-col justify-between shadow-sm dark:shadow-none">
            <div>
              <div className="w-10 h-10 rounded-lg bg-teal-50 border border-teal-100 dark:bg-teal-500/10 dark:border-teal-500/20 flex items-center justify-center mb-6">
                <Layers className="w-5 h-5 text-teal-600 dark:text-teal-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                Infinite Nesting
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Break free from rigid folders. Nest documents within documents
                infinitely to structure thoughts perfectly.
              </p>
            </div>
          </div>

          {/* Feature 3: Full Width Banner Style Card */}
          <div className="md:col-span-3 group relative rounded-2xl bg-white border border-slate-200 dark:bg-gradient-to-b dark:from-slate-900 dark:to-[#070f0d] dark:border-slate-800/80 p-8 hover:border-cyan-300 dark:hover:border-cyan-500/20 transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm dark:shadow-none">
            <div className="space-y-2 max-w-xl">
              <div className="w-10 h-10 rounded-lg bg-cyan-50 border border-cyan-100 dark:bg-cyan-500/10 dark:border-cyan-500/20 flex items-center justify-center mb-4 md:mb-2">
                <Zap className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Rich Text Editor & Slash Commands
              </h3>
              <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed">
                Type{" "}
                <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-xs font-mono text-slate-700 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300">
                  /
                </kbd>{" "}
                to invoke media embeds, markdown blocks, layout controls, and
                custom integrations dynamically.
              </p>
            </div>
            <div className="flex-shrink-0 bg-slate-50 border border-slate-200 dark:bg-slate-950/60 dark:border-slate-800 rounded-lg px-4 py-3 font-mono text-xs text-slate-500">
              Press{" "}
              <span className="text-cyan-600 dark:text-cyan-400 font-medium dark:font-normal">
                /heading
              </span>{" "}
              for fast titles
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
