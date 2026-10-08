"use client";

import { motion } from "framer-motion";

export function ErrorMessage({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      className="text-sm text-red-600 bg-red-50 border border-red-200 p-3 rounded-xl"
    >
      {message}
    </motion.p>
  );
}
