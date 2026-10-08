"use client";

import { motion } from "framer-motion";
import { Users, Utensils, Activity, DollarSign, BookmarkCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ErrorMessage } from "@/components/shared/error-message";
import { AgentCard } from "./agent-card";
import { scaleBounce, springBounce } from "@/lib/animations";
import type { AgentRecipeResult } from "@/lib/api";

interface AgentOrchestratorTabProps {
  ingredientsInput: string;
  setIngredientsInput: (v: string) => void;
  agentResult: AgentRecipeResult | null;
  loadingAgent: boolean;
  agentError: string;
  saveStatus: string;
  handleRunAgentTeam: () => void;
  handleSaveRecipe: () => void;
}

export function AgentOrchestratorTab({
  ingredientsInput,
  setIngredientsInput,
  agentResult,
  loadingAgent,
  agentError,
  saveStatus,
  handleRunAgentTeam,
  handleSaveRecipe,
}: AgentOrchestratorTabProps) {
  return (
    <div className="space-y-6">
      <motion.div
        variants={scaleBounce}
        initial="initial"
        animate="animate"
        transition={springBounce}
        className="glass-strong rounded-2xl p-6 space-y-4 shadow-sm"
      >
        <h2 className="text-lg font-heading font-bold text-warm-brown flex items-center gap-2">
          <Users className="w-5 h-5 text-terracotta" /> Multi-Agent Kitchen Pipeline
        </h2>

        <div className="flex gap-2">
          <Input
            type="text"
            placeholder="Ingredients list (comma-separated)..."
            value={ingredientsInput}
            onChange={(e) => setIngredientsInput(e.target.value)}
            className="flex-1 bg-white/80 border-beige-300 text-warm-brown placeholder:text-beige-500 focus-visible:ring-terracotta/30 focus-visible:border-terracotta rounded-xl px-4 py-3 text-sm"
          />
          <Button
            onClick={handleRunAgentTeam}
            disabled={loadingAgent || !ingredientsInput.trim()}
            className="px-6 bg-terracotta hover:bg-terracotta-light text-white font-bold rounded-xl transition-all shadow-sm hover:shadow-md hover:shadow-terracotta/20 cursor-pointer"
          >
            {loadingAgent ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run Pipeline"}
          </Button>
        </div>

        {agentError && <ErrorMessage message={agentError} />}
      </motion.div>

      {agentResult && (
        <div className="grid md:grid-cols-3 gap-6">
          <AgentCard
            title="Chef Mario"
            icon={Utensils}
            accentColor="text-terracotta"
            bgTint="bg-terracotta-muted/60"
            borderAccent="border-terracotta/30"
            content={agentResult.chef_mario_recipe}
            delay={0}
            actions={
              <div className="flex flex-col items-end gap-1">
                <Button
                  onClick={handleSaveRecipe}
                  variant="outline"
                  size="sm"
                  className="text-xs border-terracotta/30 text-terracotta hover:bg-terracotta-muted cursor-pointer"
                >
                  <BookmarkCheck className="w-3.5 h-3.5 mr-1" /> Save to Memory
                </Button>
                {saveStatus && (
                  <span className="text-xs font-medium text-sage">{saveStatus}</span>
                )}
              </div>
            }
          />
          <AgentCard
            title="Dr. Nutri"
            icon={Activity}
            accentColor="text-sage"
            bgTint="bg-sage-muted/60"
            borderAccent="border-sage/30"
            content={agentResult["dr.nutri_analysis"]}
            delay={0.08}
          />
          <AgentCard
            title="Penny Wise"
            icon={DollarSign}
            accentColor="text-dusty-blue"
            bgTint="bg-dusty-blue-muted/60"
            borderAccent="border-dusty-blue/30"
            content={agentResult.penny_wise_budget_list}
            delay={0.16}
          />
        </div>
      )}
    </div>
  );
}
