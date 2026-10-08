"use client";

import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-beige-200 text-terracotta border border-terracotta/20">
        <ChefHat className="w-4 h-4" />
      </div>
      <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            className="w-2 h-2 bg-terracotta/60 rounded-full"
            animate={{ y: [0, -6, 0] }}
            transition={{
              duration: 0.5,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          />
        ))}
        <span className="ml-2 text-xs text-warm-brown-light italic">
          Chef Mario is crafting his response...
        </span>
      </div>
    </div>
  );
}
