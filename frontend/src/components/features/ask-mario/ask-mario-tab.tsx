"use client";

import { useRef, useEffect } from "react";
import { ChefHat } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { TypingIndicator } from "./typing-indicator";

type ChatMsg = { role: "user" | "assistant"; content: string };

interface AskMarioTabProps {
  chatHistory: ChatMsg[];
  askPrompt: string;
  setAskPrompt: (v: string) => void;
  loadingAsk: boolean;
  handleAskChef: () => void;
}

export function AskMarioTab({
  chatHistory,
  askPrompt,
  setAskPrompt,
  loadingAsk,
  handleAskChef,
}: AskMarioTabProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  return (
    <div className="glass-strong rounded-2xl p-6 space-y-4 shadow-sm">
      <h2 className="text-lg font-heading font-bold text-warm-brown flex items-center gap-2">
        <ChefHat className="w-5 h-5 text-terracotta" /> Conversational Chef Assistant
      </h2>

      <div className="bg-beige-50/80 border border-beige-300/60 rounded-2xl p-4 h-[440px] overflow-y-auto space-y-4">
        {chatHistory.map((msg, idx) => (
          <ChatMessage key={idx} role={msg.role} content={msg.content} />
        ))}
        {loadingAsk && chatHistory[chatHistory.length - 1]?.content === "" && (
          <TypingIndicator />
        )}
        <div ref={bottomRef} />
      </div>

      <ChatInput
        value={askPrompt}
        onChange={setAskPrompt}
        onSubmit={handleAskChef}
        loading={loadingAsk}
      />
    </div>
  );
}
