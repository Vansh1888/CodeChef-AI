"use client";

import { motion } from "framer-motion";
import { ChefHat } from "lucide-react";

export function LoadingSpinner({ text }: { text?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <motion.div
        animate={{ y: [0, -8, 0] }}
        transition={{ duration: 1.2, repeat: Infinity, ease: "easeInOut" }}
      >
        <ChefHat className="w-8 h-8 text-terracotta" />
      </motion.div>
      {text && (
        <p className="text-sm text-warm-brown-light italic">{text}</p>
      )}
    </div>
  );
}
