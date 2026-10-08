import os
import sys
from dotenv import load_dotenv

load_dotenv()

passed = 0
failed = 0

print("=" * 50)
print("  API Key Validation Test Suite")
print("=" * 50)

# --- Test 1: Gemini API Key ---
print("\n[1/3] Testing GEMINI_API_KEY...")
try:
    from google import genai
    client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
    for model in ["gemini-3.8-flash", "gemini-2.5-flash"]:
        try:
            response = client.models.generate_content(
                model=model,
                contents="Say hello in exactly 3 words."
            )
            print(f"  PASS - Gemini ({model}) response: {response.text.strip()[:80]}")
            break
        except Exception as inner:
            if model == "gemini-2.5-flash":
                raise inner
            print(f"  Retrying with fallback model ({inner.__class__.__name__})...")
    passed += 1
except Exception as e:
    print(f"  FAIL - Gemini error: {e}")
    failed += 1

# --- Test 2: Pinecone API Key ---
print("\n[2/3] Testing PINECONE_API_KEY...")
try:
    from pinecone import Pinecone
    pc = Pinecone(api_key=os.getenv("PINECONE_API_KEY"))
    indexes = [idx.name for idx in pc.list_indexes()]
    print(f"  PASS - Pinecone connected. Indexes: {indexes}")
    passed += 1
except Exception as e:
    print(f"  FAIL - Pinecone error: {e}")
    failed += 1

# --- Test 3: Groq API Key ---
print("\n[3/3] Testing GROQ_API_KEY...")
try:
    from groq import Groq
    groq_client = Groq(api_key=os.getenv("GROQ_API_KEY"))
    completion = groq_client.chat.completions.create(
        model="qwen/qwen3.8-27b",
        messages=[{"role": "user", "content": "Say hello in exactly 3 words."}],
        max_tokens=20
    )
    reply = completion.choices[0].message.content.strip()
    print(f"  PASS - Groq response: {reply[:80]}")
    passed += 1
except Exception as e:
    print(f"  FAIL - Groq error: {e}")
    failed += 1

# --- Summary ---
print("\n" + "=" * 50)
print(f"  Results: {passed}/3 passed, {failed}/3 failed")
print("=" * 50)

sys.exit(1 if failed > 0 else 0)
