from groq import Groq
from app.services.vector_service import search_similar_chunks
from app.config import GROQ_API_KEY

client = Groq(api_key=GROQ_API_KEY)


def generate_response(
    question: str,
    user_id: str,
    bot_id: str = "default",
    history: list[dict] | None = None,
) -> dict:
    chunks = search_similar_chunks(question, user_id, bot_id)

    if not chunks:
        return {
            "answer": "I don't have enough information to answer that question.",
            "sources": [],
        }

    context = "\n\n".join(c["content"] for c in chunks)
    sources = list(dict.fromkeys(c["filename"] for c in chunks if c["filename"]))

    system_prompt = (
        "You are a professional customer support assistant.\n"
        "Rules:\n"
        "- Answer ONLY from the context provided below\n"
        "- If the answer is not in the context, say: \"I don't know\"\n"
        "- Keep your answer clear and concise\n\n"
        f"Context:\n{context}"
    )

    messages = [{"role": "system", "content": system_prompt}]

    if history:
        for msg in history[-6:]:
            if msg.get("role") in ("user", "assistant") and msg.get("content"):
                messages.append({"role": msg["role"], "content": msg["content"]})

    messages.append({"role": "user", "content": question})

    response = client.chat.completions.create(
        model="llama-3.3-70b-versatile",
        messages=messages,
        temperature=0.3,
    )

    answer = response.choices[0].message.content

    return {
        "answer": answer,
        "sources": sources,
    }
