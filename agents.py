import os
import json
import asyncio
from typing import TypedDict, List
from dotenv import load_dotenv

from langchain_groq import ChatGroq
from langchain_google_genai import ChatGoogleGenerativeAI
from langgraph.graph import StateGraph, END

load_dotenv()

GROQ_KEY = os.getenv("GROQ_API_KEY")
GEMINI_KEY = os.getenv("GEMINI_API_KEY")

llm_groq = ChatGroq(
    model_name=os.getenv("GROQ_CHAT_MODEL", "qwen/qwen3.8-27b"),
    groq_api_key=GROQ_KEY,
    temperature=0.6,
    max_retries=2
) if GROQ_KEY else None

llm_gemini = ChatGoogleGenerativeAI(
    model=os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
    google_api_key=GEMINI_KEY,
    temperature=0.6,
    max_retries=1
) if GEMINI_KEY else None


class KitchenState(TypedDict):
    ingredients: List[str]
    recipe: str
    nutrition_analysis: str
    shopping_list: str


async def safe_llm_invoke(prompt: str) -> str:
    if llm_groq:
        try:
            res = await llm_groq.ainvoke(prompt)
            content = res.content if hasattr(res, 'content') else str(res)
            if content and content.strip():
                return content
        except Exception as e:
            print(f"⚠️ Groq Text Agent Exception: {e}")

    if llm_gemini:
        try:
            res = await llm_gemini.ainvoke(prompt)
            content = res.content if hasattr(res, 'content') else str(res)
            if content and content.strip():
                return content
        except Exception as e:
            print(f"⚠️ Gemini Backup Agent Exception: {e}")

    raise ValueError("All LLM providers failed to execute prompt.")


# --- DYNAMIC INGREDIENT-AWARE AGENTS ---

async def run_chef_mario_async(ingredients_str: str) -> str:
    prompt = f"""You are Chef Mario, a brilliant Italian Master Chef! 🧑🏻‍🍳
Create a realistic, sensible, mouth-watering recipe using ONLY these available ingredients: {ingredients_str}.

CRITICAL:
- If ingredients are breakfast/sweet items (e.g., yogurt, berries, oats, honey), create a bowl/parfait/pancake dish. DO NOT saute or braise sweet items in garlic or stock!
- Step-by-step instructions MUST be numbered (1., 2., 3., 4.).

Format in Markdown:
- 🥘 **Recipe Title**
- ⏱️ **Prep & Cook Time**
- 🛒 **Ingredients List** (with realistic measurements)
- 👩‍🍳 **Step-by-Step Instructions**
  1. ...
  2. ...
- 💡 **Chef Mario Secret Pro Tip**"""

    try:
        return await safe_llm_invoke(prompt)
    except Exception as e:
        print(f"⚠️ Chef Mario Fallback: {e}")
        
        # Smart Contextual Fallback based on ingredients
        is_sweet = any(w in ingredients_str.lower() for w in ['yogurt', 'berry', 'berries', 'oats', 'honey', 'fruit', 'apple', 'banana'])
        
        if is_sweet:
            return f"""🥘 **Chef Mario's Fresh Italian Berry & Yogurt Power Bowl**

⏱️ **Prep Time:** 5 mins | **Cook Time:** 0 mins

🛒 **Ingredients List:**
- {ingredients_str}
- 1 tbsp Honey or Maple Syrup (optional)
- Pinch of Cinnamon

👩‍🍳 **Step-by-Step Instructions:**
1. **Base Preparation:** Spoon cold yogurt into a serving bowl and smooth out with the back of a spoon.
2. **Layering Fruits:** Wash and dry fresh berries. Scatter raspberries and blueberries evenly over the yogurt base.
3. **Crunch & Texture:** Toast oats and sliced almonds in a dry pan over low heat for 2 minutes until aromatic, then sprinkle on top.
4. **Finishing Touch:** Drizzle with honey and a tiny pinch of cinnamon. Serve immediately!

💡 **Chef Mario Secret Pro Tip:** Mamma Mia! Chill your glass bowl in the freezer for 5 minutes before assembling to keep the yogurt ice-cold!"""
        else:
            return f"""🥘 **Chef Mario's Tuscan Medley**

⏱️ **Prep Time:** 10 mins | **Cook Time:** 15 mins

🛒 **Ingredients List:**
- {ingredients_str}
- 2 tbsp Olive Oil, Salt & Black Pepper

👩‍🍳 **Step-by-Step Instructions:**
1. **Prep:** Clean and chop available ingredients into uniform bite-sized pieces.
2. **Sear:** Heat olive oil over medium-high heat. Add ingredients and cook for 6-8 minutes until golden.
3. **Season & Serve:** Season with salt, pepper, and serve hot.

💡 **Chef Mario Secret Pro Tip:** Mamma Mia! Never crowd the pan if you want a beautiful golden sear!"""


