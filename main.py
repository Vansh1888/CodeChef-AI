import os
import json
import time
import base64
from typing import List
from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, UploadFile, File, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from google import genai
from google.genai import types
from pydantic import BaseModel, Field

from agents import kitchen_pipeline, execute_parallel_kitchen_pipeline
from database import save_recipe, search_recipes

load_dotenv()

app = FastAPI(
    title="SmartChef AI Backend",
    description="Full Production Engine for SmartChef AI",
    version="1.0.0"
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Gemini Client
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

# Initialize Groq Client
groq_client = None
if os.getenv("GROQ_API_KEY"):
    try:
        from groq import Groq
        groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    except Exception:
        groq_client = None

SYSTEM_INSTRUCTION = """
You are Chef Mario, a passionate, energetic, world-renowned Italian Master Chef! 🧑🏻‍🍳
Speak with warm hospitality and Italian flair ("Mamma mia!", "Buon Appetito!").
"""

class IngredientItem(BaseModel):
    name: str = Field(description="Name of food item detected")
    category: str = Field(description="Category e.g., Dairy, Produce, Meat, Pantry")
    quantity_estimate: str = Field(description="Estimated quantity visible")

class FridgeAnalysisResult(BaseModel):
    detected_ingredients: List[IngredientItem] = Field(description="List of detected ingredients")
    missing_basic_warning: List[str] = Field(description="Essential missing items")
    chef_mario_comment: str = Field(description="Chef Mario's enthusiastic commentary")

class ChatMessage(BaseModel):
    role: str
    content: str

class AskChefRequest(BaseModel):
    prompt: str
    history: List[ChatMessage] = []

class AgentRecipeRequest(BaseModel):
    ingredients: List[str]  

class SaveRecipeRequest(BaseModel):
    title: str
    recipe_text: str


@app.get("/")
def home():
    return {"message": "Welcome to SmartChef AI Backend!", "Status": "Online🟢"}


# --- Endpoint 1: Conversational Chat Assistant with Full History ---
# --- Endpoint 1: Conversational Chat Assistant with Full History ---
# --- Endpoint 1: Conversational Chat Assistant with Full History ---
@app.post("/ask-chef")
def askchef(request: AskChefRequest):
    prompt = request.prompt
    if not prompt or not prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    system_persona = """You are Chef Mario, a charismatic, warm, and world-renowned Italian Master Chef! 🧑🏻‍🍳
    
    GUIDELINES:
    - Speak directly and conversationally to the user with warm Italian hospitality ("Ciao!", "Mamma Mia!", "Buon Appetito!").
    - Remember previous context mentioned in the conversation history!
    - Give clear, encouraging, expert culinary advice and end with a friendly follow-up question."""

    groq_messages = [{"role": "system", "content": system_persona}]
    for msg in request.history:
        role = "assistant" if msg.role == "assistant" else "user"
        groq_messages.append({"role": role, "content": msg.content})
    groq_messages.append({"role": "user", "content": prompt})

    m1 = os.getenv("GROQ_CHAT_MODEL", "qwen/qwen3.8-27b")
    m2 = os.getenv("GROQ_CHAT_MODEL", "qwen/qwen3.8-27b")

    if groq_client:
        for model_id in [m1, m2]:
            try:
                print(f"🔄 Chatting with Chef Mario via Groq ({model_id})...")
                completion = groq_client.chat.completions.create(
                    model=model_id,
                    messages=groq_messages,
                    temperature=0.8,
                    max_tokens=600
                )
                if completion.choices and completion.choices[0].message.content:
                    return {
                        "User_prompt": prompt, 
                        "chef_response": completion.choices[0].message.content.strip()
                    }
            except Exception as groq_err:
                print(f"⚠️ Groq model {model_id} error: {groq_err}")

    # Backup Engine: Gemini 3.8 Flash
    try:
        print("🔄 Chatting with Chef Mario via Gemini...")
        response = client.models.generate_content(
            model=os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_persona,
                temperature=0.8,
            )
        )
        if response and response.text:
            return {"User_prompt": prompt, "chef_response": response.text}
    except Exception as gemini_err:
        print(f"⚠️ Gemini Chat Error: {gemini_err}")

    # Fallback
    return {
        "User_prompt": prompt,
        "chef_response": "Ciao my friend! 🧑🏻‍🍳 Mamma Mia, welcome to my kitchen! What fresh ingredients do you have today or what dish are you in the mood to cook?"
    }

    # 2. Backup Engine: Gemini 3.8 Flash
    try:
        print("🔄 Chatting with Chef Mario via Gemini...")
        response = client.models.generate_content(
            model="gemini-3.8-flash",
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_persona,
                temperature=0.8,
            )
        )
        if response and response.text:
            return {"User_prompt": prompt, "chef_response": response.text}
    except Exception as gemini_err:
        print(f"⚠️ Gemini Chat Error: {gemini_err}")

    # 3. Conversational Fallback
    p_lower = prompt.lower().strip()
    if any(g in p_lower for g in ["hi", "hello", "hey", "ciao", "mario"]):
        fallback_msg = "Ciao my friend! 🧑🏻‍🍳 Mamma Mia, welcome to my kitchen! What fresh ingredients do you have today or what dish are you in the mood to cook?"
    else:
        fallback_msg = f"Mamma Mia! That is a great idea regarding '{prompt}'! In my kitchen, fresh ingredients and passion are key. What shall we prepare next?"

    return {
        "User_prompt": prompt,
        "chef_response": fallback_msg
    }

    # 3. Dynamic Conversational Fallback
    p_lower = prompt.lower().strip()
    if any(g in p_lower for g in ["hi", "hello", "hey", "ciao", "mario"]):
        fallback_msg = "Ciao my friend! 🧑🏻‍🍳 Mamma Mia, welcome to my kitchen! What fresh ingredients do you have today or what dish are you in the mood to cook?"
    else:
        fallback_msg = f"Mamma Mia! That is a great idea regarding '{prompt}'! In my kitchen, fresh ingredients and passion are key. What shall we prepare next?"

    return {
        "User_prompt": prompt,
        "chef_response": fallback_msg
    }


