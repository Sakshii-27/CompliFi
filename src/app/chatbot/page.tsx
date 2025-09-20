"use client";
import React, { useEffect, useRef, useState } from "react";
import "./app.css";
import "./chatbot.css";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// Format message text with basic rich text
const formatMessageText = (text: string) => {
  if (!text) return "";
  let formatted = text
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g, "<em>$1</em>")
    .replace(/^(\d+)\.\s+(.+)$/gm, '<div style="margin: 12px 0;"><span class="step-number">$1</span>$2</div>')
    .replace(/^[*-]\s+(.+)$/gm, "<li>$1</li>")
    .replace(/\n\n/g, "</p><p>")
    .replace(/\n/g, "<br>")
    .replace(/^(.+)/, "<p>$1")
    .replace(/(.+)$/, "$1</p>")
    .replace(/(<li>.*?<\/li>)(\s*<li>.*?<\/li>)*/g, (match) => {
      return "<ul>" + match + "</ul>";
    })
    .replace(/<p><\/p>/g, "")
    .replace(/<p>\s*<\/p>/g, "");
  return formatted;
};

// Lightweight compliance glossary with fuzzy term matching
const COMPLIANCE_GLOSSARY: Array<{ terms: string[]; content: string }> = [
  {
    terms: ["fssai", "food safety and standards"],
    content: `Hello! I'm CompliFi, your AI-powered compliance intelligence assistant, and I'm happy to help you understand **FSSAI**.

Key Information:

- The **Food Safety and Standards Authority of India (FSSAI)** is the national regulator for food safety. It sets standards, issues licenses, monitors compliance, and conducts inspections to protect public health.
- Compliance covers labeling, licensing/registration, hygiene practices, product standards, claims/advertising norms, and documentation.

Key Responsibilities:

1) **Standards & Quality** — manufacturing, processing, distribution, storage, sale, import.
2) **Licensing & Registration** — FBOs must register/license based on turnover/operations.
3) **Inspection & Enforcement** — surveillance, sampling, recalls, penalties.
4) **Awareness & Education** — safe food practices, transparency.

Frameworks: Food Safety and Standards Act, 2006; FSS (Packaging & Labelling), FSS (Licensing & Registration), FSS (Food Product Standards & Additives), plus notifications.
`,
  },
  {
    terms: ["gst", "goods and services tax"],
    content: `**GST (Goods and Services Tax)** is India's unified indirect tax that subsumes several central and state taxes.

Core Responsibilities:

1) **Registration & Classification** (HSN/SAC)
2) **Tax Invoicing** (GSTINs, invoice data, HSN/SAC, place of supply, rates)
3) **Returns & Payments** (GSTR-1/3B, reconciliation with GSTR-2A/2B)
4) **Input Tax Credit** (supplier compliance, receipt of goods/services, tax paid)
5) **Records & Audits** (books, e-invoicing/e-waybill as applicable)

Frameworks: CGST/SGST Acts & Rules, GST Council notifications, CBIC circulars.
`,
  },
  {
    terms: ["gdpr", "general data protection regulation"],
    content: `**GDPR** is the EU's data protection law covering lawful basis, consent, transparency, data subject rights, DPIAs, breach notification, and cross-border transfers.`,
  },
  {
    terms: ["hipaa"],
    content: `**HIPAA** (US) sets standards for protected health information (PHI): Privacy Rule, Security Rule, Breach Notification, Business Associate Agreements.`,
  },
  {
    terms: ["iso 27001", "iso/iec 27001", "information security management"],
    content: `**ISO/IEC 27001** specifies an ISMS framework: risk assessment, Annex A controls, policies, audits, and continual improvement.`,
  },
  {
    terms: ["pci dss", "pci"],
    content: `**PCI DSS** sets security requirements for organizations handling cardholder data (network segmentation, encryption, logging, testing, policies).`,
  },
  {
    terms: ["sebi"],
    content: `**SEBI** regulates India's securities market—intermediary registration, disclosures, insider trading norms, surveillance, and enforcement.`,
  },
  {
    terms: ["rbi"],
    content: `**RBI** regulates banking/financial services—licensing, prudential norms, KYC/AML, fair practices, digital lending directives.`,
  },
  {
    terms: ["bis", "bureau of indian standards"],
    content: `**BIS** sets product standards and certification schemes (ISI, CRS). Many electronics and industrial goods require BIS compliance.`,
  },
  {
    terms: ["iec", "import export code"],
    content: `**IEC** (Import Export Code) from DGFT is mandatory for import/export activities in India.`,
  },
  {
    terms: ["dgft"],
    content: `**DGFT** manages India's foreign trade policies, licensing (e.g., IEC), and export promotion schemes.`,
  },
  {
    terms: ["msme", "udyam"],
    content: `**MSME/Udyam** registration provides classification benefits and access to specific schemes and tenders.`,
  },
  {
    terms: ["haccp"],
    content: `**HACCP** is a preventive food safety approach focusing on hazard analysis and critical control points.`,
  },
  {
    terms: ["gmp", "good manufacturing practices"],
    content: `**GMP** covers controls and procedures to ensure products are consistently produced and controlled to quality standards.`,
  },
  {
    terms: ["gxp"],
    content: `**GxP** is an umbrella for good practice quality guidelines (GLP, GCP, GMP) across regulated industries.`,
  },
  {
    terms: ["e-invoice", "einvoice", "e invoice"],
    content: `**E-invoicing** (GST) mandates IRN generation and QR codes based on turnover thresholds; ensures invoice standardization and real-time validation.`,
  },
  {
    terms: ["e-waybill", "ewaybill", "e waybill"],
    content: `**E-waybill** is required for movement of goods above threshold values—ensures trackability and tax compliance during transit.`,
  },
];

