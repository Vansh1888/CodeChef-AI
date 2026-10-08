"use client";

import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { 
  Sparkles, 
  ChefHat, 
  Camera, 
  Users, 
  Database, 
  Search, 
  BookmarkCheck, 
  Loader2, 
  ArrowRight,
  Utensils,
  Activity,
  DollarSign,
  X,
  Eye,
  Send,
  User
} from "lucide-react";
import { 
  askChef, 
  scanFridge, 
  runAgentTeam, 
  searchSavedRecipes, 
  saveRecipe,
  FridgeAnalysisResult,
  AgentRecipeResult, 
  SearchResultItem,
} from "../lib/api";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export default function Home() {
  const [activeTab, setActiveTab] = useState<"ask" | "scan" | "agents" | "memory">("scan");

  // Chat History State for Ask Mario
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: "Ciao my friend! 🧑🏻‍🍳 Mamma Mia, welcome to my kitchen! What fresh ingredients do you have today or what dish are you in the mood to cook?"
    }
  ]);
  const [askPrompt, setAskPrompt] = useState("");
  const [loadingAsk, setLoadingAsk] = useState(false);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Scan Fridge State
  const [fridgeFile, setFridgeFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [fridgeResult, setFridgeResult] = useState<FridgeAnalysisResult | null>(null);
  const [loadingFridge, setLoadingFridge] = useState(false);
  const [fridgeError, setFridgeError] = useState("");

  // 3-Agent Team State
  const [ingredientsInput, setIngredientsInput] = useState("");
  const [agentResult, setAgentResult] = useState<AgentRecipeResult | null>(null);
  const [loadingAgent, setLoadingAgent] = useState(false);
  const [agentError, setAgentError] = useState("");

  // Memory Search State
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [saveStatus, setSaveStatus] = useState("");
  const [selectedRecipeModal, setSelectedRecipeModal] = useState<SearchResultItem | null>(null);

  // Auto-scroll chat feed to bottom when messages update
  useEffect(() => {
    if (activeTab === "ask") {
      chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory, activeTab]);

  const renderMarkdownContent = (content: any): string => {
    if (!content) return "";
    let str = typeof content === "string" ? content : JSON.stringify(content, null, 2);
    str = str.replace(/\\n/g, "\n").replace(/\\"/g, '"');
    if (str.includes('"signature":')) {
      str = str.split('"signature":')[0].replace(/,\s*"extras":\s*\{?\s*$/, "");
    }
    return str;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setFridgeFile(file);
    setFridgeError("");
    if (file) {
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleAskChef = async () => {
    if (!askPrompt.trim() || loadingAsk) return;
    
    const userMessage = askPrompt.trim();
    const updatedHistory: ChatMessage[] = [
      ...chatHistory,
      { role: "user", content: userMessage }
    ];

    setChatHistory(updatedHistory);
    setAskPrompt("");
    setLoadingAsk(true);

    try {
      const chefReply = await askChef(userMessage);
      setChatHistory([
        ...updatedHistory,
        { role: "assistant", content: chefReply }
      ]);
    } catch (err: any) {
      setChatHistory([
        ...updatedHistory,
        { role: "assistant", content: "Mamma Mia! Chef Mario encountered a slight glitch. Please try asking again!" }
      ]);
    } finally {
      setLoadingAsk(false);
    }
  };

  const handleScanFridge = async () => {
    if (!fridgeFile) return setFridgeError("Please select an image first!");
    setLoadingFridge(true);
    setFridgeError("");
    try {
      const res = await scanFridge(fridgeFile);
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
      setSaveStatus("✅ Successfully indexed in Pinecone!");
    } catch {
      setSaveStatus("❌ Failed to save recipe");
    }
  };

  const handleSearchMemory = async () => {
    if (!searchQuery.trim()) return;
    setLoadingSearch(true);
    try {
      const results = await searchSavedRecipes(searchQuery);
      setSearchResults(results);
    } catch (err: any) {
      alert("Error searching vector memory!");
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 selection:bg-amber-500 selection:text-slate-950">
      <div className="fixed inset-0 pointer-events-none opacity-20 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-600 via-slate-900 to-slate-950" />

      <div className="relative max-w-6xl mx-auto px-4 py-8 space-y-8">
        
        {/* HERO HEADER */}
        <header className="text-center space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" /> Next-Gen Culinary Intelligence
          </div>
          <h1 className="text-5xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-orange-100 to-amber-400 bg-clip-text text-transparent">
            SmartChef AI
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-sm">
            Autonomous vision-guided kitchen orchestration powered by Multi-Agent Pipelines & Vector RAG Memory.
          </p>
        </header>

        {/* TAB NAVIGATION */}
        <div className="flex justify-center border-b border-slate-800 pb-1">
          <nav className="flex gap-2 p-1 bg-slate-900/80 backdrop-blur rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab("scan")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "scan" ? "bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/20" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Camera className="w-4 h-4" /> Vision Scanner
            </button>
            <button
              onClick={() => setActiveTab("agents")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "agents" ? "bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/20" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Users className="w-4 h-4" /> 3-Agent Orchestrator
            </button>
            <button
              onClick={() => setActiveTab("memory")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "memory" ? "bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/20" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Database className="w-4 h-4" /> Vector Search
            </button>
            <button
              onClick={() => setActiveTab("ask")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                activeTab === "ask" ? "bg-amber-500 text-slate-950 font-semibold shadow-lg shadow-amber-500/20" : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <ChefHat className="w-4 h-4" /> Ask Mario
            </button>
          </nav>
        </div>

        {/* TAB 1: VISION SCANNER */}
        {activeTab === "scan" && (
          <div className="grid md:grid-cols-2 gap-6 bg-slate-900/50 backdrop-blur p-6 rounded-2xl border border-slate-800">
            <div className="space-y-4">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-400" /> Fridge Visual Analysis
              </h2>
              <div className="border-2 border-dashed border-slate-700 hover:border-amber-500/50 rounded-xl p-6 text-center transition flex flex-col items-center justify-center min-h-[220px]">
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview" className="max-h-48 rounded-lg object-cover mb-3" />
                ) : (
                  <div className="space-y-2">
                    <Camera className="w-10 h-10 text-slate-500 mx-auto" />
                    <p className="text-xs text-slate-400">Upload fridge or pantry photo</p>
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  className="text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-slate-800 file:text-amber-400 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>
              {fridgeError && (
                <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/40">{fridgeError}</p>
              )}
              <button
                onClick={handleScanFridge}
                disabled={loadingFridge || !fridgeFile}
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold rounded-xl transition flex items-center justify-center gap-2 shadow-lg shadow-amber-500/10"
              >
                {loadingFridge ? <Loader2 className="w-5 h-5 animate-spin" /> : "Analyze Image with Vision Model"}
              </button>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider">Detected Visual Telemetry</h3>
              {fridgeResult ? (
                <div className="p-5 bg-slate-950/60 rounded-xl border border-slate-800 space-y-4">
                  <p className="italic text-amber-200 text-sm">"{fridgeResult.chef_mario_comment}"</p>
                  <div className="flex flex-wrap gap-2">
                    {fridgeResult.detected_ingredients?.map((item, idx) => (
                      <span key={idx} className="bg-slate-800 text-amber-400 border border-amber-500/20 text-xs px-3 py-1 rounded-full font-medium">
                        {item.name} <span className="text-slate-500">({item.category})</span>
                      </span>
                    ))}
                  </div>
                  <button
                    onClick={handleTransferToAgents}
                    className="w-full mt-2 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold rounded-lg transition text-sm flex items-center justify-center gap-2"
                  >
                    Execute 3-Agent Workflow <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="h-[220px] rounded-xl border border-slate-800/60 flex items-center justify-center text-xs text-slate-600">
                  Awaiting image payload...
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MULTI-AGENT ORCHESTRATOR */}
        {activeTab === "agents" && (
          <div className="space-y-6">
            <div className="bg-slate-900/50 backdrop-blur p-6 rounded-2xl border border-slate-800 space-y-4">
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Users className="w-5 h-5 text-amber-400" /> Multi-Agent Kitchen Pipeline
              </h2>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ingredients list (comma-separated)..."
                  value={ingredientsInput}
                  onChange={(e) => setIngredientsInput(e.target.value)}
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 text-slate-100"
                />
                <button
                  onClick={handleRunAgentTeam}
                  disabled={loadingAgent}
                  className="px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-2 text-sm"
                >
                  {loadingAgent ? <Loader2 className="w-4 h-4 animate-spin" /> : "Run Pipeline"}
                </button>
              </div>
              {agentError && (
                <p className="text-xs text-rose-400 bg-rose-950/40 p-2.5 rounded-lg border border-rose-800/40">{agentError}</p>
              )}
            </div>

            {agentResult && (
              <div className="grid md:grid-cols-3 gap-6">
                {/* CHEF MARIO */}
                <div className="bg-amber-950/20 border border-amber-500/30 rounded-2xl p-5 space-y-4">
                  <div className="flex justify-between items-center border-b border-amber-500/20 pb-3">
                    <h3 className="font-bold text-amber-400 flex items-center gap-2 text-sm">
                      <Utensils className="w-4 h-4" /> Chef Mario
                    </h3>
                    <button
                      onClick={handleSaveRecipe}
                      className="text-xs bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30 px-3 py-1.5 rounded-lg font-semibold transition flex items-center gap-1.5 shadow-sm"
                    >
                      <BookmarkCheck className="w-4 h-4 text-amber-400" /> Save to Vector Memory
                    </button>
                  </div>
                  {saveStatus && <p className="text-xs font-medium text-emerald-400">{saveStatus}</p>}
                  <div className="text-xs text-slate-300 space-y-2 leading-relaxed max-h-[400px] overflow-y-auto pr-2">
                    <ReactMarkdown>
                      {renderMarkdownContent(agentResult.chef_mario_recipe)}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* DR. NUTRI */}
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-5 space-y-4">
                  <div className="border-b border-emerald-500/20 pb-3">
                    <h3 className="font-bold text-emerald-400 flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4" /> Dr. Nutri
                    </h3>
                  </div>
                  <div className="text-xs text-slate-300 space-y-2 leading-relaxed max-h-[400px] overflow-y-auto pr-2">
                    <ReactMarkdown>
                      {renderMarkdownContent(agentResult["dr.nutri_analysis"])}
                    </ReactMarkdown>
                  </div>
                </div>

                {/* PENNY WISE */}
                <div className="bg-sky-950/20 border border-sky-500/30 rounded-2xl p-5 space-y-4">
                  <div className="border-b border-sky-500/20 pb-3">
                    <h3 className="font-bold text-sky-400 flex items-center gap-2 text-sm">
                      <DollarSign className="w-4 h-4" /> Penny Wise
                    </h3>
                  </div>
                  <div className="text-xs text-slate-300 space-y-2 leading-relaxed max-h-[400px] overflow-y-auto pr-2">
                    <ReactMarkdown>
                      {renderMarkdownContent(agentResult.penny_wise_budget_list)}
                    </ReactMarkdown>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 3: VECTOR MEMORY */}
        {activeTab === "memory" && (
          <div className="bg-slate-900/50 backdrop-blur p-6 rounded-2xl border border-slate-800 space-y-6">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <Database className="w-5 h-5 text-amber-400" /> Pinecone RAG Vector Search
            </h2>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search stored recipe vectors by concept or mood..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 text-slate-100"
              />
              <button
                onClick={handleSearchMemory}
                disabled={loadingSearch}
                className="px-6 bg-purple-600 hover:bg-purple-500 text-white font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-2 text-sm"
              >
                {loadingSearch ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </button>
            </div>

            {searchResults.length > 0 && (
              <div className="grid md:grid-cols-2 gap-4">
                {searchResults.map((item, idx) => (
                  <div 
                    key={idx} 
                    onClick={() => setSelectedRecipeModal(item)}
                    className="p-5 bg-slate-950 hover:bg-slate-900/80 cursor-pointer transition rounded-xl border border-slate-800 hover:border-purple-500/40 space-y-3 group shadow-md"
                  >
                    <div className="flex justify-between items-center">
                      <h4 className="font-bold text-purple-300 text-sm group-hover:text-purple-200 flex items-center gap-2">
                        {item.title} <Eye className="w-3.5 h-3.5 opacity-0 group-hover:opacity-100 transition text-purple-400" />
                      </h4>
                      <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-mono">
                        Cosine: {(item.score * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                      <ReactMarkdown>{renderMarkdownContent(item.recipe_text)}</ReactMarkdown>
                    </div>
                    <p className="text-[11px] text-purple-400 font-semibold pt-1 flex items-center gap-1">
                      Click card to view full recipe <ArrowRight className="w-3 h-3" />
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 4: CONVERSATIONAL CHAT ASSISTANT (ASK MARIO) */}
        {activeTab === "ask" && (
          <div className="bg-slate-900/50 backdrop-blur p-6 rounded-2xl border border-slate-800 space-y-4">
            <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-amber-400" /> Conversational Chef Assistant
            </h2>

            {/* SCROLLABLE CHAT MESSAGES FEED */}
            <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 h-[420px] overflow-y-auto space-y-4 shadow-inner">
              {chatHistory.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-3 ${
                    msg.role === "user" ? "flex-row-reverse" : "flex-row"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border text-xs ${
                      msg.role === "user"
                        ? "bg-amber-500 text-slate-950 border-amber-400"
                        : "bg-slate-800 text-amber-400 border-amber-500/30"
                    }`}
                  >
                    {msg.role === "user" ? <User className="w-4 h-4" /> : <ChefHat className="w-4 h-4" />}
                  </div>

                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-xs leading-relaxed space-y-1 shadow-md ${
                      msg.role === "user"
                        ? "bg-amber-500 text-slate-950 font-medium rounded-tr-none"
                        : "bg-slate-900/90 text-slate-200 border border-slate-800 rounded-tl-none"
                    }`}
                  >
                    <ReactMarkdown>{renderMarkdownContent(msg.content)}</ReactMarkdown>
                  </div>
                </div>
              ))}
              {loadingAsk && (
                <div className="flex items-center gap-2 text-xs text-amber-400/80 italic pl-2">
                  <Loader2 className="w-4 h-4 animate-spin text-amber-400" />
                  Chef Mario is crafting his response...
                </div>
              )}
              <div ref={chatBottomRef} />
            </div>

            {/* CHAT INPUT FORM */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskChef();
              }}
              className="flex gap-2"
            >
              <input
                type="text"
                placeholder="Chat with Chef Mario about recipes, techniques, or ingredients..."
                value={askPrompt}
                onChange={(e) => setAskPrompt(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-amber-500 text-slate-100"
              />
              <button
                type="submit"
                disabled={loadingAsk || !askPrompt.trim()}
                className="px-6 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded-xl transition disabled:opacity-50 text-sm flex items-center gap-2"
              >
                {loadingAsk ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        )}

      </div>

      {/* MODAL POPUP FOR FULL VECTOR RECIPE VIEW */}
      {selectedRecipeModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 max-w-2xl w-full rounded-2xl p-6 space-y-4 max-h-[85vh] overflow-y-auto shadow-2xl relative">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3 sticky top-0 bg-slate-900 z-10">
              <h3 className="font-bold text-amber-400 text-base flex items-center gap-2">
                <Utensils className="w-5 h-5 text-amber-400" /> {selectedRecipeModal.title}
              </h3>
              <button
                onClick={() => setSelectedRecipeModal(null)}
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-slate-300 leading-relaxed space-y-3 pt-2">
              <ReactMarkdown>
                {renderMarkdownContent(selectedRecipeModal.recipe_text)}
              </ReactMarkdown>
            </div>

            <div className="pt-4 border-t border-slate-800 flex justify-end">
              <button
                onClick={() => setSelectedRecipeModal(null)}
                className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition"
              >
                Close Modal
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}