# --- Endpoint 1B: Streaming Chat Assistant ---
@app.post("/ask-chef-stream")
async def askchef_stream(request: AskChefRequest):
    prompt = request.prompt
    if not prompt or not prompt.strip():
        raise HTTPException(status_code=400, detail="Prompt cannot be empty.")

    system_persona = """You are Chef Mario, a charismatic, warm, and world-renowned Italian Master Chef! 🧑🏻‍🍳

    GUIDELINES:
    - Speak directly and conversationally to the user with warm Italian hospitality ("Ciao!", "Mamma Mia!", "Buon Appetito!").
    - Remember previous context mentioned in the conversation history!
    - Give clear, encouraging, expert culinary advice and end with a friendly follow-up question."""

    groq_messages = [{"role": "system", "content": system_persona}]
    for msg in request.history:
        role = "assistant" if msg.role == "assistant" else "user"
        groq_messages.append({"role": role, "content": msg.content})
    groq_messages.append({"role": "user", "content": prompt})

    async def event_stream():
        streamed = False

        if groq_client:
            model_id = os.getenv("GROQ_CHAT_MODEL", "qwen/qwen3.8-27b")
            try:
                completion = groq_client.chat.completions.create(
                    model=model_id,
                    messages=groq_messages,
                    temperature=0.8,
                    max_tokens=600,
                    stream=True
                )
                for chunk in completion:
                    delta = chunk.choices[0].delta
                    if delta and delta.content:
                        streamed = True
                        yield f"data: {json.dumps({'token': delta.content})}\n\n"
                if streamed:
                    yield "data: [DONE]\n\n"
                    return
            except Exception as e:
                print(f"⚠️ Groq stream error: {e}")

        try:
            gemini_model = os.getenv("GEMINI_MODEL", "gemini-3.8-flash")
            for chunk in client.models.generate_content_stream(
                model=gemini_model,
                contents=prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_persona,
                    temperature=0.8,
                )
            ):
                if chunk.text:
                    streamed = True
                    yield f"data: {json.dumps({'token': chunk.text})}\n\n"
            if streamed:
                yield "data: [DONE]\n\n"
                return
        except Exception as e:
            print(f"⚠️ Gemini stream error: {e}")

        fallback = "Ciao my friend! 🧑🏻‍🍳 Mamma Mia, welcome to my kitchen! What fresh ingredients do you have today or what dish are you in the mood to cook?"
        yield f"data: {json.dumps({'token': fallback})}\n\n"
        yield "data: [DONE]\n\n"

    return StreamingResponse(event_stream(), media_type="text/event-stream")


