"use client";

import { motion } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { Database, Search, Loader2, Eye, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { RecipeModal } from "./recipe-modal";
import { scaleBounce, springBounce, springGentle } from "@/lib/animations";
import type { SearchResultItem } from "@/lib/api";

interface VectorSearchTabProps {
  searchQuery: string;
  setSearchQuery: (v: string) => void;
  searchResults: SearchResultItem[];
  loadingSearch: boolean;
  selectedRecipeModal: SearchResultItem | null;
  setSelectedRecipeModal: (v: SearchResultItem | null) => void;
  handleSearchMemory: () => void;
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

export function VectorSearchTab({
  searchQuery,
  setSearchQuery,
  searchResults,
  loadingSearch,
  selectedRecipeModal,
  setSelectedRecipeModal,
  handleSearchMemory,
}: VectorSearchTabProps) {
  return (
    <div className="glass-strong rounded-2xl p-6 space-y-6 shadow-sm">
      <h2 className="text-lg font-heading font-bold text-warm-brown flex items-center gap-2">
        <Database className="w-5 h-5 text-muted-purple" /> Pinecone RAG Vector Search
      </h2>

      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Search stored recipe vectors by concept or mood..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearchMemory()}
          className="flex-1 bg-white/80 border-beige-300 text-warm-brown placeholder:text-beige-500 focus-visible:ring-muted-purple/30 focus-visible:border-muted-purple rounded-xl px-4 py-3 text-sm"
        />
        <Button
          onClick={handleSearchMemory}
          disabled={loadingSearch || !searchQuery.trim()}
          className="px-6 bg-muted-purple hover:bg-muted-purple/90 text-white font-bold rounded-xl transition-all shadow-sm cursor-pointer"
        >
          {loadingSearch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
        </Button>
      </div>

      {searchResults.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          {searchResults.map((item, idx) => (
            <motion.div
              key={idx}
              variants={scaleBounce}
              initial="initial"
              animate="animate"
              transition={{ ...springBounce, delay: idx * 0.08 }}
              whileHover={{ y: -2, boxShadow: "0 12px 40px rgba(0,0,0,0.06)" }}
              onClick={() => setSelectedRecipeModal(item)}
              className="p-5 bg-white/80 hover:bg-white cursor-pointer transition-colors rounded-xl border border-beige-300 hover:border-muted-purple/40 space-y-3 group shadow-sm"
            >
              <div className="flex justify-between items-center">
                <h4 className="font-heading font-bold text-muted-purple text-sm group-hover:text-muted-purple/80 flex items-center gap-2">
                  {item.title}
                  <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-muted-purple" />
                </h4>
                <Badge
                  variant="secondary"
                  className="bg-muted-purple-light text-muted-purple border border-muted-purple/20 text-[10px] font-mono"
                >
                  Cosine: {(item.score * 100).toFixed(1)}%
                </Badge>
              </div>

              <div className="text-xs text-warm-brown-light line-clamp-3 leading-relaxed">
                <ReactMarkdown>{renderMarkdownContent(item.recipe_text)}</ReactMarkdown>
              </div>

              <p className="text-[11px] text-muted-purple font-semibold pt-1 flex items-center gap-1">
                Click card to view full recipe <ArrowRight className="w-3 h-3" />
              </p>
            </motion.div>
          ))}
        </div>
      )}

      <RecipeModal
        recipe={selectedRecipeModal}
        onClose={() => setSelectedRecipeModal(null)}
      />
    </div>
  );
}
