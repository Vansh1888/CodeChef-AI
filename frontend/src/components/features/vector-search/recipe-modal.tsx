"use client";

import ReactMarkdown from "react-markdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Utensils } from "lucide-react";
import type { SearchResultItem } from "@/lib/api";

interface RecipeModalProps {
  recipe: SearchResultItem | null;
  onClose: () => void;
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

export function RecipeModal({ recipe, onClose }: RecipeModalProps) {
  return (
    <Dialog open={!!recipe} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto bg-white border-beige-300">
        <DialogHeader>
          <DialogTitle className="font-heading font-bold text-terracotta flex items-center gap-2">
            <Utensils className="w-5 h-5" /> {recipe?.title}
          </DialogTitle>
        </DialogHeader>

        <div className="text-sm text-warm-brown leading-relaxed space-y-3 pt-2">
          <ReactMarkdown>{renderMarkdownContent(recipe?.recipe_text)}</ReactMarkdown>
        </div>

        <div className="pt-4 border-t border-beige-300 flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            className="border-beige-300 text-warm-brown hover:bg-beige-100 cursor-pointer"
          >
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
