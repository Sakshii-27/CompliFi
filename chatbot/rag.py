from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_community.vectorstores import FAISS
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain.docstore.document import Document
import os
from dotenv import load_dotenv

load_dotenv()

# Gemini API key
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# Compliance-focused training documents
docs = [
    # Regulatory Compliance Basics
    Document(page_content="Regulatory compliance refers to the process of ensuring that organizations adhere to laws, regulations, guidelines, and specifications relevant to their business operations. This includes financial regulations, data protection laws, industry-specific standards, and corporate governance requirements."),
    
    # Risk Management
    Document(page_content="Risk management in compliance involves identifying, assessing, and mitigating potential risks that could lead to regulatory violations. This includes operational risks, financial risks, reputational risks, and legal risks. Organizations must implement robust risk assessment frameworks and monitoring systems."),
    
    # Data Protection and Privacy
    Document(page_content="Data protection compliance requires organizations to implement appropriate technical and organizational measures to protect personal data. This includes GDPR compliance, data minimization principles, consent management, data breach notification procedures, and privacy impact assessments."),
    
    # Financial Regulations
    Document(page_content="Financial compliance encompasses adherence to banking regulations, anti-money laundering (AML) requirements, know your customer (KYC) procedures, and financial reporting standards. Organizations must maintain accurate records, conduct due diligence, and report suspicious activities."),
    
    # Corporate Governance
    Document(page_content="Corporate governance compliance involves establishing proper board oversight, internal controls, audit procedures, and transparency in business operations. This includes compliance with securities regulations, disclosure requirements, and ethical business practices."),
    
    # Industry-Specific Regulations
    Document(page_content="Different industries have specific compliance requirements. Healthcare organizations must comply with HIPAA, financial institutions with Basel III, manufacturing companies with environmental regulations, and technology companies with cybersecurity frameworks."),
    
    # Compliance Monitoring and Reporting
    Document(page_content="Effective compliance programs require continuous monitoring, regular audits, and comprehensive reporting mechanisms. Organizations should implement compliance dashboards, automated monitoring systems, and regular compliance assessments to ensure ongoing adherence to regulations."),
    
    # Amendment and Regulatory Updates
    Document(page_content="Regulatory landscapes constantly evolve with new amendments, updates, and interpretations. Organizations must stay informed about regulatory changes, assess their impact, and implement necessary updates to policies and procedures to maintain compliance."),
    
    # Compliance Training and Awareness
    Document(page_content="Employee training and awareness programs are crucial for compliance success. Organizations should provide regular compliance training, update employees on regulatory changes, and create a culture of compliance throughout the organization."),
    
    # Audit and Documentation
    Document(page_content="Proper documentation and audit trails are essential for demonstrating compliance. Organizations must maintain comprehensive records, document compliance procedures, and be prepared for regulatory inspections and audits."),
    
    # Penalties and Enforcement
    Document(page_content="Non-compliance can result in significant penalties, including fines, sanctions, license revocation, and reputational damage. Organizations must understand the consequences of non-compliance and implement robust compliance programs to avoid violations."),
    
    # Technology and Compliance
    Document(page_content="Technology plays a crucial role in modern compliance management. Compliance technology solutions include automated monitoring systems, regulatory reporting tools, risk assessment platforms, and compliance dashboards that help organizations maintain regulatory adherence efficiently."),
    
    # International Compliance
    Document(page_content="Global organizations must navigate complex international compliance requirements, including cross-border data transfers, international sanctions, export controls, and varying regulatory frameworks across different jurisdictions."),
    
    # Compliance Best Practices
    Document(page_content="Best practices for compliance include establishing clear policies and procedures, regular risk assessments, employee training programs, continuous monitoring, incident response procedures, and maintaining open communication with regulatory authorities."),
    
    # ESG and Sustainability Compliance
    Document(page_content="Environmental, Social, and Governance (ESG) compliance is becoming increasingly important. Organizations must address climate-related disclosures, sustainability reporting, social responsibility initiatives, and governance transparency requirements.")
]

# Split into chunks
splitter = RecursiveCharacterTextSplitter(chunk_size=200, chunk_overlap=20)
documents = splitter.split_documents(docs)

# ✅ Use Google Generative AI Embeddings
embeddings = GoogleGenerativeAIEmbeddings(
    model="models/embedding-001",
    google_api_key=GOOGLE_API_KEY
)

# ✅ Create FAISS vectorstore
vectorstore = FAISS.from_documents(documents, embeddings)
