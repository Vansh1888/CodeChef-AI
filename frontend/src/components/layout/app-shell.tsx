"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Header } from "./header";
import { TabNavigation } from "./tab-navigation";
import { AskMarioTab } from "@/components/features/ask-mario/ask-mario-tab";
import { VisionScannerTab } from "@/components/features/vision-scanner/vision-scanner-tab";
import { AgentOrchestratorTab } from "@/components/features/agent-orchestrator/agent-orchestrator-tab";
import { VectorSearchTab } from "@/components/features/vector-search/vector-search-tab";
import { tabTransition } from "@/lib/animations";
import type { TabId } from "@/lib/constants";
import {
  askChefStream,
  scanFridge,
  runAgentTeam,
  searchSavedRecipes,
  saveRecipe,
  type FridgeAnalysisResult,
  type AgentRecipeResult,
  type SearchResultItem,
} from "@/lib/api";

type ChatMessage = { role: "user" | "assistant"; content: string };

function renderMarkdownContent(content: any): string {
  if (!content) return "";
  let str = typeof content === "string" ? content : JSON.stringify(content, null, 2);
  str = str.replace(/\\n/g, "\n").replace(/\\"/g, '"');
  if (str.includes('"signature":')) {
    str = str.split('"signature":')[0].replace(/,\s*"extras":\s*\{?\s*$/, "");
  }
  return str;
}

export function SmartChefApp() {
  const [activeTab, setActiveTab] = useState<TabId>("ask");

  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Ciao my friend! 🧑🏻‍🍳 Mamma Mia, welcome to my kitchen! What fresh ingredients do you have today or what dish are you in the mood to cook?",
    },
  ]);
  const [askPrompt, setAskPrompt] = useState("");
  const [loadingAsk, setLoadingAsk] = useState(false);

  const [fridgeResult, setFridgeResult] = useState<FridgeAnalysisResult | null>(null);
  const [loadingFridge, setLoadingFridge] = useState(false);
  const [fridgeError, setFridgeError] = useState("");

  const [ingredientsInput, setIngredientsInput] = useState("");
  const [agentResult, setAgentResult] = useState<AgentRecipeResult | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [agentError, setAgentError] = useState("");
  const [saveStatus, setSaveStatus] = useState("");

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<SearchResultItem | null>(null);

  const handleAskChef = async () => {
    if (!askPrompt.trim() || loadingAsk) return;
    const userMessage = askPrompt.trim();
    const updatedHistory: ChatMessage[] = [...chatHistory, { role: "user", content: userMessage }];
    const assistantIndex = updatedHistory.length;

    setChatHistory([...updatedHistory, { role: "assistant", content: "" }]);
    setAskPrompt("");
    setLoadingAsk(true);

    try {
      let accumulated = "";
      await askChefStream(userMessage, updatedHistory.slice(0, -1), (token) => {
        accumulated += token;
        setChatHistory((prev) => {
          const next = [...prev];
          next[assistantIndex] = { role: "assistant", content: accumulated };
          return next;
        });
      });
      if (!accumulated.trim()) {
        setChatHistory((prev) => {
          const next = [...prev];
          next[assistantIndex] = {
            role: "assistant",
            content: "Mamma Mia! Chef Mario is speechless. Please try again!",
          };
          return next;
        });
      }
    } catch {
      setChatHistory((prev) => {
        const next = [...prev];
        next[assistantIndex] = {
          role: "assistant",
          content: "Mamma Mia! Chef Mario encountered a slight glitch. Please try asking again!",
        };
        return next;
      });
    } finally {
      setLoadingAsk(false);
    }
  };

  const handleScanFridge = async (file: File) => {
    setLoadingFridge(true);
    setFridgeError("");
    try {
      const res = await scanFridge(file);
      setFridgeResult(res);
    } catch (err: any) {
      setFridgeError(err.message || "Error analyzing image. Please try again.");
    } finally {
      setLoadingFridge(false);
    }
  };

  const handleTransferToAgents = async () => {
    if (!fridgeResult?.detected_ingredients) return;
    const names = fridgeResult.detected_ingredients.map((item) => item.name);
    setIngredientsInput(names.join(", "));
    setActiveTab("agents");

    setLoadingAgent(true);
    setAgentError("");
    try {
      const res = await runAgentTeam(names);
      setAgentResult(res);
    } catch (err: any) {
      setAgentError(err.message || "Error running agent team!");
    } finally {
      setLoadingAgent(false);
    }
  };

  const handleRunAgentTeam = async () => {
    if (!ingredientsInput.trim()) return;
    setLoadingAgent(true);
    setAgentError("");
    setSaveStatus("");
    try {
      const list = ingredientsInput.split(",").map((i) => i.trim());
      const res = await runAgentTeam(list);
      setAgentResult(res);
    } catch (err: any) {
      setAgentError(err.message || "Error running kitchen pipeline!");
    } finally {
      setLoadingAgent(false);
    }
  };

  const handleSaveRecipe = async () => {
    if (!agentResult?.chef_mario_recipe) return;
    setSaveStatus("Saving to Vector Index...");
    try {
      const recipeText = renderMarkdownContent(agentResult.chef_mario_recipe);
      const title = ingredientsInput ? `Recipe: ${ingredientsInput}` : "Chef Mario Special";
      await saveRecipe(title, recipeText);
      setSaveStatus("Successfully indexed in Pinecone!");
    } catch {
      setSaveStatus("Failed to save recipe");
    }
  };

  const handleSearchMemory = async () => {
    if (!searchQuery.trim()) return;
    setLoadingSearch(true);
    try {
      const results = await searchSavedRecipes(searchQuery);
      setSearchResults(results);
    } catch {
      setSearchResults([]);
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <main className="min-h-screen bg-beige-50 relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none opacity-30 bg-[radial-gradient(ellipse_at_top_left,_var(--tw-gradient-stops))] from-terracotta-muted via-beige-50 to-transparent" />
      <div className="fixed bottom-0 right-0 w-[600px] h-[600px] pointer-events-none opacity-15 bg-[radial-gradient(ellipse_at_bottom_right,_var(--tw-gradient-stops))] from-sage-muted via-transparent to-transparent" />

      <div className="relative max-w-6xl mx-auto px-4 py-8 space-y-6">
        <Header />
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            variants={tabTransition}
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {activeTab === "ask" && (
              <AskMarioTab
                chatHistory={chatHistory}
                askPrompt={askPrompt}
                setAskPrompt={setAskPrompt}
                loadingAsk={loadingAsk}
                handleAskChef={handleAskChef}
              />
            )}
            {activeTab === "scan" && (
              <VisionScannerTab
                fridgeResult={fridgeResult}
                loadingFridge={loadingFridge}
                fridgeError={fridgeError}
                onScan={handleScanFridge}
                onTransferToAgents={handleTransferToAgents}
              />
            )}
            {activeTab === "agents" && (
              <AgentOrchestratorTab
                ingredientsInput={ingredientsInput}
                setIngredientsInput={setIngredientsInput}
                agentResult={agentResult}
                loadingAgent={loadingAgent}
                agentError={agentError}
                saveStatus={saveStatus}
                handleRunAgentTeam={handleRunAgentTeam}
                handleSaveRecipe={handleSaveRecipe}
              />
            )}
            {activeTab === "memory" && (
              <VectorSearchTab
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                searchResults={searchResults}
                loadingSearch={loadingSearch}
                selectedRecipeModal={selectedRecipeModal}
                setSelectedRecipeModal={setSelectedRecipeModal}
                handleSearchMemory={handleSearchMemory}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </main>
  );
}
