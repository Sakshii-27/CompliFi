from typing import List, Dict, Any
import os
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import PromptTemplate
from langchain.chains import LLMChain
from langchain_community.vectorstores import FAISS

# Ensure we ONLY use Gemini 1.5 Pro as requested
GEMINI_MODEL = "gemini-1.5-pro"

SYSTEM_TEMPLATE = """
You are CompliFi, a compliance assistant. Only answer using the provided Stage 1 JSON knowledge base
(Amendments and Compliance Steps). If the user asks anything outside this knowledge base,
politely decline and ask them to upload or run the analysis first.

Use ONLY the retrieved chunks and keep answers grounded.
If the user is asking about a particular amendment, reference it explicitly like:
"Stage 1 → Amendment a" or "Stage 1 → Amendment b" based on the context you see.

If the user asks for next steps, use the sequence implied in the Stage 1 sections (a → b → c) and their content.

Formatting Requirements:
- Use short paragraphs
- Use **bold** for headings
- Use lists for steps
"""

PROMPT_TEMPLATE = """
{system}

Retrieved Context:\n{context}

User Query: {query}

Instructions:
- Answer strictly using the Retrieved Context lines.
- If not found, reply: "I don’t have that in the current Stage 1 JSON. Please upload/run analysis for more context."
- Keep it concise and actionable.
"""

prompt = PromptTemplate(
    template=PROMPT_TEMPLATE,
    input_variables=["system", "context", "query"],
)


def get_llm() -> ChatGoogleGenerativeAI:
    return ChatGoogleGenerativeAI(
        model=GEMINI_MODEL,
        google_api_key=os.getenv("GOOGLE_API_KEY"),
        temperature=0.3,
    )


def answer_query(vectorstore: FAISS, query: str) -> str:
    # Retrieve relevant docs
    docs = vectorstore.similarity_search(query, k=4)
    context = "\n".join([d.page_content for d in docs]) if docs else ""

    llm = get_llm()
    chain = LLMChain(llm=llm, prompt=prompt)

    response = chain.run(system=SYSTEM_TEMPLATE, context=context, query=query)
    return response