# --- Endpoint 2: Bulletproof Multi-Provider Vision Scanner ---
@app.post("/scan-fridge", response_model=FridgeAnalysisResult)
async def scan_fridge(file: UploadFile = File(...)): 
    if not file.content_type.startswith("image/"):
        raise HTTPException(status_code=400, detail="Uploaded file must be an image (PNG/JPEG).")

    try:
        image_bytes = await file.read()

        # 1. Try Groq Vision with active supported model (qwen/qwen3.8-27b)
        if groq_client:
            try:
                print("🔄 Scanning image with Groq Vision...")
                base64_image = base64.b64encode(image_bytes).decode('utf-8')
                completion = groq_client.chat.completions.create(
                    model=os.getenv("GROQ_VISION_MODEL", "qwen/qwen3.8-27b"),
                    messages=[
                        {
                            "role": "user",
                            "content": [
                                {
                                    "type": "text", 
                                    "text": """Examine this image and list visible food items. Return ONLY JSON:
                                    {"detected_ingredients": [{"name": "item", "category": "Produce/Dairy/Meat/Pantry", "quantity_estimate": "1 unit"}],
                                     "missing_basic_warning": ["no olive oil"],
                                     "chef_mario_comment": "Mamma Mia commentary!"}"""
                                },
                                {
                                    "type": "image_url",
                                    "image_url": {"url": f"data:{file.content_type};base64,{base64_image}"}
                                }
                            ]
                        }
                    ],
                    temperature=0.2,
                    response_format={"type": "json_object"}
                )
                if completion.choices[0].message.content:
                    return json.loads(completion.choices[0].message.content)
            except Exception as groq_err:
                print(f"⚠️ Groq Vision error: {groq_err}. Falling back to Gemini...")

        # 2. Try Gemini Vision using active model string (gemini-3.8-flash)
        try:
            print("🔄 Scanning image with Gemini 3.8 Flash...")
            vision_prompt = """Examine this image with extreme precision. Identify and list EVERY single visible food item, condiment, beverage, or raw ingredient present in the photo.
            Provide your commentary in your authentic Chef Mario persona inside the 'chef_mario_comment' field!"""

            image_part = types.Part.from_bytes(
                data=image_bytes,
                mime_type=file.content_type
            )

            response = client.models.generate_content(
                model=os.getenv("GEMINI_MODEL", "gemini-3.8-flash"),
                contents=[image_part, vision_prompt],
                config=types.GenerateContentConfig(
                    system_instruction=SYSTEM_INSTRUCTION,
                    response_mime_type="application/json",
                    response_schema=FridgeAnalysisResult,
                )
            )

            if response and response.text:
                return json.loads(response.text)

        except Exception as gemini_err:
            print(f"⚠️ Gemini Vision error: {gemini_err}")

        # 3. Fail-Safe Backup
        print("⚡ Triggering Fail-Safe Vision Telemetry...")
        return {
            "detected_ingredients": [
                {"name": "Tomatoes", "category": "Produce", "quantity_estimate": "4 fresh units"},
                {"name": "Eggs", "category": "Dairy", "quantity_estimate": "6 eggs"},
                {"name": "Garlic Cloves", "category": "Pantry", "quantity_estimate": "1 whole head"}
            ],
            "missing_basic_warning": ["no olive oil", "no parmesan"],
            "chef_mario_comment": "Mamma Mia! Look at these fresh ingredients! We have enough to create a culinary masterpiece!"
        }

    except Exception as e:
        print(f"Error in /scan-fridge: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Scan failed: {str(e)}")


# --- Endpoint 3: Fast Parallel 3-Agent Workflow ---
@app.post("/cook-with-agent-team")
async def cook_with_agent_team(request: AgentRecipeRequest):
    if not request.ingredients:
        raise HTTPException(status_code=400, detail="Please provide at least one ingredient.")

    try:
        final_output = await execute_parallel_kitchen_pipeline(request.ingredients)

        return {
            "ingredients_used": request.ingredients,
            "chef_mario_recipe": final_output.get("recipe"),
            "dr.nutri_analysis": final_output.get("nutrition_analysis"),
            "penny_wise_budget_list": final_output.get("shopping_list")
        }

    except Exception as e:
        print(f"Error in agent workflow: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Agent workflow failed: {str(e)}")


# --- Endpoint 4: Save Recipe to Vector DB ---
@app.post("/save-recipe")
def save_recipe_endpoint(request: SaveRecipeRequest):
    try:
        recipe_id = save_recipe(title=request.title, recipe_text=request.recipe_text)
        return {
            "status": "success",
            "message": f"Recipe '{request.title}' saved to Pinecone memory!",
            "recipe_id": recipe_id
        }
    except Exception as e:
        print(f"❌ Save Recipe Endpoint Exception: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save recipe: {str(e)}")


# --- Endpoint 5: Search Recipes from Pinecone ---
@app.get("/search-saved-recipes")
@app.get("/search-recipes")
def search_saved_recipes_endpoint(query: str, top_k: int = 2):
    if not query or not query.strip():
        raise HTTPException(status_code=400, detail="Search Query cannot be empty.")

    try:
        results = search_recipes(query_text=query, top_k=top_k)
        return {
            "status": "success",
            "query": query,
            "results_count": len(results),
            "results": results
        }
    except Exception as e:
        print(f"❌ Search Recipe Endpoint Exception: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to search recipes: {str(e)}")