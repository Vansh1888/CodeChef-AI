"use client";

import { Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  loading: boolean;
}

export function ChatInput({ value, onChange, onSubmit, loading }: ChatInputProps) {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="flex gap-2"
    >
      <Input
        type="text"
        placeholder="Chat with Chef Mario about recipes, techniques, or ingredients..."
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="flex-1 bg-white/80 border-beige-300 text-warm-brown placeholder:text-beige-500 focus-visible:ring-terracotta/30 focus-visible:border-terracotta rounded-xl px-4 py-3 text-sm"
      />
      <Button
        type="submit"
        disabled={loading || !value.trim()}
        className="px-5 bg-terracotta hover:bg-terracotta-light text-white font-semibold rounded-xl transition-all cursor-pointer shadow-sm hover:shadow-md hover:shadow-terracotta/20"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </Button>
    </form>
  );
}