const glossaryMatch = (lowerMsg: string): string | null => {
  for (const entry of COMPLIANCE_GLOSSARY) {
    if (entry.terms.some(t => lowerMsg.includes(t))) {
      return entry.content;
    }
  }
  return null;
};

// Generate response from Stage 1 JSON locally (bypass backend)
const generateLocalResponse = (message: string, stage1Data: any): string => {
  const lowerMsg = message.toLowerCase();
  // First, try glossary terms
  const gloss = glossaryMatch(lowerMsg);
  if (gloss) return gloss;
  
  // Handle Stage 1 → Amendment a queries
  if (lowerMsg.includes("stage 1") && lowerMsg.includes("amendment a")) {
    const amendments = stage1Data?.a?.amendments || [];
    if (lowerMsg.includes("titles") || lowerMsg.includes("list")) {
      if (amendments.length === 0) return "No amendments found in Stage 1 → Amendment a.";
      const titles = amendments.map((a: any) => `• ${a.title || 'Untitled'}`).join('\n');
      return `**Amendment titles from Stage 1 → Amendment a:**\n\n${titles}`;
    }
    if (lowerMsg.includes("requirements")) {
      if (amendments.length === 0) return "No requirements found in Stage 1 → Amendment a.";
      let response = "**Requirements from Stage 1 → Amendment a:**\n\n";
      amendments.forEach((a: any, i: number) => {
        response += `**${a.title || `Amendment ${i+1}`}:**\n`;
        const reqs = a.requirements || [];
        if (reqs.length > 0) {
          response += reqs.map((r: string) => `• ${r}`).join('\n') + '\n\n';
        } else {
          response += "• No specific requirements listed\n\n";
        }
      });
      return response;
    }
  }
  
  // Handle Stage 1 → Amendment b queries
  if (lowerMsg.includes("stage 1") && lowerMsg.includes("amendment b")) {
    if (lowerMsg.includes("departments")) {
      const departments = stage1Data?.b?.departments || [];
      if (departments.length === 0) return "No departments found in Stage 1 → Amendment b.";
      return `**Impacted departments from Stage 1 → Amendment b:**\n\n${departments.map((d: string) => `• ${d}`).join('\n')}`;
    }
    if (lowerMsg.includes("impact")) {
      const impacts = stage1Data?.b?.impact || [];
      if (impacts.length === 0) return "No impact data found in Stage 1 → Amendment b.";
      let response = "**Impact analysis from Stage 1 → Amendment b:**\n\n";
      impacts.forEach((imp: any, i: number) => {
        response += `**${imp.amendment_title || `Impact ${i+1}`}** (${imp.urgency || 'Medium'} priority):\n`;
        const actions = imp.actions || [];
        if (actions.length > 0) {
          response += actions.map((a: string) => `• ${a}`).join('\n') + '\n\n';
        }
      });
      return response;
    }
  }
  
  // Handle Stage 1 → Amendment c queries
  if (lowerMsg.includes("stage 1") && lowerMsg.includes("amendment c")) {
    if (lowerMsg.includes("timeline")) {
      const timeline = stage1Data?.c?.timeline || [];
      if (timeline.length === 0) return "No timeline found in Stage 1 → Amendment c.";
      let response = "**Timeline from Stage 1 → Amendment c:**\n\n";
      timeline.forEach((slot: any, i: number) => {
        response += `**${slot.timeframe || `Phase ${i+1}`}:**\n`;
        const actions = slot.actions || [];
        actions.forEach((action: any) => {
          response += `• **${action.department || 'General'}**: ${action.task || 'Task'}\n`;
          if (action.steps && action.steps.length > 0) {
            response += `  Steps: ${action.steps.join(', ')}\n`;
          }
        });
        response += '\n';
      });
      return response;
    }
  }
  
  // Handle basic compliance terms (helpful context)
  if (lowerMsg.includes("gst")) {
    return `Hello! I'm CompliFi, your AI-powered compliance intelligence assistant.

Key Information:

- **Goods and Services Tax (GST)** is India's unified indirect tax that subsumes various central and state taxes.
- It applies to most goods and services, with compliance across registration, invoicing, returns, and reconciliation.

Core Responsibilities under GST:

1) **Registration & Classification**: Obtain/maintain valid GST registration; classify goods/services correctly with HSN/SAC.
2) **Tax Invoicing**: Issue GST-compliant invoices (supplier details, GSTINs, invoice number/date, HSN/SAC, taxable value, tax rate and amount, place of supply, etc.).
3) **Returns & Payments**: File periodic returns (e.g., GSTR-1, GSTR-3B) and make timely tax payments; reconcile with GSTR-2B/2A.
4) **Input Tax Credit (ITC)**: Claim ITC only when eligible (supplier compliance, goods/services receipt, tax paid to government, etc.).
5) **Record-Keeping & Audits**: Maintain books, e-invoices/e-waybills where applicable, and be prepared for assessments/audits.

Relevant Frameworks:

- CGST/SGST Acts & Rules, GST Council notifications, CBIC circulars.
- E-invoicing/e-waybill mandates depending on turnover and goods movement.

How CompliFi Helps:

- Maps your internal documents to GST requirements, highlights gaps, and generates department-wise actions and timelines.

Now, for your company-specific guidance, please ask using your Stage 1 analysis:

- "From Stage 1 → Amendment b, which departments are impacted?"
- "Show the ordered timeline from Stage 1 → Amendment c"`;
  }
  
  if (lowerMsg.includes("fssai")) {
    return `Hello! I'm CompliFi, your AI-powered compliance intelligence assistant, and I'm happy to help you understand the **FSSAI**.

Key Information:

- The **Food Safety and Standards Authority of India (FSSAI)** is the national regulator for food safety. It sets standards, issues licenses, monitors compliance, and conducts inspections to ensure public health.
- FSSAI compliance spans labeling, licensing/registration, hygiene practices, product standards, claims/advertising norms, and documentation.

FSSAI's Key Responsibilities:

1) **Setting food safety and quality standards**: Covers manufacturing, processing, distribution, storage, sale, and import of food.
2) **Licensing and registration of food businesses**: All FBOs must be registered/licensed per turnover and operations.
3) **Inspection and enforcement**: Surveillance, sampling, product recalls, and penalties for non-compliance.
4) **Consumer awareness & education**: Programs to promote safe food practices and transparency.

Relevant Frameworks:

- Food Safety and Standards Act, 2006; FSS (Packaging & Labelling), FSS (Licensing & Registration), FSS (Food Product Standards & Additives), and related regulations/notifications.

How CompliFi Helps:

- Converts regulatory updates into actionable Stage 1 items: amendments (a), impact and departments (b), and timelines (c).

For your company-specific guidance from the current analysis, please ask:

- "List the amendment titles from Stage 1 → Amendment a"
- "What are the requirements from Stage 1 → Amendment a?"`;
  }
  
  if (lowerMsg.includes("compliance")) {
    return `I can help with your specific compliance analysis from Stage 1. Try asking:

• "List the amendment titles from Stage 1 → Amendment a"
• "From Stage 1 → Amendment b, which departments are impacted?"
• "Show the ordered timeline from Stage 1 → Amendment c"
• "What are the requirements from Stage 1 → Amendment a?"`;
  }
  
  // Handle general Stage 1 queries
  if (lowerMsg.includes("stage 1")) {
    return `I can help you with Stage 1 compliance data. Try asking:

• "List the amendment titles from Stage 1 → Amendment a"
• "From Stage 1 → Amendment b, which departments are impacted?"
• "Show the ordered timeline from Stage 1 → Amendment c"
• "What are the requirements from Stage 1 → Amendment a?"

I only have access to your specific Stage 1 JSON data from the compliance analysis.`;
  }
  
  // Out of scope
  return `I focus on your Stage 1 compliance analysis. For general compliance questions, I can provide basic context, but for specific guidance please ask about:

• Stage 1 → Amendment a (titles, requirements)
• Stage 1 → Amendment b (departments, impact)  
• Stage 1 → Amendment c (timeline, actions)

Try: "List the amendment titles from Stage 1 → Amendment a"`;
};

