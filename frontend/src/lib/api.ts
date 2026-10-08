const API_BASE_URL = "http://127.0.0.1:8000";

export interface IngredientItem {
  name: string;
  category: string;
  quantity_estimate?: string;
}

export interface FridgeAnalysisResult {
  detected_ingredients: IngredientItem[];
  missing_basic_warning?: string[];
  chef_mario_comment: string;
}

export interface AgentRecipeResult {
  ingredients_used: string[];
  chef_mario_recipe: string;
  "dr.nutri_analysis": string;
  penny_wise_budget_list: string;
}

export interface SearchResultItem {
  score: number;
  title: string;
  recipe_text: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

// 1. Conversational Chat with Chef Mario (/ask-chef - POST with History)
export async function askChef(prompt: string, history: ChatMessage[] = []): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/ask-chef`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, history }),
  });

  if (!response.ok) {
    throw new Error("Failed to reach Chef Mario.");
  }

  const data = await response.json();
  return data.chef_response;
}

// 2. Vision Scanner (/scan-fridge)
export async function scanFridge(file: File): Promise<FridgeAnalysisResult> {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${API_BASE_URL}/scan-fridge`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to scan fridge");
  }

  return response.json();
}

// 3. Multi-Agent Pipeline (/cook-with-agent-team)
export async function runAgentTeam(ingredients: string[]): Promise<AgentRecipeResult> {
  const response = await fetch(`${API_BASE_URL}/cook-with-agent-team`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ingredients }),
  });

  if (!response.ok) throw new Error("Agent team pipeline failed.");
  return response.json();
}

// 4. Save Recipe to Pinecone Vector Index (/save-recipe)
export async function saveRecipe(title: string, recipeText: string) {
  const response = await fetch(`${API_BASE_URL}/save-recipe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      title: title,
      recipe_text: recipeText,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.detail || "Failed to save recipe");
  }

  return response.json();
}

// 5. Semantic Vector Search (/search-saved-recipes)
export async function searchSavedRecipes(query: string): Promise<SearchResultItem[]> {
  const response = await fetch(`${API_BASE_URL}/search-saved-recipes?query=${encodeURIComponent(query)}`);
  if (!response.ok) throw new Error("Failed to search saved recipes.");
  const data = await response.json();
  return data.results;
}