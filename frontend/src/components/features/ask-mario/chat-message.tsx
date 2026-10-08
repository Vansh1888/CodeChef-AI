"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { ChefHat, User } from "lucide-react";
import { chatMessageEntrance, springGentle } from "@/lib/animations";

interface ChatMessageProps {
  role: "user" | "assistant";
  content: string;
}

export function ChatMessage({ role, content }: ChatMessageProps) {
  const isUser = role === "user";

  return (
    <motion.div
      variants={chatMessageEntrance}
      initial="initial"
      animate="animate"
      transition={springGentle}
      className={`flex items-start gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
    >
      <div
        className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-xs ${
          isUser
            ? "bg-terracotta text-white border-terracotta-light"
            : "bg-beige-200 text-terracotta border-terracotta/20"
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <ChefHat className="w-4 h-4" />}
      </div>

      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed space-y-1 shadow-sm ${
          isUser
            ? "bg-terracotta text-white rounded-tr-sm"
            : "glass rounded-tl-sm text-warm-brown"
        }`}
      >
        <ReactMarkdown>{content || ""}</ReactMarkdown>
      </div>
    </motion.div>
  );
}
