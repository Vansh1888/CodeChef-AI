"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { springBounce } from "@/lib/animations";

export function Header() {
  return (
    <header className="text-center space-y-4 pt-4 pb-2">
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springBounce, delay: 0 }}
        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-terracotta-muted border border-terracotta/20 text-terracotta text-xs font-semibold tracking-wide uppercase"
      >
        <Sparkles className="w-3.5 h-3.5" /> Next-Gen Culinary Intelligence
      </motion.div>

      <motion.h1
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springBounce, delay: 0.08 }}
        className="text-5xl md:text-6xl font-heading font-extrabold tracking-tight bg-gradient-to-r from-terracotta via-warm-brown to-terracotta-light bg-clip-text text-transparent"
      >
        SmartChef AI
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springBounce, delay: 0.16 }}
        className="text-warm-brown-light max-w-xl mx-auto text-sm"
      >
        Autonomous vision-guided kitchen orchestration powered by Multi-Agent Pipelines &amp; Vector RAG Memory.
      </motion.p>
    </header>
  );
}