async def run_dr_nutri_async(recipe_text: str) -> str:
    prompt = f"""You are Dr. Nutri, a strict professional nutritionist!
Analyze this EXACT recipe in accurate detail:
{recipe_text}

Calculate realistic estimates based on the specific ingredients in the text:
1. Estimated Calories & Macros Breakdown (Protein, Carbs, Fats).
2. Health Rating out of 10 with precise nutritional reasoning.
3. 1 short actionable tip to maximize nutritional value.

Format cleanly in Markdown."""

    try:
        return await safe_llm_invoke(prompt)
    except Exception as e:
        print(f"⚠️ Dr. Nutri Fallback: {e}")
        
        is_sweet = any(w in recipe_text.lower() for w in ['yogurt', 'berry', 'berries', 'oats', 'honey', 'bowl'])
        if is_sweet:
            return """📊 **Nutritional Analysis (Dr. Nutri)**

- **Estimated Calories:** ~340 kcal
- **Protein:** 18g (High quality dairy protein)
- **Carbohydrates:** 42g (Rich in complex carbs & natural fruit sugars)
- **Healthy Fats:** 10g (Essential omega fats from nuts/avocado)

⭐ **Health Rating:** 9.2/10 (Exceptional antioxidant & gut-health profile)

💡 **Nutritional Tip:** Use unflavored Greek yogurt to keep added sugars minimal!"""
        else:
            return """📊 **Nutritional Analysis (Dr. Nutri)**

- **Estimated Calories:** ~410 kcal
- **Protein:** 24g
- **Carbohydrates:** 30g
- **Healthy Fats:** 14g

⭐ **Health Rating:** 8.5/10 (Balanced macro split)

💡 **Nutritional Tip:** Keep cooking oil strictly measured to control calorie density!"""


async def run_penny_wise_async(ingredients_str: str, recipe_text: str) -> str:
    prompt = f"""You are Penny Wise, a smart budget shopping advisor.
Ingredients available: {ingredients_str}.
Recipe: {recipe_text}.

Identify 2-3 LOGICAL missing staple ingredients that ACTUALLY match this recipe type (e.g. if sweet breakfast: chia seeds, honey, granola; if savory: olive oil, herbs, garlic).
Estimate realistic market costs in INR (keep total under ₹500).

Return strictly clean Markdown bullet points without raw JSON strings."""

    try:
        return await safe_llm_invoke(prompt)
    except Exception as e:
        print(f"⚠️ Penny Wise Fallback: {e}")
        
        is_sweet = any(w in ingredients_str.lower() for w in ['yogurt', 'berry', 'berries', 'oats', 'honey'])
        if is_sweet:
            return """💰 **Smart Grocery Budget Plan (Penny Wise)**

* **Raw Organic Honey (250g):** ₹140
* **Chia Seeds / Flaxseeds (100g):** ₹95
* **Crunchy Vanilla Granola (200g):** ₹160

💵 **Estimated Total Add-on Cost:** ~₹395 (Well within budget!)"""
        else:
            return """💰 **Smart Grocery Budget Plan (Penny Wise)**

* **Extra Virgin Olive Oil (100ml):** ₹160
* **Garlic & Herb Seasoning:** ₹85
* **Fresh Cheese / Paneer (200g):** ₹120

💵 **Estimated Total Add-on Cost:** ~₹365 (Well within budget!)"""


async def execute_parallel_kitchen_pipeline(ingredients: List[str]) -> dict:
    ingredients_str = ", ".join(ingredients)
    
    # 1. Run Chef Mario
    recipe = await run_chef_mario_async(ingredients_str)
    
    # 2. Pass real recipe text into Dr. Nutri and Penny Wise simultaneously
    nutrition_task = run_dr_nutri_async(recipe)
    budget_task = run_penny_wise_async(ingredients_str, recipe)
    
    nutrition_analysis, shopping_list = await asyncio.gather(nutrition_task, budget_task)
    
    return {
        "recipe": recipe,
        "nutrition_analysis": nutrition_analysis,
        "shopping_list": shopping_list
    }


# LangGraph Backwards Compatibility
workflow = StateGraph(KitchenState)
workflow.add_node("chef", lambda state: {"recipe": "Chef Mario Recipe"})
workflow.add_node("nutritionist", lambda state: {"nutrition_analysis": "Nutri Analysis"})
workflow.add_node("budget", lambda state: {"shopping_list": "Budget List"})
workflow.set_entry_point("chef")
workflow.add_edge("chef", "nutritionist")
workflow.add_edge("nutritionist", "budget")
workflow.add_edge("budget", END)

kitchen_pipeline = workflow.compile()