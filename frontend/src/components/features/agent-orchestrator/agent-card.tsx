"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { scaleBounce, springBounce, springGentle } from "@/lib/animations";
import { Separator } from "@/components/ui/separator";
import type { LucideIcon } from "lucide-react";

interface AgentCardProps {
  title: string;
  icon: LucideIcon;
  accentColor: string;
  bgTint: string;
  borderAccent: string;
  content: string;
  actions?: React.ReactNode;
  delay?: number;
}

function renderMarkdownContent(content: any): string {
  if (!content) return "";
  let str = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  str = str.replace(/\\n/g, "\n").replace(/\\"/g, '"');
  if (str.includes('"signature":')) {
    str = str.split('"signature":')[0].replace(/,\s*"extras":\s*\{?\s*$/, "");
  }
  return str;
}

export function AgentCard({
  title,
  icon: Icon,
  accentColor,
  bgTint,
  borderAccent,
  content,
  actions,
  delay = 0,
}: AgentCardProps) {
  return (
    <motion.div
      variants={scaleBounce}
      initial="initial"
      animate="animate"
      transition={{ ...springBounce, delay }}
      whileHover={{ y: -2, boxShadow: "0 12px 40px rgba(0,0,0,0.06)" }}
      className={`${bgTint} border ${borderAccent} rounded-2xl p-5 space-y-4 shadow-sm border-l-4`}
    >
      <div className="flex justify-between items-center">
        <h3 className={`font-heading font-bold ${accentColor} flex items-center gap-2 text-sm`}>
          <Icon className="w-4 h-4" /> {title}
        </h3>
        {actions}
      </div>

      <Separator className="bg-beige-300/40" />

      <div className="text-sm text-warm-brown space-y-2 leading-relaxed max-h-[400px] overflow-y-auto pr-2">
        <ReactMarkdown>{renderMarkdownContent(content)}</ReactMarkdown>
      </div>
    </motion.div>
  );
}
