# Multi-Format Document Upload — Implementation Plan

**Feature:** Support PDF, DOCX, XLSX, and Markdown file uploads in addition to plain text.  
**Date:** 2026-05-10  
**Status:** Pending

---

## Overview

Currently the upload pipeline only accepts UTF-8 `.txt` files. The goal is to extract plain text from multiple file formats and feed it into the existing chunking → embedding → pgvector pipeline without changing anything downstream.

```
Upload (PDF/DOCX/TXT/MD/XLSX)
        ↓
  [NEW] file_parser.py  ← extract plain text
        ↓
  chunking.py           ← 500-char chunks  (unchanged)
        ↓
  embedding_service.py  ← all-MiniLM-L6-v2 (unchanged)
        ↓
  PostgreSQL/pgvector   ← document_chunks   (unchanged)
```

---

## 1. Backend

### 1.1 New Dependencies

File: `backend/requirements.txt` — add these two lines:

```
pypdf==4.3.1
python-docx==1.1.2
openpyxl==3.1.5
```

Install after adding:
```bash
pip install pypdf python-docx openpyxl
```

---

### 1.2 New File: `backend/app/services/file_parser.py`

Responsibility: receive raw bytes + filename, return a plain-text string.

```python
import io
from fastapi import HTTPException


SUPPORTED_EXTENSIONS = {".txt", ".md", ".pdf", ".docx", ".xlsx"}


def extract_text(filename: str, content: bytes) -> str:
    ext = _get_extension(filename)

    if ext not in SUPPORTED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail=f"Unsupported file type '{ext}'. Allowed: {', '.join(sorted(SUPPORTED_EXTENSIONS))}",
        )

    if ext in (".txt", ".md"):
        return _parse_text(content)
    if ext == ".pdf":
        return _parse_pdf(content)
    if ext == ".docx":
        return _parse_docx(content)
    if ext == ".xlsx":
        return _parse_xlsx(content)


def _get_extension(filename: str) -> str:
    dot = filename.rfind(".")
    return filename[dot:].lower() if dot != -1 else ""


def _parse_text(content: bytes) -> str:
    try:
        return content.decode("utf-8")
    except UnicodeDecodeError:
        raise HTTPException(status_code=400, detail="Text file must be UTF-8 encoded")


def _parse_pdf(content: bytes) -> str:
    try:
        import pypdf
        reader = pypdf.PdfReader(io.BytesIO(content))
        pages = [page.extract_text() or "" for page in reader.pages]
        text = "\n\n".join(pages).strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse PDF: {e}")

    if not text:
        raise HTTPException(
            status_code=400,
            detail="PDF contains no extractable text (scanned/image-only PDFs are not supported)",
        )
    return text


def _parse_docx(content: bytes) -> str:
    try:
        import docx
        doc = docx.Document(io.BytesIO(content))
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        text = "\n\n".join(paragraphs).strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse DOCX: {e}")

    if not text:
        raise HTTPException(status_code=400, detail="DOCX file contains no readable text")
    return text


def _parse_xlsx(content: bytes) -> str:
    try:
        import openpyxl
        wb = openpyxl.load_workbook(io.BytesIO(content), read_only=True, data_only=True)
        rows = []
        for sheet in wb.worksheets:
            for row in sheet.iter_rows(values_only=True):
                line = "\t".join(str(c) for c in row if c is not None)
                if line.strip():
                    rows.append(line)
        text = "\n".join(rows).strip()
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Failed to parse XLSX: {e}")

    if not text:
        raise HTTPException(status_code=400, detail="XLSX file contains no readable data")
    return text
```

---

### 1.3 Update: `backend/app/routers/documents.py`

**Change 1:** Add import at top:
```python
from app.services.file_parser import extract_text, SUPPORTED_EXTENSIONS
```

**Change 2:** Add file size guard before reading content (after the bot ownership check):
```python
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10 MB

if file.size and file.size > MAX_FILE_SIZE:
    raise HTTPException(status_code=400, detail="File too large. Maximum size is 10 MB.")
```

**Change 3:** Replace the decode block:
```python
# BEFORE (remove this):
try:
    text_data = content.decode("utf-8")
except UnicodeDecodeError:
    raise HTTPException(status_code=400, detail="File must be UTF-8 encoded text")

# AFTER (replace with):
text_data = extract_text(filename, content)
```

No other changes to `documents.py` — chunking, embedding, and DB insert stay identical.

---

## 2. Frontend

### 2.1 Update: `frontend/app/dashboard/bots/[botId]/page.tsx`

**Change 1:** Update the file `<input>` accept attribute:
```tsx
// BEFORE:
<input type="file" accept=".txt" ... />

// AFTER:
<input type="file" accept=".txt,.md,.pdf,.docx,.xlsx" ... />
```

**Change 2:** Update the helper label text near the upload button:
```tsx
// BEFORE:
<p>Upload .txt files</p>

// AFTER:
<p>Supported: .txt, .md, .pdf, .docx, .xlsx (max 10 MB)</p>
```

---

## 3. Implementation Order

| Step | Task | File(s) |
|------|------|---------|
| 1 | Add packages to requirements.txt | `backend/requirements.txt` |
| 2 | `pip install pypdf python-docx openpyxl` | terminal |
| 3 | Create `file_parser.py` | `backend/app/services/file_parser.py` |
| 4 | Update `documents.py` (import + size guard + extract_text call) | `backend/app/routers/documents.py` |
| 5 | Update file input accept + label | `frontend/app/dashboard/bots/[botId]/page.tsx` |
| 6 | Restart backend, test each format manually | — |

---

## 4. Testing Checklist

- [ ] Upload a `.txt` file — existing behavior unchanged
- [ ] Upload a `.pdf` with real text — chunks created correctly
- [ ] Upload a scanned PDF (image-only) — returns clear 400 error
- [ ] Upload a `.docx` — paragraphs extracted
- [ ] Upload an `.xlsx` — rows extracted as tab-separated lines
- [ ] Upload a `.exe` or `.zip` — rejected with 400
- [ ] Upload a file > 10 MB — rejected with 400
- [ ] Chat with a bot after uploading PDF — RAG answers correctly

---

## 5. Known Limitations

| Limitation | Reason | Workaround |
|---|---|---|
| Scanned PDFs not supported | Requires OCR (Tesseract) | Upload text-based PDFs only |
| `.doc` (old Word binary) not supported | Requires system binary `antiword` | Convert to `.docx` first |
| `.pptx` not supported | Out of scope for now | Can add `python-pptx` later |
| Chunking is character-based (500 chars) | May split mid-sentence | Acceptable for MVP |
