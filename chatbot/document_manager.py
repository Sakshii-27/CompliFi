import json
import os
import hashlib
from typing import Dict, Any, Optional, Tuple, List
from langchain_community.vectorstores import FAISS
from langchain.docstore.document import Document
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_google_genai import GoogleGenerativeAIEmbeddings
from dotenv import load_dotenv

load_dotenv()

STORE_DIR = os.path.join(os.path.dirname(__file__), "stores")
META_DIR = os.path.join(STORE_DIR, "meta")

os.makedirs(STORE_DIR, exist_ok=True)
os.makedirs(META_DIR, exist_ok=True)


def sha256_bytes(data: bytes) -> str:
    h = hashlib.sha256()
    h.update(data)
    return h.hexdigest()


def compute_pdf_hash(file_bytes: Optional[bytes], stage1_json: Optional[Dict[str, Any]] = None) -> str:
    """
    Compute stable hash for a document. Prefer hashing the PDF bytes if provided,
    otherwise hash the Stage 1 JSON payload as a fallback so we can still
    maintain incremental updates during development.
    """
    if file_bytes:
        return sha256_bytes(file_bytes)
    # Fallback to JSON hash if no file provided
    payload = json.dumps(stage1_json or {}, sort_keys=True).encode("utf-8")
    return sha256_bytes(payload)


def _stage1_docs_from_json(stage1: Dict[str, Any]) -> List[Document]:
    """
    Convert Stage 1 JSON (a, b, c) into LangChain Documents.
    Expect structure like: {"a": {...}, "b": {...}, "c": {...}}
    We flatten keys and keep clear metadata so answers can cite Stage and point.
    """
    docs: List[Document] = []

    def to_text(section_key: str, obj: Any, path: str = "") -> List[str]:
        lines: List[str] = []
        if isinstance(obj, dict):
            for k, v in obj.items():
                child_path = f"{path}.{k}" if path else k
                lines.extend(to_text(section_key, v, child_path))
        elif isinstance(obj, list):
            for i, v in enumerate(obj):
                child_path = f"{path}[{i}]"
                lines.extend(to_text(section_key, v, child_path))
        else:
            # primitive
            if obj is None:
                return lines
            value = str(obj).strip()
            if value:
                lines.append(f"Stage 1 → {section_key} → {path}: {value}")
        return lines

    for key in ["a", "b", "c"]:
        if key in stage1 and stage1[key] is not None:
            block_lines = to_text(key, stage1[key])
            if not block_lines:
                continue
            content = "\n".join(block_lines)
            docs.append(Document(page_content=content, metadata={
                "stage": "1",
                "section": key
            }))

    return docs


def build_vectorstore_for_stage1(stage1: Dict[str, Any]) -> FAISS:
    splitter = RecursiveCharacterTextSplitter(chunk_size=600, chunk_overlap=80)
    base_docs = _stage1_docs_from_json(stage1)
    chunks = splitter.split_documents(base_docs)
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
    )
    return FAISS.from_documents(chunks, embeddings)


def _paths_for_hash(doc_hash: str) -> Tuple[str, str]:
    index_dir = os.path.join(STORE_DIR, doc_hash)
    meta_path = os.path.join(META_DIR, f"{doc_hash}.json")
    return index_dir, meta_path


def save_vectorstore(doc_hash: str, vs: FAISS, stage1: Dict[str, Any]) -> None:
    index_dir, meta_path = _paths_for_hash(doc_hash)
    os.makedirs(index_dir, exist_ok=True)
    vs.save_local(index_dir)
    meta = {
        "hash": doc_hash,
        "stage": 1,
        "json_fingerprint": sha256_bytes(json.dumps(stage1, sort_keys=True).encode("utf-8")),
        # best-effort doc count approximation (FAISS doesn't expose directly)
        "doc_count": len(stage1.get("a", {}).get("amendments", []))
    }
    with open(meta_path, "w", encoding="utf-8") as f:
        json.dump(meta, f, ensure_ascii=False, indent=2)


def load_vectorstore_if_exists(doc_hash: str) -> Optional[FAISS]:
    index_dir, _ = _paths_for_hash(doc_hash)
    if not os.path.isdir(index_dir):
        return None
    embeddings = GoogleGenerativeAIEmbeddings(
        model="models/embedding-001",
        google_api_key=os.getenv("GOOGLE_API_KEY"),
    )
    try:
        return FAISS.load_local(index_dir, embeddings, allow_dangerous_deserialization=True)
    except Exception:
        return None


def get_or_create_vectorstore(doc_hash: str, stage1: Dict[str, Any]) -> FAISS:
    """
    Return an up-to-date vectorstore. If existing index's fingerprint differs, rebuild.
    """
    index_dir, meta_path = _paths_for_hash(doc_hash)

    existing = load_vectorstore_if_exists(doc_hash)
    desired_fp = sha256_bytes(json.dumps(stage1, sort_keys=True).encode("utf-8"))

    if existing and os.path.exists(meta_path):
        try:
            with open(meta_path, "r", encoding="utf-8") as f:
                meta = json.load(f)
            if meta.get("json_fingerprint") == desired_fp:
                return existing
        except Exception:
            pass

    # Build new
    vs = build_vectorstore_for_stage1(stage1)
    save_vectorstore(doc_hash, vs, stage1)
    return vs


def read_meta(doc_hash: str) -> Optional[Dict[str, Any]]:
    _, meta_path = _paths_for_hash(doc_hash)
    if not os.path.exists(meta_path):
        return None
    try:
        with open(meta_path, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return None
