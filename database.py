import os
import uuid
from dotenv import load_dotenv
from pinecone import Pinecone, ServerlessSpec
from google import genai
from google.genai import types

load_dotenv()

pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))

INDEX_NAME = "smartchef-recipes"

def init_vector_db():
    try:
        existing_indexes = [idx.name for idx in pc.list_indexes()]

        if INDEX_NAME not in existing_indexes:
            print(f"Creating new Pinecone Index: {INDEX_NAME}")
            pc.create_index(
                name=INDEX_NAME,
                dimension=768,
                metric="cosine",
                spec=ServerlessSpec(cloud="aws", region="us-east-1")
            )
            print(f"Index {INDEX_NAME} Created Successfully!🟢")
        else:
            print(f"Index {INDEX_NAME} already exists and is ready to USE!🔥")
    except Exception as e:
        print(f"⚠️ Warning during Pinecone index initialization: {str(e)}")

init_vector_db()
index = pc.Index(INDEX_NAME)


def get_embedding(text: str) -> list[float]:
    candidate_embedding_models = [
        "gemini-embedding-001",
        "text-embedding-004"
    ]
    
    response = None
    last_exception = None

    for model_name in candidate_embedding_models:
        try:
            response = client.models.embed_content(
                model=model_name,
                contents=text,
                config=types.EmbedContentConfig(
                    output_dimensionality=768
                )
            )
            if response:
                print(f"✅ Embedding vector generated using model: {model_name}")
                break
        except Exception as err:
            try:
                response = client.models.embed_content(
                    model=model_name,
                    contents=text
                )
                if response:
                    print(f"✅ Embedding vector generated using model (default config): {model_name}")
                    break
            except Exception as retry_err:
                last_exception = retry_err
                continue

    if not response:
        print(f"\n❌ EMBEDDING ERROR: All candidate models failed. Last error: {str(last_exception)}\n")
        raise ValueError(f"Failed to generate embedding: {str(last_exception)}")

    vector = None
    if hasattr(response, 'embeddings') and response.embeddings:
        vector = response.embeddings[0].values
    elif hasattr(response, 'embedding') and response.embedding:
        vector = response.embedding.values
    else:
        raise ValueError(f"Unexpected embedding response format: {response}")

    if len(vector) > 768:
        vector = vector[:768]

    return list(vector)


def save_recipe(title: str, recipe_text: str, metadata: dict = None) -> str:
    try:
        recipe_id = str(uuid.uuid4())
        vector = get_embedding(recipe_text)

        payload = {
            "title": title,
            "recipe_text": recipe_text
        }
        if metadata:
            payload.update(metadata)

        index.upsert(
            vectors=[
                {
                    "id": recipe_id,
                    "values": vector,
                    "metadata": payload
                }
            ]
        )
        print(f"✅ Saved recipe '{title}' to Pinecone! (ID: {recipe_id})")
        return recipe_id

    except Exception as e:
        print(f"\n❌ SAVE RECIPE ERROR: {str(e)}\n")
        raise e


def search_recipes(query_text: str, top_k: int = 2) -> list[dict]:
    try:
        query_vector = get_embedding(query_text)

        results = index.query(
            vector=query_vector,
            top_k=top_k,
            include_metadata=True
        )

        matched_recipes = []
        for match in results.matches:
            metadata = match.metadata or {}
            matched_recipes.append({
                "score": match.score,
                "title": metadata.get("title", "Untitled Recipe"),
                "recipe_text": metadata.get("recipe_text", "")
            })
        return matched_recipes
    except Exception as e:
        print(f"\n❌ SEARCH RECIPES ERROR: {str(e)}\n")
        raise e
    