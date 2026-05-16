import re

_SENTENCE_END = re.compile(r'(?<=[.!?])\s+')
TARGET_SIZE = 600
MAX_SIZE = 900


def chunk_text(text: str) -> list[str]:
    paragraphs = [p.strip() for p in re.split(r'\n\s*\n', text) if p.strip()]
    raw_chunks: list[str] = []

    for para in paragraphs:
        if len(para) <= MAX_SIZE:
            raw_chunks.append(para)
        else:
            sentences = _SENTENCE_END.split(para)
            current = ""
            for sentence in sentences:
                sentence = sentence.strip()
                if not sentence:
                    continue
                if len(current) + len(sentence) + 1 <= TARGET_SIZE:
                    current = (current + " " + sentence).strip()
                else:
                    if current:
                        raw_chunks.append(current)
                    if len(sentence) > MAX_SIZE:
                        for i in range(0, len(sentence), TARGET_SIZE):
                            raw_chunks.append(sentence[i:i + TARGET_SIZE])
                    else:
                        current = sentence
            if current:
                raw_chunks.append(current)

    merged: list[str] = []
    acc = ""
    for chunk in raw_chunks:
        if acc and len(acc) + len(chunk) + 1 <= TARGET_SIZE:
            acc = acc + "\n\n" + chunk
        else:
            if acc:
                merged.append(acc)
            acc = chunk
    if acc:
        merged.append(acc)

    return merged
