from groq import Groq
from app.services.vector_service import search_similar_chunks
from app.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)

def generate_response(question: str, user_id: str):
    # Step 1: Retrieve relevant chunks
    chunks = search_similar_chunks(question, user_id)

    context = "\n\n".join(chunks)

    # Step 2: Prompt
    prompt = f"""
You are a professional customer support assistant.

Rules:
- Answer ONLY from the context
- If answer not found, say: "I don't know"
- Keep answer clear and short

Context:
{context}

Question:
{question}

Answer:
"""

    # Step 3: Call Groq LLM
    response = client.chat.completions.create(
        model="llama3-70b-8192",  # 🔥 very powerful model
        messages=[
            {"role": "system", "content": "You are a helpful support assistant."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3
    )

    answer = response.choices[0].message.content

    return {
        "answer": answer,
        "context": chunks
    }