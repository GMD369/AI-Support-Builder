from groq import Groq
from app.services.vector_service import search_similar_chunks
from app.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)


def generate_response(question: str, user_id: str, bot_id: str = "default") -> dict:
    chunks = search_similar_chunks(question, user_id, bot_id)

    if not chunks:
        return {
            "answer": "I don't have enough information to answer that question.",
            "context": [],
        }

    context = "\n\n".join(chunks)

    prompt = f"""You are a professional customer support assistant.

Rules:
- Answer ONLY from the context below
- If the answer is not found in the context, say: "I don't know"
- Keep your answer clear and concise

Context:
{context}

Question:
{question}

Answer:"""

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=[
            {"role": "system", "content": "You are a helpful support assistant."},
            {"role": "user", "content": prompt},
        ],
        temperature=0.3,
    )

    answer = response.choices[0].message.content

    return {
        "answer": answer,
        "context": chunks,
    }
