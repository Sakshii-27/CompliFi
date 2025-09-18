import os
from dotenv import load_dotenv
from groq import Groq
from typing import List, Dict, Optional, Tuple
import json
from datetime import datetime
from vigilo_utils import (
    extract_text_from_file,
)

"""Prompt chain for multi-stage amendment analysis and compliance checks.

Pipeline stages implemented:
 1A) Analyze the first 3 PDFs from backend/data/pdfs (extract and summarize amendments)
 1B) Analyze the next 3 PDFs from backend/data/pdfs (extract and summarize amendments)
  2) Filter amendments for relevance against a company's profile (from backend/data/companies)
  3) Check compliance of the company against relevant amendments using text extracted from the
    first 2 uploaded company PDFs (backend/data/uploads)
  4) Same as stage 3, but for the next 3 uploaded PDFs
  5) Aggregate the results of stages 3 and 4 into a comprehensive JSON compliance report

All stages write detailed JSON logs to backend/data/logs/<company_id>/<timestamp>/
"""

# Load environment (try project root .env.local and default env)
backend_dir = os.path.dirname(__file__)
project_root_env = os.path.abspath(os.path.join(backend_dir, "..", ".env.local"))
load_dotenv(dotenv_path=project_root_env)
load_dotenv(dotenv_path=os.path.join(backend_dir, ".env.local"))
API_KEY = os.getenv("GROQ_API_KEY")
client = Groq(api_key=API_KEY) if API_KEY else None

# Model configuration (per-stage)
# Note: These identifiers are user-specified. Availability depends on the provider configured via Groq client.
# We'll pass them through to call_groq; if unavailable, the fallback logic remains active when client is None.
MODEL_ANALYSIS_A = "llama3-70b-8192"          # Stage 1A (amendment analysis agent A)
MODEL_ANALYSIS_B = "llama-3.3-70b-versatile"           # Stage 1B (amendment analysis agent B)
MODEL_DETAILS = "openai/gpt-oss-120b"        # Stage 2 (relevance & detailed profile match)
MODEL_COMPLIANCE = "openai/gpt-oss-20b"      # Stage 3/4 (evidence-rich compliance checks)
MODEL_OPTIMIZE = "deepseek-r1-distill-llama-70b"  # Stage 5 (comprehensive aggregation & prioritization)
MODEL_DEFAULT = "openai/gpt-oss-120b"