export default function ChatbotPage() {
  type Msg = { id: number; text: string; sender: "user" | "bot"; timestamp: string };
  const [messages, setMessages] = useState<Msg[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const router = useRouter();
  const [docHash, setDocHash] = useState<string | null>(null);
  const handleBack = () => {
    try {
      const isBlocked = (p: string | null) => {
        if (!p) return true;
        if (p.startsWith('/chatbot')) return true;
        const pattern = /(scan|scanning|check|checking|analyz|processing|progress)/i;
        return pattern.test(p);
      };

      // 1) Try history stack (most robust)
      const raw = sessionStorage.getItem('complifi-path-history');
      if (raw) {
        const arr: string[] = JSON.parse(raw);
        for (let i = arr.length - 1; i >= 0; i--) {
          const p = arr[i];
          if (!isBlocked(p) && p !== window.location.pathname) {
            router.push(p);
            return;
          }
        }
      }

      // 2) Fallback to last-path
      const last = sessionStorage.getItem('complifi-last-path');
      if (!isBlocked(last) && last && last !== window.location.pathname) {
        router.push(last);
        return;
      }

      // 3) Same-origin referrer
      const ref = document.referrer;
      if (ref) {
        const url = new URL(ref);
        if (url.origin === window.location.origin && !isBlocked(url.pathname)) {
          window.location.href = ref;
          return;
        }
      }

      // 4) Final fallback
      router.push('/dashboard');
    } catch {
      router.push('/dashboard');
    }
  };

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Load chat history from localStorage (shared with dashboard icon)
  useEffect(() => {
    try {
      const savedHash = localStorage.getItem("complifi-doc-hash");
      if (savedHash) setDocHash(savedHash);
      const raw = localStorage.getItem("complifi-chat-history");
      if (raw) {
        const parsed = JSON.parse(raw);
        const mapped = (Array.isArray(parsed) ? parsed : [])
          .map((m: any) => {
            if (m && typeof m === "object") {
              if ("text" in m && "sender" in m) return m as Msg;
              return {
                id: m.id ?? Date.now(),
                text: m.message ?? "",
                sender: m.isUser ? "user" : "bot",
                timestamp: m.timestamp
                  ? new Date(m.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                  : new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              } as Msg;
            }
            return null;
          })
          .filter(Boolean) as Msg[];
        if (mapped.length) setMessages(mapped);
      }
    } catch {}
  }, []);

  // Persist chat history in icon-compatible format
  useEffect(() => {
    try {
      const iconCompatible = messages.map((m) => ({
        id: m.id,
        message: m.text,
        isUser: m.sender === "user",
        timestamp: Date.now(),
      }));
      localStorage.setItem("complifi-chat-history", JSON.stringify(iconCompatible));
    } catch {}
  }, [messages]);

  // Send message to the backend
  const sendMessage = async () => {
    if (!inputMessage.trim()) return;

    const userMessage: Msg = {
      id: Date.now(),
      text: inputMessage,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage("");
    setIsLoading(true);

    try {
      // Always re-read the latest hash in case it was set after mount
      let activeHash = docHash;
      try { activeHash = localStorage.getItem("complifi-doc-hash") || docHash; } catch {}
      
      // Check if we have local Stage 1 JSON (bypass backend)
      let stage1Data = null;
      if (activeHash) {
        try {
          const stored = localStorage.getItem(`complifi-stage1-${activeHash}`);
          if (stored) stage1Data = JSON.parse(stored);
        } catch {}
      }
      
      let botReply = "";
      
      if (!activeHash || !stage1Data) {
        botReply = "❌ No Stage 1 context loaded. Please run 'Test Compliance' on the dashboard first, then try again.";
      } else {
        // Generate response from Stage 1 JSON locally
        botReply = generateLocalResponse(userMessage.text, stage1Data);
      }

      const botMessage: Msg = {
        id: Date.now() + 1,
        text: botReply,
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      const errorMessage: Msg = {
        id: Date.now() + 1,
        text: "Sorry, I could not connect to the server. Please make sure the API is running on http://localhost:8000",
        sender: "bot",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden" style={{ backgroundColor: '#0a0a0a' }}>
      {/* Glittery Neon Crystals */}
      <div className="crystal-container">
        {/* Left side crystals */}
        <div className="crystal crystal-diamond crystal-1" />
        <div className="crystal crystal-triangle crystal-2" />
        <div className="crystal crystal-hexagon crystal-3" />
        <div className="crystal crystal-star crystal-4" />
        <div className="crystal crystal-octagon crystal-5" />
        <div className="crystal crystal-diamond crystal-6" />
        <div className="crystal crystal-triangle crystal-7" />
        <div className="crystal crystal-hexagon crystal-8" />
        <div className="crystal crystal-star crystal-9" />
        <div className="crystal crystal-octagon crystal-10" />
        {/* Right side crystals */}
        <div className="crystal crystal-triangle crystal-11" />
        <div className="crystal crystal-diamond crystal-12" />
        <div className="crystal crystal-star crystal-13" />
        <div className="crystal crystal-hexagon crystal-14" />
        <div className="crystal crystal-octagon crystal-15" />
        <div className="crystal crystal-diamond crystal-16" />
        <div className="crystal crystal-triangle crystal-17" />
        <div className="crystal crystal-star crystal-18" />
        <div className="crystal crystal-hexagon crystal-19" />
        <div className="crystal crystal-octagon crystal-20" />
        {/* Center area crystals */}
        <div className="crystal crystal-star crystal-21" />
        <div className="crystal crystal-diamond crystal-22" />
        <div className="crystal crystal-hexagon crystal-23" />
        <div className="crystal crystal-triangle crystal-24" />
      </div>

      {/* Left side floating icons */}
      <div className="floating-icons-left">
        <div className="floating-icon icon-1">📊</div>
        <div className="floating-icon icon-2">⚖️</div>
        <div className="floating-icon icon-3">🏢</div>
        <div className="floating-icon icon-4">📋</div>
        <div className="floating-icon icon-5">🔒</div>
      </div>

      {/* Right side floating icons */}
      <div className="floating-icons-right">
        <div className="floating-icon icon-6">📈</div>
        <div className="floating-icon icon-7">🎯</div>
        <div className="floating-icon icon-8">💼</div>
        <div className="floating-icon icon-9">📑</div>
        <div className="floating-icon icon-10">✅</div>
      </div>

      {/* Chat container (narrow) exact screen height without extra space below */}
      <div className="w-full max-w-3xl mx-auto mt-4 mb-0 bg-black/90 border border-emerald-500/20 rounded-2xl shadow-[0_0_50px_rgba(16,185,129,0.15)] backdrop-blur-xl overflow-hidden relative z-10 h-[calc(100vh-1rem)] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-emerald-500/20 bg-black/80">
          <div className="flex items-center gap-3">
            <button
              onClick={handleBack}
              className="group inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-emerald-500/30 text-emerald-300 hover:text-white hover:border-emerald-400 hover:bg-emerald-500/10 transition-all duration-200"
              aria-label="Go back"
              title="Back"
            >
              <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
              <span className="text-sm">Back</span>
            </button>
            <h2 className="text-emerald-400 font-semibold text-lg">CompliFi AI Assistant</h2>
          </div>
          <div className="flex items-center gap-2 text-emerald-400 text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Online</span>
          </div>
        </div>

        {/* Messages - take remaining space */}
        <div className="flex-1 overflow-y-auto px-5 pt-5 pb-3 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06)_0%,transparent_70%)]">
          {messages.length === 0 && (
            <div className="text-center text-emerald-400 my-12 leading-relaxed">
              <p>🚀 Welcome to CompliFi Intelligence</p>
              <p>I'm your AI compliance assistant, ready to help with:</p>
              <p>• Document analysis & regulatory guidance</p>
              <p>• Amendment interpretations & next steps</p>
              <p>• Compliance workflow suggestions</p>
              <p>Ask me anything about your compliance journey!</p>
            </div>
          )}

          {messages.map((m) => (
            <div key={m.id} className={`mb-4 flex ${m.sender === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl border backdrop-blur-md ${
                m.sender === "user"
                  ? "bg-emerald-500/15 border-emerald-500/30 shadow-[0_4px_20px_rgba(16,185,129,0.2)]"
                  : "bg-white/5 border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
              }`}>
                <div
                  className="text-white text-[15px] leading-relaxed message-content"
                  dangerouslySetInnerHTML={{ __html: formatMessageText(m.text) }}
                />
                <div className="text-[11px] text-emerald-300 mt-1 text-right">{m.timestamp}</div>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="mb-4 flex justify-start">
              <div className="max-w-[75%] px-4 py-3 rounded-2xl border bg-white/5 border-white/10">
                <span className="text-white/80">🤖 Analyzing compliance data...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        {/* Input row - increase height only */}
        <div className="p-4 bg-black/80 border-t border-emerald-500/20 flex gap-3 items-end">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-5 py-5 rounded-xl bg-black/70 text-white border border-emerald-500/30 outline-none focus:ring-2 focus:ring-emerald-500/40 transition-all"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={isLoading || !inputMessage.trim()}
            className={`w-12 h-12 rounded-full border flex items-center justify-center text-emerald-400 transition-all duration-200 ${
              isLoading || !inputMessage.trim()
                ? "opacity-50 border-gray-700 text-gray-400"
                : "border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:scale-105 hover:shadow-[0_0_22px_rgba(16,185,129,0.45)]"
            }`}
            aria-label="Send"
            title="Send"
          >
            {isLoading ? "..." : "➤"}
          </button>
        </div>
      </div>
      
    </div>
  );
}