class AmendmentAnalyzer:
    def __init__(self, company_id: Optional[str] = None, log_dir: Optional[str] = None):
        self.stage_outputs: Dict[str, List[str]] = {}
        self.current_amendments: List[Dict] = []
        self.company_id = company_id or "unknown_company"
        # Prepare log directory
        ts = datetime.now().strftime("%Y%m%d_%H%M%S")
        default_log_dir = os.path.join(backend_dir, "data", "logs", self.company_id, ts)
        self.log_dir = log_dir or default_log_dir
        os.makedirs(self.log_dir, exist_ok=True)
    
    @staticmethod
    def _strip_to_json(text: str) -> str:
        """Attempt to extract a JSON object/array from a possibly wrapped reply."""
        if text is None:
            return "{}"
        t = text.strip()
        # Remove code fences if present
        if t.startswith("```"):
            t = "\n".join([line for line in t.splitlines() if not line.strip().startswith("```")])
        # Heuristic: slice from first '{' or '[' to last '}' or ']'
        start = min([pos for pos in [t.find('{'), t.find('[')] if pos != -1] or [0])
        end = max(t.rfind('}'), t.rfind(']'))
        if end != -1 and end >= start:
            return t[start:end+1]
        return t
        
    def log_stage(self, stage_name: str, message: str):
        """Log stage progress with timestamp"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        log_entry = f"[{timestamp}] {stage_name.upper()}: {message}"
        print(log_entry)
        self.stage_outputs[stage_name] = self.stage_outputs.get(stage_name, []) + [log_entry]

    def _write_json(self, filename: str, data: Dict):
        try:
            path = os.path.join(self.log_dir, filename)
            with open(path, "w", encoding="utf-8") as f:
                json.dump(data, f, indent=2, ensure_ascii=False)
        except Exception as e:
            self.log_stage("ERROR", f"Failed writing {filename}: {e}")

    def call_groq(self, prompt: str, model: str = MODEL_DEFAULT, temperature: float = 0.2) -> str:
        """Make API call to Groq with specified model. On failure, retry once with MODEL_DEFAULT."""
        try:
            if client is None:
                # Fallback: return a minimal JSON placeholder so pipeline continues
                self.log_stage("WARN", "GROQ API key missing — using local fallback response")
                # Heuristic: return empty amendments array wrapper
                return json.dumps({"amendments": []})
            response = client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=model,
                temperature=temperature
            )
            return response.choices[0].message.content
        except Exception as e:
            # Attempt a single retry with default model if a non-default model was requested
            if model != MODEL_DEFAULT and client is not None:
                self.log_stage("WARN", f"Model '{model}' failed ({e}); retrying with default '{MODEL_DEFAULT}'")
                try:
                    response = client.chat.completions.create(
                        messages=[{"role": "user", "content": prompt}],
                        model=MODEL_DEFAULT,
                        temperature=temperature
                    )
                    return response.choices[0].message.content
                except Exception as e2:
                    self.log_stage("ERROR", f"Retry with default model failed: {e2}")
                    raise
            self.log_stage("ERROR", f"Groq API call failed: {str(e)}")
            raise

    # -------- File helpers --------
    @staticmethod
    def _first_n_pdfs_from(dir_path: str, limit: int) -> List[str]:
        try:
            files = [f for f in os.listdir(dir_path) if f.lower().endswith(".pdf")]
            files.sort()  # deterministic
            return [os.path.join(dir_path, f) for f in files[:limit]]
        except Exception:
            return []

    @staticmethod
    def _titles_from_paths(paths: List[str]) -> List[str]:
        return [os.path.splitext(os.path.basename(p))[0] for p in paths]

    @staticmethod
    def _load_pdf_dicts_from_dir(dir_path: str, limit: int = 5) -> List[Dict]:
        paths = AmendmentAnalyzer._first_n_pdfs_from(dir_path, limit)
        out: List[Dict] = []
        for p in paths:
            text = extract_text_from_file(p)
            out.append({
                "title": os.path.basename(p),
                "date": "",
                "content": text or "",
                "source_path": p,
            })
        return out

    def analyze_amendments_batch(self, amendments: List[Dict], stage_label: str, model: str) -> List[Dict]:
        """Stage 1 batch analysis helper: analyze a provided list of amendments.
        Writes per-batch JSON logs and returns structured summaries.
        """
        count = len(amendments)
        self.log_stage(stage_label, f"Starting analysis of {count} amendments")

        amendment_texts = "\n\n".join([
            f"### {a['title']}\nDate: {a['date']}\n{a['content'][:2000]}..."
            for a in amendments
        ])

        prompt = (
            "You are a compliance expert.\n\n"
            "**Task**: Analyze these latest FSSAI amendments and provide concise summaries focusing on key compliance requirements.\n\n"
            "**Amendments**:\n" + amendment_texts + "\n\n"
            "**Instructions**:\n"
            "SKIP HINDI CONTENT\n"
            "1. For each amendment, extract:\n"
            "   - Purpose/scope (1-2 sentences)\n"
            "   - Key requirements (5-8 highly specific points, quote where possible)\n"
            "   - Concrete actions the company must perform (operational steps, not generic)\n"
            "   - Any explicit dates, compliance windows, or deadlines mentioned in the amendment text\n"
            "     - Provide both normalized date (YYYY-MM-DD) when possible and raw snippet\n"
            "   - Affected business types (manufacturer/distributor/etc.)\n"
            "   - Potential impact level (High/Medium/Low)\n"
            "2. Maintain original amendment titles for reference.\n"
            "3. Prefer extracting dates directly from text like \"effective from\", \"not later than\", \"within X days\" (normalize relative deadlines assuming current month-end if exact date missing).\n"
            "4. Output strict JSON only in this format:\n"
            "{\n"
            "  \"amendments\": [\n"
            "    {\n"
            "      \"title\": \"Original title\",\n"
            "      \"summary\": \"Brief purpose\",\n"
            "      \"requirements\": [\"list of specific, quotable requirements\"],\n"
            "      \"details\": \"A lot of Concrete actions expected from companies (operational steps).\",\n"
            "      \"deadlines\": [\n"
            "        {\"date\": \"YYYY-MM-DD or Unknown\", \"raw\": \"verbatim snippet containing the date or timeframe\"}\n"
            "      ],\n"
            "      \"affected_businesses\": [\"list\"],\n"
            "      \"impact\": \"High/Medium/Low\"\n"
            "    }\n"
            "  ]\n"
            "}"
        )
        
        # If API client missing, create a simple deterministic summary
        if client is None:
            self.log_stage(stage_label, "Using local fallback analysis for amendments")
            summaries = []
            for a in amendments:
                summaries.append({
                    "title": a.get("title", "Untitled"),
                    "summary": (a.get("content", "")[:200] + '...') if a.get("content") else a.get("title", ""),
                    "requirements": [],
                    "details": "",
                    "deadlines": [],
                    "affected_businesses": [],
                    "impact": "Medium"
                })
            self._write_json(f"{stage_label.lower().replace(' ', '_')}_amendment_summaries.json", {"amendments": summaries})
            return summaries

        response = self.call_groq(prompt, model=model)
        self.log_stage(stage_label, "Received amendment analysis")
        try:
            result = json.loads(self._strip_to_json(response))
            if isinstance(result, list):
                amendments_out = result
                result = {"amendments": amendments_out}
            else:
                amendments_out = result.get("amendments", [])
            self._write_json(f"{stage_label.lower().replace(' ', '_')}_amendment_summaries.json", result)
            return amendments_out
        except json.JSONDecodeError:
            self.log_stage("ERROR", f"Failed to parse amendment analysis JSON for {stage_label}")
            raise

    def filter_by_company_profile(self, company_data: Dict) -> List[Dict]:
        """Stage 2: Filter amendments relevant to company's basic profile"""
        # Normalize company_data to a dict and guard against missing keys
        if isinstance(company_data, list):
            company = company_data[0] if company_data else {}
        elif isinstance(company_data, dict):
            company = company_data
        else:
            company = {}

        cname = company.get('name', 'Company')
        ctype = company.get('business_type', company.get('type', 'business'))
        cdesc = company.get('description', company.get('operations', ''))
        fssai_license = company.get('fssai_license', '')
        fssai_validity = company.get('fssai_validity', '')

        self.log_stage("STAGE 2", f"Filtering for {cname}")
        
        amendments_text = "\n\n".join([
            f"### {a.get('title','Untitled')}\n{a.get('summary','')}\nAffects: {', '.join(a.get('affected_businesses') or [])}"
            for a in self.current_amendments
        ])
        
        prompt = f"""You are a compliance expert.

**Task**: Identify which amendments potentially affect {cname} based on their business profile.

**Company Profile**:
- Name: {cname}
- Type: {ctype}
- Operations: {cdesc}
- FSSAI License: {fssai_license} (Valid until {fssai_validity})

**Amendments**:
{amendments_text}

**Instructions**:
1. Analyze each amendment against the company profile.
2. Return ONLY amendments that COULD apply (even if uncertain).
3. For each relevant amendment, add:
   - 'relevance_reason': 1-sentence explanation grounded in the profile.
   - 'potential_impact': Brief note (what area would be affected and why).
   - 'assumed_product_categories': if not explicit, infer likely categories.
4. Maintain all original amendment data (including any 'deadlines' you extracted).
5. Output strict JSON in the same format with added fields only.
"""
        
        if client is None:
            self.log_stage("STAGE 2", "Using local fallback filter for company profile")
            filtered = []
            for a in self.current_amendments:
                filtered.append({**a, "relevance_reason": f"Potentially relevant to {ctype}", "potential_impact": a.get('impact', 'Medium')})
            self.current_amendments = filtered
            self._write_json("stage2_relevant_amendments.json", {"amendments": filtered})
            return filtered

        response = self.call_groq(prompt, model=MODEL_DETAILS)
        try:
            result = json.loads(self._strip_to_json(response))
            if isinstance(result, list):
                amendments_out = result
                result = {"amendments": amendments_out}
            else:
                amendments_out = result.get("amendments", [])
            self.log_stage("STAGE 2", f"Filtered to {len(amendments_out)} potentially relevant amendments")
            self.current_amendments = amendments_out
            self._write_json("stage2_relevant_amendments.json", result)
            return amendments_out
        except json.JSONDecodeError:
            self.log_stage("ERROR", "Failed to parse company filter JSON")
            raise

    def check_documents_against_amendments(self, docs_texts: List[Tuple[str, str]], stage_name: str) -> Dict:
        """Generic document compliance check for a batch of company documents.
        docs_texts: list of tuples (filename, extracted_text)
        Returns a JSON-serializable dict summarizing compliance per amendment and document.
        """
        self.log_stage(stage_name, f"Checking {len(docs_texts)} company documents against {len(self.current_amendments)} amendments")

        docs_block = "\n\n".join([
            f"### {fn}\n{(txt or '')[:4000]}" for fn, txt in docs_texts
        ])
        amendments_text = "\n\n".join([
            f"### {a['title']}\nSummary: {a.get('summary','')}\nRequirements:\n- " + "\n- ".join(a.get('requirements', []) or [])
            for a in self.current_amendments
        ])

        prompt = (
            "You are a compliance auditor and persuasive report writer.\n\n"
            "Given the relevant regulatory amendments and the company's submitted documents, assess compliance.\n\n"
            "Amendments:\n" + amendments_text + "\n\n"
            "Company Documents (text extracts):\n" + docs_block + "\n\n"
            "Instructions:\n"
            "1. For each amendment, evaluate whether the documents demonstrate compliance.\n"
            "2. Extract brief quotes with page indicators or surrounding context (e.g., \"...\") that show current practices; provide at least 2-3 evidence items if available.\n"
            "3. If non-compliant or unclear, specify exactly what is missing and provide step-by-step corrective actions (who, what, artifacts, sign-offs).\n"
            "4. Capture any explicit deadlines found in either the amendment text or company documents. Avoid \"Unknown\" when phrases like \"within 30 days\" or \"by 31st March\" exist—normalize to YYYY-MM-DD when possible; otherwise include raw text.\n"
            "5. Classify urgency realistically (Critical/High/Medium/Low) based on deadline proximity and risk.\n"
            "6. Output strict JSON only in this schema:\n"
            "{\n"
            "  \"document_compliance\": [\n"
            "    {\n"
            "      \"amendment_title\": \"...\",\n"
            "      \"status\": \"compliant|non_compliant|unclear\",\n"
            "      \"current_practices\": [\"what company appears to be doing now\"],\n"
            "      \"evidence\": [\"brief quotes + page/context\"],\n"
            "      \"gaps\": [\"what is the company having right now which is wrong\"],\n"
            "      \"actions\": [\"specific, step-by-step corrective tasks\"],\n"
            "      \"last_date\": \"YYYY-MM-DD or Unknown\",\n"
            "      \"deadline_text\": \"raw phrase if normalization unclear\",\n"
            "      \"urgency\": \"Critical|High|Medium|Low\"\n"
            "    }\n"
            "  ]\n"
            "}"
        )

        if client is None:
            # Fallback heuristic: mark as unclear
            result = {
                "document_compliance": [
                    {
                        "amendment_title": a.get("title", ""),
                        "status": "unclear",
                        "current_practices": [],
                        "evidence": [],
                        "gaps": [],
                        "actions": [],
                        "last_date": "Unknown",
                        "deadline_text": "",
                        "urgency": a.get("impact", "Medium"),
                    }
                    for a in self.current_amendments
                ]
            }
            self._write_json(f"{stage_name.lower()}_doc_compliance.json", result)
            return result

        response = self.call_groq(prompt, model=MODEL_COMPLIANCE)
        try:
            result = json.loads(self._strip_to_json(response))
            if isinstance(result, list):
                result = {"document_compliance": result}
            self._write_json(f"{stage_name.lower()}_doc_compliance.json", result)
            return result
        except json.JSONDecodeError:
            self.log_stage("ERROR", f"Failed to parse document compliance JSON for {stage_name}")
            raise

    def aggregate_reports(self, first_batch: Dict, second_batch: Dict) -> Dict:
        """Stage 5: Aggregate two document compliance batches into a comprehensive report."""
        self.log_stage("STAGE 5", "Aggregating compliance results into final report")

        prompt = (
            "You are a compliance program manager and a dramatic, persuasive writer.\n\n"
            "Combine the following compliance assessments into a single comprehensive report with clear prioritization and department-wise actions. DO NOT REMOVE DETAILINGS FROM THE REPORTS. Write in an impactful, vivid tone. If evidence is thin, you may make small, reasonable assumptions to craft a compelling narrative.\n"
            "Output strict JSON only.\n\n"
            "Input A (first 2 docs):\n" + json.dumps(first_batch)[:8000] + "\n\n"
            "Input B (next 3 docs):\n" + json.dumps(second_batch)[:8000] + "\n\n"
            "Required JSON schema (ensure you propagate any deadlines; when present, avoid returning \"Unknown\"):\n"
            "{\n"
            "  \"compliance_report\": {\n"
            "    \"overall_status\": \"compliant|partially_compliant|non_compliant|unclear\",\n"
            "    \"summary\": \"short executive summary\",\n"
            "    \"dramatic_narrative\": \"a vivid story of current state vs desired state\",\n"
            "    \"by_amendment\": [\n"
            "      {\n"
            "        \"amendment_title\": \"...\",\n"
            "        \"status\": \"compliant|non_compliant|unclear\",\n"
            "        \"current_state\": \"what the company is doing now (inferred from docs)\",\n"
            "        \"to_be_done\": \"what needs to change, with justification\",\n"
            "        \"evidence\": [\"quotes or references DETAILED. what is company having right now? what is company doing wrong? \"],\n"
            "        \"gaps\": [\"...\"],\n"
            "        \"actions\": [\"concrete, dramatic steps\"],\n"
            "        \"last_date\": \"YYYY-MM-DD or 2025-12-31\",\n"
            "        \"urgency\": \"Critical|High|Medium|Low\"\n"
            "      }\n"
            "    ],\n"
            "    \"prioritized_actions\": [\n"
            "      {\"department\": \"Legal|Quality|Packaging|Regulatory\", \"task\": \"...\", \"due\": \"YYYY-MM-DD or Unknown\", \"urgency\": \"...\", \"rationale\": \"why this matters now\"}\n"
            "    ],\n"
            "    \"timeline\": [\n"
            "      {\n"
            "        \"timeframe\": \"Immediate (1-2 weeks)|Short-term (3-4 weeks)|Ongoing\",\n"
            "        \"actions\": [\n"
            "          {\n"
            "            \"department\": \"...\", \"task\": \"...\", \"due\": \"YYYY-MM-DD or Unknown\", \"urgency\": \"Critical|High|Medium|Low\", \"steps\": [\"...\"]\n"
            "          }\n"
            "        ]\n"
            "      }\n"
            "    ],\n"
            "    \"important_dates\": [\n"
            "      {\n"
            "        \"label\": \"e.g., Packaging update deadline\",\n"
            "        \"date\": \"YYYY-MM-DD\",\n"
            "        \"source\": \"amendment_title or doc reference\"\n"
            "      }\n"
            "    ]\n"
            "  }\n"
            "}"
        )

        if client is None:
            # Simple aggregation
            combined = (first_batch.get("document_compliance", []) or []) + (second_batch.get("document_compliance", []) or [])
            # Build naive important_dates and timeline from available fields
            imp_dates = []
            timeline_actions = []
            for item in combined:
                last_date = item.get("last_date") or item.get("due")
                if last_date and last_date != "Unknown":
                    imp_dates.append({
                        "label": f"{item.get('amendment_title','Amendment')} due",
                        "date": last_date,
                        "source": item.get('amendment_title','')
                    })
                timeline_actions.append({
                    "department": item.get("department", "Regulatory"),
                    "task": item.get("to_be_done") or (item.get("actions", ["Follow-up"])[0] if item.get("actions") else "Follow-up"),
                    "due": last_date or "Unknown",
                    "urgency": item.get("urgency", "Medium"),
                })
            timeline = [
                {"timeframe": "Immediate (1-2 weeks)", "actions": timeline_actions[:3]},
                {"timeframe": "Short-term (3-4 weeks)", "actions": timeline_actions[3:6]},
                {"timeframe": "Ongoing", "actions": timeline_actions[6:]},
            ]
            report = {
                "compliance_report": {
                    "overall_status": "unclear",
                    "summary": "LLM unavailable; heuristic aggregation of findings",
                    "dramatic_narrative": "With limited signals, the compliance posture remains shrouded. A swift internal audit can cut through the fog.",
                    "by_amendment": [
                        {
                            **item,
                            "current_state": "Insufficient evidence; current practice unclear.",
                            "to_be_done": "Run a gap assessment this week and document SOP updates.",
                            "evidence": item.get("evidence", []),
                            "gaps": item.get("gaps", []),
                            "actions": item.get("actions", []) or ["Appoint a compliance owner", "Draft corrective plan", "Review labels/SOPs"],
                        } for item in combined
                    ],
                    "prioritized_actions": [
                        {"department": "Regulatory", "task": "Name a single-threaded owner for FSSAI compliance", "due": "Unknown", "urgency": "High", "rationale": "Ownership accelerates fixes"}
                    ],
                    "timeline": [slot for slot in timeline if slot["actions"]],
                    "important_dates": imp_dates
                }
            }
            self._write_json("stage5_final_report.json", report)
            return report

        response = self.call_groq(prompt, model=MODEL_OPTIMIZE)
        try:
            result = json.loads(self._strip_to_json(response))
            if isinstance(result, list):
                result = {"compliance_report": {"by_amendment": result}}
            # Ensure required fields exist for frontend consumption
            cr = result.setdefault("compliance_report", {})
            by_amendment = cr.get("by_amendment") or []
            prioritized = cr.get("prioritized_actions") or []
            # important_dates
            if not cr.get("important_dates"):
                imp_dates = []
                for a in by_amendment:
                    d = a.get("last_date") or a.get("due") or a.get("deadline")
                    if d and d != "Unknown":
                        imp_dates.append({
                            "label": f"{a.get('amendment_title','Amendment')} deadline",
                            "date": d,
                            "source": a.get('amendment_title','')
                        })
                for p in prioritized:
                    d = p.get("due")
                    if d and d != "Unknown":
                        imp_dates.append({
                            "label": p.get('task','Action'),
                            "date": d,
                            "source": p.get('department','')
                        })
                cr["important_dates"] = imp_dates
            # timeline
            if not cr.get("timeline"):
                # Build a 3-slot timeline from prioritized actions
                actions = [
                    {
                        "department": p.get("department","General"),
                        "task": p.get("task","Action"),
                        "due": p.get("due","Unknown"),
                        "urgency": p.get("urgency","Medium"),
                    } for p in prioritized
                ]
                timeline = [
                    {"timeframe": "Immediate (1-2 weeks)", "actions": actions[:3]},
                    {"timeframe": "Short-term (3-4 weeks)", "actions": actions[3:6]},
                    {"timeframe": "Ongoing", "actions": actions[6:]},
                ]
                cr["timeline"] = [slot for slot in timeline if slot["actions"]]
            # Persist for logs
            self._write_json("stage5_final_report.json", result)
            return result
        except json.JSONDecodeError:
            self.log_stage("ERROR", "Failed to parse final report JSON")
            raise

    def run_full_chain(self, company_data: Dict, uploads_dir: str) -> Dict:
        """Execute the required 5-stage pipeline using on-disk PDFs.
        - Amendments are the first 5 PDFs from backend/data/pdfs
        - Company uploads are taken from uploads_dir (first 2, then next 3)
        """
        self.log_stage("START", f"Beginning analysis for {company_data.get('name','Company')}")

        # Load first 6 amendments from backend/data/pdfs
        pdfs_dir = os.path.join(backend_dir, "data", "pdfs")
        amendments = self._load_pdf_dicts_from_dir(pdfs_dir, limit=6)
        self._write_json("inputs_amendments.json", {"amendments": amendments})

        # Stage 1A: first 3
        first3 = amendments[:3]
        try:
            batch1 = self.analyze_amendments_batch(first3, stage_label="STAGE 1A", model=MODEL_ANALYSIS_A)
        except Exception as e:
            self.log_stage("STAGE 1A", f"Error: {e}. Proceeding with naive summaries for batch 1.")
            batch1 = [{
                "title": a.get("title", "Untitled"),
                "summary": (a.get("content", "")[:200] + "...") if a.get("content") else a.get("title", ""),
                "requirements": [],
                "affected_businesses": [],
                "impact": "Medium"
            } for a in first3]
            self._write_json("stage_1a_amendment_summaries.json", {"amendments": batch1})

        # Stage 1B: next 3
        next3 = amendments[3:6]
        try:
            batch2 = self.analyze_amendments_batch(next3, stage_label="STAGE 1B", model=MODEL_ANALYSIS_B)
        except Exception as e:
            self.log_stage("STAGE 1B", f"Error: {e}. Proceeding with naive summaries for batch 2.")
            batch2 = [{
                "title": a.get("title", "Untitled"),
                "summary": (a.get("content", "")[:200] + "...") if a.get("content") else a.get("title", ""),
                "requirements": [],
                "affected_businesses": [],
                "impact": "Medium"
            } for a in next3]
            self._write_json("stage_1b_amendment_summaries.json", {"amendments": batch2})

        # Combine Stage 1A + 1B
        combined_amendments = (batch1 or []) + (batch2 or [])
        self.current_amendments = combined_amendments
        self._write_json("stage1_combined_summaries.json", {"amendments": combined_amendments})

        # Stage 2
        try:
            self.filter_by_company_profile(company_data)
        except Exception as e:
            self.log_stage("STAGE 2", f"Error: {e}. Keeping all amendments as relevant.")
            self._write_json("stage2_relevant_amendments.json", {"amendments": self.current_amendments})

        # Prepare company documents from uploads_dir
        upload_paths = AmendmentAnalyzer._first_n_pdfs_from(uploads_dir, limit=5)
        upload_texts: List[Tuple[str, str]] = [(os.path.basename(p), extract_text_from_file(p) or "") for p in upload_paths]
        self._write_json("inputs_company_uploads.json", {"files": [u[0] for u in upload_texts]})

        # Stage 3: first 2
        first2 = upload_texts[:2]
        try:
            stage3_res = self.check_documents_against_amendments(first2, stage_name="STAGE 3")
        except Exception as e:
            self.log_stage("STAGE 3", f"Error: {e}. Using empty compliance list.")
            stage3_res = {"document_compliance": []}
            self._write_json("stage3_doc_compliance.json", stage3_res)

        # Stage 4: next 3
        next3 = upload_texts[2:5]
        try:
            stage4_res = self.check_documents_against_amendments(next3, stage_name="STAGE 4")
        except Exception as e:
            self.log_stage("STAGE 4", f"Error: {e}. Using empty compliance list.")
            stage4_res = {"document_compliance": []}
            self._write_json("stage4_doc_compliance.json", stage4_res)

        # Stage 5: aggregate
        try:
            final_report = self.aggregate_reports(stage3_res, stage4_res)
        except Exception as e:
            self.log_stage("STAGE 5", f"Error: {e}. Building heuristic final report.")
            combined = (stage3_res.get("document_compliance", []) or []) + (stage4_res.get("document_compliance", []) or [])
            final_report = {
                "compliance_report": {
                    "overall_status": "unclear",
                    "summary": "LLM unavailable or parse error; heuristic aggregation",
                    "by_amendment": combined,
                    "prioritized_actions": []
                }
            }
            self._write_json("stage5_final_report.json", final_report)

        self._write_json("analysis_steps.json", self.stage_outputs)
        self.log_stage("COMPLETE", "Analysis finished successfully")

        return {
            "logs_dir": self.log_dir,
            "analysis_steps": self.stage_outputs,
            "amendments_count": len(amendments),
            "final_report": final_report,
        }

# Example Usage
if __name__ == "__main__":
    # Simple manual test using dummy company and uploads dir
    dummy_company = {
        "name": "Demo Co",
        "business_type": "manufacturer",
        "description": "Makes demo products",
        "fssai_license": "",
        "fssai_validity": "",
    }
    uploads = os.path.join(backend_dir, "data", "uploads")
    analyzer = AmendmentAnalyzer(company_id="demo")
    output = analyzer.run_full_chain(dummy_company, uploads_dir=uploads)
    print(json.dumps(output, indent=2))