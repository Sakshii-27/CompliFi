"use client";

import React, { useState } from "react";
import {
  Upload,
  FileText,
  CheckCircle,
  Clock,
  Building,
  MapPin,
  Phone,
  Mail,
  ChevronRight,
  X,
} from "lucide-react";

// Types
interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  businessType: string;
  businessDescription: string;
  fssaiNumber?: string;
  gstNumber?: string;
  rbiNumber?: string;
  sebiNumber?: string;
  cin?: string;
}

interface RegulationCard {
  id: string;
  title: string;
  summary: string;
  impact: "High" | "Medium" | "Low";
  sector: string[];
  date: string;
  views: number;
  status: "New" | "Updated" | "Compliance Required";
  tags: string[];
}

// Top-level step components (stable identity to avoid remounting inputs)
interface CategorySelectionProps {
  categories: { id: string; name: string; icon: string; color: string }[];
  selectedCategory: string;
  setSelectedCategory: (c: string) => void;
  setCurrentStep: (s: string) => void;
}

const CategorySelection = ({
  categories,
  selectedCategory,
  setSelectedCategory,
  setCurrentStep,
}: CategorySelectionProps) => (
  <div className="min-h-screen bg-gray-900 py-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-4">
          Select Your Industry Category
        </h1>
        <p className="text-gray-400 text-lg">
          Choose the category that best describes your business to get started
          with compliance
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div
            key={category.id}
            onClick={() => {
              setSelectedCategory(category.id);
              setCurrentStep("company");
            }}
            className={`bg-gray-800/30 border-2 rounded-lg p-6 cursor-pointer transition-all duration-300 transform hover:scale-105 backdrop-blur-sm ${
              selectedCategory === category.id
                ? "border-emerald-500 bg-emerald-500/10"
                : "border-gray-700/50 hover:border-emerald-500/50"
            }`}
          >
            <div
              className={`w-16 h-16 bg-gradient-to-br ${category.color} rounded-lg flex items-center justify-center text-2xl mb-4 mx-auto`}
            >
              {category.icon}
            </div>
            <h3 className="text-xl font-semibold text-white text-center mb-2">
              {category.name}
            </h3>
            <div className="flex justify-center">
              <ChevronRight className="w-5 h-5 text-emerald-400" />
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-center mt-8">
        <button
          onClick={() => (window.location.href = "/")}
          className="text-gray-400 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  </div>
);

interface CompanyDetailsProps {
  companyInfo: CompanyInfo;
  setCompanyInfo: (updater: any) => void;
  selectedCategory: string;
  setCurrentStep: (s: string) => void;
}

const documentsByCategory: Record<
  string,
  { id: string; label?: string; required: boolean; description?: string }[]
> = {
  food: [
    {
      id: "fssai",
      label: "FSSAI License Copy",
      required: true,
      description: "Valid FSSAI license with current validity",
    },
    {
      id: "gst",
      label: "GST Certificate",
      required: true,
      description: "GST registration certificate or incorporation certificate",
    },
    {
      id: "audit",
      label: "Food Safety Audit Report",
      required: false,
      description: "Latest food safety audit report (if available)",
    },
    {
      id: "lab",
      label: "Lab Test Report",
      required: true,
      description: "Latest product batch test report",
    },
    {
      id: "label",
      label: "Product Label Design",
      required: true,
      description: "Front and back label design (PDF/PNG)",
    },
    {
      id: "ingredients",
      label: "Ingredient List",
      required: true,
      description: "Complete ingredient list with percentages",
    },
    {
      id: "nutrition",
      label: "Nutritional Information",
      required: true,
      description: "Nutritional facts table",
    },
  ],
  finance: [
    {
      id: "rbiCertificate",
      label: "RBI Approval Certificate",
      required: true,
      description: "Approval certificate issued by RBI for financial services",
    },
    {
      id: "cinCertificate",
      label: "CIN Certificate",
      required: true,
      description: "Corporate Identification Number certificate",
    },
    {
      id: "auditReport",
      label: "Latest Audit Report",
      required: true,
      description: "Most recent audited financial statement",
    },
    {
      id: "panCard",
      label: "Company PAN Card",
      required: true,
      description: "Permanent Account Number of the company",
    },
    {
      id: "taxReturns",
      label: "Income Tax Returns",
      required: true,
      description: "Last 2 years of income tax returns",
    },
    {
      id: "kycPolicy",
      label: "KYC/AML Policy",
      required: false,
      description: "Company’s documented policy on customer verification and anti-money laundering measures",
    },
    {
      id: "auditReport",
      label: "IT/System Audit Report",
      required: false,
      description: "Most recent report on IT systems and security compliance",
    },
  ],

  technology: [
    {
      id: "startupIndia",
      label: "Startup India Certificate",
      required: true,
      description: "Recognition under Startup India initiative",
    },
    {
      id: "msme",
      label: "MSME Registration Certificate",
      required: true,
      description: "Udyam/MSME registration certificate",
    },
    {
      id: "ipCertificate",
      label: "IP/Patent Certificates",
      required: false,
      description: "Patent or intellectual property documents",
    },
    {
      id: "softwareCompliance",
      label: "Software Compliance Certificate",
      required: true,
      description: "Compliance certificate for software/product",
    },
    {
      id: "dataPolicy",
      label: "Data Security Policy",
      required: true,
      description: "Company’s data protection and security policy",
    },
  ],

  healthcare: [
    {
      id: "drugLicense",
      label: "Drug License",
      required: true,
      description: "Drug license issued by respective authority",
    },
    {
      id: "isoCertificate",
      label: "ISO 13485 Certification",
      required: true,
      description:
        "ISO certification for medical devices and healthcare quality",
    },
    {
      id: "clinicalTrial",
      label: "Clinical Trial Reports",
      required: false,
      description: "Clinical trials and safety reports for healthcare products",
    },
    {
      id: "doctorRegistration",
      label: "Doctor/Practitioner Registration",
      required: true,
      description: "Registration certificate for medical practitioners",
    },
    {
      id: "hospitalNOC",
      label: "Hospital NOC",
      required: false,
      description:
        "No Objection Certificate from healthcare facility (if applicable)",
    },
  ],

  export: [
    {
      id: "iecCertificate",
      label: "Import Export Code (IEC)",
      required: true,
      description: "Mandatory import-export code issued by DGFT",
    },
    {
      id: "exportLicense",
      label: "Export License",
      required: true,
      description: "Export license for restricted goods",
    },
    {
      id: "shippingBill",
      label: "Shipping Bill",
      required: true,
      description: "Latest shipping bill for export consignments",
    },
    {
      id: "coo",
      label: "Certificate of Origin",
      required: true,
      description: "Certificate verifying product origin",
    },
    {
      id: "billOfLading",
      label: "Bill of Lading",
      required: true,
      description: "Mandatory document for sea/air shipments",
    },
    {
      id: "exportInsurance",
      label: "Export Insurance Policy",
      required: false,
      description: "Insurance policy covering international trade",
    },
  ],

  manufacturing: [
    {
      id: "factoryLicense",
      label: "Factory License",
      required: true,
      description: "License under Factories Act",
    },
    {
      id: "gstManufacturing",
      label: "GST Certificate",
      required: true,
      description: "GST registration for manufacturing operations",
    },
    {
      id: "pollutionCertificate",
      label: "Pollution Control Certificate",
      required: true,
      description: "NOC/clearance from Pollution Control Board",
    },
    {
      id: "fireSafety",
      label: "Fire Safety Certificate",
      required: true,
      description: "Fire safety NOC for manufacturing facility",
    },
    {
      id: "iso9001",
      label: "ISO 9001 Certification",
      required: true,
      description: "Quality management certification for manufacturing",
    },
    {
      id: "machineryInvoice",
      label: "Machinery Purchase Invoices",
      required: false,
      description: "Invoices of manufacturing equipment",
    },
  ],
};

const CompanyDetails = ({
  companyInfo,
  setCompanyInfo,
  selectedCategory,
  setCurrentStep,
}: CompanyDetailsProps) => (
  <div className="min-h-screen bg-gray-900 py-12">
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-8 backdrop-blur-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          Company Information
        </h1>
        <p className="text-gray-400 mb-8">
          Please provide your company details for compliance verification
        </p>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <Building className="w-4 h-4 inline mr-2" />
              Company Name *
            </label>
            <input
              type="text"
              value={companyInfo.name}
              onChange={(e) =>
                setCompanyInfo((prev: CompanyInfo) => ({
                  ...prev,
                  name: e.target.value,
                }))
              }
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              placeholder="Enter your company name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              <MapPin className="w-4 h-4 inline mr-2" />
              Company Address *
            </label>
            <textarea
              value={companyInfo.address}
              onChange={(e) =>
                setCompanyInfo((prev: CompanyInfo) => ({
                  ...prev,
                  address: e.target.value,
                }))
              }
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
              rows={3}
              placeholder="Enter your complete address"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Phone className="w-4 h-4 inline mr-2" />
                Phone Number *
              </label>
              <input
                type="tel"
                value={companyInfo.phone}
                onChange={(e) =>
                  setCompanyInfo((prev: CompanyInfo) => ({
                    ...prev,
                    phone: e.target.value,
                  }))
                }
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="+91 XXXXX XXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                <Mail className="w-4 h-4 inline mr-2" />
                Email Address *
              </label>
              <input
                type="email"
                value={companyInfo.email}
                onChange={(e) =>
                  setCompanyInfo((prev: CompanyInfo) => ({
                    ...prev,
                    email: e.target.value,
                  }))
                }
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="company@example.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Business Type *
            </label>
            <select
              value={companyInfo.businessType}
              onChange={(e) =>
                setCompanyInfo((prev: CompanyInfo) => ({
                  ...prev,
                  businessType: e.target.value,
                }))
              }
              className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
            >
              <option value="">Select business type</option>
              <option value="manufacturer">Manufacturer</option>
              <option value="distributor">Distributor</option>
              <option value="importer">Importer</option>
              <option value="retailer">Retailer</option>
            </select>
          </div>

          {companyInfo.businessType && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Business Description *
              </label>
              <textarea
                value={companyInfo.businessDescription}
                onChange={(e) =>
                  setCompanyInfo((prev: CompanyInfo) => ({
                    ...prev,
                    businessDescription: e.target.value,
                  }))
                }
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                rows={6}
                maxLength={200}
                placeholder={getBusinessDescriptionPlaceholder(
                  companyInfo.businessType
                )}
              />
              <div className="flex justify-between mt-2">
                <p className="text-xs text-gray-500">
                  {getBusinessDescriptionHint(companyInfo.businessType)}
                </p>
                <span className="text-xs text-gray-500">
                  {companyInfo.businessDescription.length}/200
                </span>
              </div>
            </div>
          )}

          {selectedCategory === "food" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  FSSAI License Number *
                </label>
                <input
                  type="text"
                  value={companyInfo.fssaiNumber}
                  onChange={(e) =>
                    setCompanyInfo((prev: CompanyInfo) => ({
                      ...prev,
                      fssaiNumber: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="FSSAI License Number"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  GST Number *
                </label>
                <input
                  type="text"
                  value={companyInfo.gstNumber}
                  onChange={(e) =>
                    setCompanyInfo((prev: CompanyInfo) => ({
                      ...prev,
                      gstNumber: e.target.value,
                    }))
                  }
                  className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="GST Number"
                />
              </div>
            </div>
          )}
        </div>

        {selectedCategory === "finance" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                RBI License / Registration Number *
              </label>
              <input
                type="text"
                value={companyInfo.rbiNumber}
                onChange={(e) =>
                  setCompanyInfo((prev: CompanyInfo) => ({
                    ...prev,
                    rbiNumber: e.target.value,
                  }))
                }
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="Enter RBI License / Registration Number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                SEBI Registration Number (if applicable)
              </label>
              <input
                type="text"
                value={companyInfo.sebiNumber}
                onChange={(e) =>
                  setCompanyInfo((prev: CompanyInfo) => ({
                    ...prev,
                    sebiNumber: e.target.value,
                  }))
                }
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="Enter SEBI Registration Number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Corporate Identification Number (CIN) *
              </label>
              <input
                type="text"
                value={companyInfo.cin}
                onChange={(e) =>
                  setCompanyInfo((prev: CompanyInfo) => ({
                    ...prev,
                    cin: e.target.value,
                  }))
                }
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="Enter CIN"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                GST Number *
              </label>
              <input
                type="text"
                value={companyInfo.gstNumber}
                onChange={(e) =>
                  setCompanyInfo((prev: CompanyInfo) => ({
                    ...prev,
                    gstNumber: e.target.value,
                  }))
                }
                className="w-full bg-gray-700/50 border border-gray-600 rounded-lg px-4 py-3 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                placeholder="GST Number"
              />
            </div>
          </div>
        )}

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep("category")}
            className="text-gray-400 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => setCurrentStep("documents")}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            Next: Upload Documents →
          </button>
        </div>
      </div>
    </div>
  </div>
);

interface DocumentsUploadProps {
  uploadedFiles: { [k: string]: File[] };
  handleFileUpload: (id: string, files: FileList) => void;
  removeFile: (id: string, idx: number) => void;
  setCurrentStep: (s: string) => void;
  selectedCategory: string;
  documents: {
    id: string;
    label?: string;
    name?: string;
    required?: boolean;
    description?: string;
  }[];
}

const DocumentsUpload = ({
  uploadedFiles,
  handleFileUpload,
  removeFile,
  setCurrentStep,
  selectedCategory,
}: DocumentsUploadProps) => (
  <div className="min-h-screen bg-gray-900 py-12">
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-8 backdrop-blur-sm">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
          Upload Required Documents
        </h1>
        <p className="text-gray-400 mb-8">
          Please upload all required documents for compliance verification
        </p>

        <div className="space-y-6">
          {(documentsByCategory[selectedCategory] || []).map((doc) => (
            <div
              key={doc.id}
              className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center mb-2">
                    <h3 className="text-lg font-semibold text-white">
                      {doc.label}
                    </h3>
                    {doc.required && (
                      <span className="ml-2 text-red-400 text-sm">
                        *Required
                      </span>
                    )}
                  </div>

                  {doc.description && (
                    <p className="text-gray-400 text-sm">{doc.description}</p>
                  )}
                </div>
                <FileText className="w-6 h-6 text-emerald-400 ml-4" />
              </div>

              <div className="border-2 border-dashed border-gray-600 rounded-lg p-6 text-center hover:border-emerald-500/50 transition-colors">
                <input
                  type="file"
                  id={`file-${doc.id}`}
                  multiple
                  onChange={(e) =>
                    e.target.files && handleFileUpload(doc.id, e.target.files)
                  }
                  className="hidden"
                  accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                />
                <label htmlFor={`file-${doc.id}`} className="cursor-pointer">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">
                    Click to upload or drag and drop
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, PNG, JPG, DOC, DOCX (Max 10MB each)
                  </p>
                </label>
              </div>

              {uploadedFiles[doc.id] && uploadedFiles[doc.id].length > 0 && (
                <div className="mt-4 space-y-2">
                  <h4 className="text-sm font-medium text-gray-300">
                    Uploaded Files:
                  </h4>
                  {uploadedFiles[doc.id].map((file, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-gray-600/30 rounded-lg p-3"
                    >
                      <div className="flex items-center">
                        <FileText className="w-4 h-4 text-emerald-400 mr-2" />
                        <span className="text-sm text-white">{file.name}</span>
                        <span className="text-xs text-gray-400 ml-2">
                          ({(file.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <button
                        onClick={() => removeFile(doc.id, index)}
                        className="text-red-400 hover:text-red-300 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep("company")}
            className="text-gray-400 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={() => setCurrentStep("submit")}
            className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
          >
            Review & Submit →
          </button>
        </div>
      </div>
    </div>
  </div>
);

interface SubmitComponentProps {
  companyInfo: CompanyInfo;
  uploadedFiles: { [k: string]: File[] };
  API_BASE: string;
  selectedCategory: string;
  setCurrentStep: (s: string) => void;
  setCompanyInfo: (c: CompanyInfo) => void;
  setUploadedFiles: (u: { [k: string]: File[] }) => void;
  setSelectedCategory: (s: string) => void;
  // foodDocuments: { id: string; name: string; required: boolean; description: string }[];
  documents: {
    id: string;
    label?: string;
    name?: string;
    required?: boolean;
    description?: string;
  }[];
}

const SubmitComponent = ({
  companyInfo,
  uploadedFiles,
  API_BASE,
  selectedCategory,
  setCurrentStep,
  setCompanyInfo,
  setUploadedFiles,
  setSelectedCategory,
}: // foodDocuments,
SubmitComponentProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);

  const fileOrNull = (arr?: File[]) => (arr && arr.length > 0 ? arr[0] : null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("company_name", companyInfo.name);
      fd.append("address", companyInfo.address || "");
      fd.append("fssai_license", companyInfo.fssaiNumber || "");
      fd.append("business_type", companyInfo.businessType || "");
      fd.append("gst_number", companyInfo.gstNumber || "");
      fd.append("product_name", "Default Product");
      fd.append("product_category", selectedCategory || "general");
      fd.append("ingredients", JSON.stringify({}));
      fd.append("nutrition", JSON.stringify({}));
      fd.append("allergens", "");
      const labelFiles = uploadedFiles["label"] || [];
      const labelFront = labelFiles[0];
      const labelBack = labelFiles[1];
      if (labelFront) fd.append("label_front", labelFront);
      if (labelBack) fd.append("label_back", labelBack);
      fd.append("expiry_format", "DD/MM/YYYY");
      fd.append("claims", "");
      const fssai = fileOrNull(uploadedFiles["fssai"]);
      const gst = fileOrNull(uploadedFiles["gst"]);
      const audit = fileOrNull(uploadedFiles["audit"]);
      const lab = fileOrNull(uploadedFiles["lab"]);
      if (fssai) fd.append("fssai_file", fssai);
      if (gst) fd.append("gst_file", gst);
      if (audit) fd.append("audit_file", audit);
      if (lab) fd.append("lab_report_file", lab);

            // Additional product documents (PDFs)
            const ingredientsDoc = fileOrNull(uploadedFiles["ingredients"]);
            const nutritionDoc = fileOrNull(uploadedFiles["nutrition"]);
            if (ingredientsDoc) fd.append("ingredients_file", ingredientsDoc);
            if (nutritionDoc) fd.append("nutrition_file", nutritionDoc);

      const submitRes = await fetch(`${API_BASE}/company/submit`, {
        method: "POST",
        body: fd,
      });
      if (!submitRes.ok) throw new Error(`Submit failed: ${submitRes.status}`);
      const submitJson = await submitRes.json();
      const cid = submitJson.company_id as string;
      setCompanyId(cid);
      try {
        localStorage.setItem("company_id", cid);
      } catch {}

      try {
        await fetch(`${API_BASE}/update`);
      } catch (e) {
        /* noop */
      }

      setSubmitted(true);
    } catch (e: any) {
      setError(e?.message || "Submission failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-900 py-12">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-8 backdrop-blur-sm text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white mb-4">
              Submission Successful!
            </h1>
            <p className="text-gray-400 mb-8">
              Your data has been submitted and the compliance analysis has been
              generated below.
            </p>
            <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-6 mb-8">
              <h3 className="text-lg font-semibold text-white mb-4">
                Submission Summary
              </h3>
              <div className="text-left space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-400">Company ID:</span>
                  <span className="text-white font-mono">{companyId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Category:</span>
                  <span className="text-white capitalize">
                    {selectedCategory}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Company:</span>
                  <span className="text-white">{companyInfo.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Documents:</span>
                  <span className="text-white">
                    {Object.values(uploadedFiles).flat().length} files
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="text-emerald-400">Under Review</span>
                </div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <button
                onClick={() => {
                  setCurrentStep("category");
                  setSubmitted(false);
                  setCompanyInfo({
                    name: "",
                    address: "",
                    phone: "",
                    email: "",
                    businessType: "",
                    businessDescription: "",
                    fssaiNumber: "",
                    gstNumber: "",
                  });
                  setUploadedFiles({});
                  setSelectedCategory("");
                }}
                className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105"
              >
                Start New Application
              </button>
              <button
                onClick={() => {
                  if (selectedCategory === "finance") {
                    window.location.href = "/rbidashboard";
                  } else {
                    window.location.href = "/dashboard";
                  }
                }}
                className="bg-gray-700 hover:bg-gray-600 text-white px-8 py-3 rounded-lg font-medium transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-gray-800/30 border border-gray-700/50 rounded-lg p-8 backdrop-blur-sm">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent mb-2">
            Review & Submit
          </h1>
          <p className="text-gray-400 mb-8">
            Please review all information before submitting your compliance
            application
          </p>

          {/* Company Information Review */}
          <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <Building className="w-5 h-5 mr-2 text-emerald-400" />
              Company Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-400">Company Name:</span>
                <p className="text-white">{companyInfo.name}</p>
              </div>
              <div>
                <span className="text-gray-400">Business Type:</span>
                <p className="text-white capitalize">
                  {companyInfo.businessType}
                </p>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-400">Business Description:</span>
                <p className="text-white text-sm">
                  {companyInfo.businessDescription}
                </p>
              </div>
              <div>
                <span className="text-gray-400">Phone:</span>
                <p className="text-white">{companyInfo.phone}</p>
              </div>
              <div>
                <span className="text-gray-400">Email:</span>
                <p className="text-white">{companyInfo.email}</p>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-400">Address:</span>
                <p className="text-white">{companyInfo.address}</p>
              </div>
              {selectedCategory === "food" && (
                <>
                  <div>
                    <span className="text-gray-400">FSSAI License:</span>
                    <p className="text-white">{companyInfo.fssaiNumber}</p>
                  </div>
                  <div>
                    <span className="text-gray-400">GST Number:</span>
                    <p className="text-white">{companyInfo.gstNumber}</p>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Documents Review */}
          <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-emerald-400" />
              Documents Uploaded
            </h3>
            <div className="space-y-3">
              {documentsByCategory[selectedCategory].map((doc) => (
                <div
                  key={doc.id}
                  className="flex items-center justify-between py-2"
                >
                  <div className="flex items-center">
                    <span className="text-gray-300">{doc.label}</span>
                    {doc.required && (
                      <span className="ml-2 text-red-400 text-xs">
                        *Required
                      </span>
                    )}
                  </div>
                  <div className="flex items-center">
                    {uploadedFiles[doc.id] &&
                    uploadedFiles[doc.id].length > 0 ? (
                      <div className="flex items-center text-emerald-400">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        <span className="text-sm">
                          {uploadedFiles[doc.id].length} file(s)
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center text-gray-500">
                        <Clock className="w-4 h-4 mr-1" />
                        <span className="text-sm">Not uploaded</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Terms and Conditions */}
          <div className="bg-gray-700/30 border border-gray-600/50 rounded-lg p-6 mb-6">
            <label className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-emerald-500 bg-gray-700 border-gray-600 rounded focus:ring-emerald-500 focus:ring-2 mt-1"
              />
              <div className="ml-3">
                <span className="text-white text-sm">
                  I agree to the terms and conditions and confirm that all
                  information provided is accurate and complete.
                </span>
                <p className="text-gray-400 text-xs mt-1">
                  By submitting this application, you consent to the processing
                  of your data for compliance verification purposes.
                </p>
              </div>
            </label>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setCurrentStep("documents")}
              className="text-gray-400 hover:text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              ← Back
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Submitting...
                </>
              ) : (
                "Submit Application"
              )}
            </button>
          </div>
          {error && <div className="mt-4 text-red-400 text-sm">{error}</div>}
        </div>
      </div>
    </div>
  );
};

// Helper functions used by components
const getBusinessDescriptionPlaceholder = (businessType: string) => {
  switch (businessType) {
    case "manufacturer":
      return 'Describe your manufacturing operations (e.g., "We manufacture organic dairy products including milk, cheese, and yogurt. Our facility processes 500L of milk daily with HACCP-certified operations...")';
    case "distributor":
      return 'Describe your distribution business (e.g., "We distribute frozen food products across North India, specializing in ice cream and frozen vegetables with cold-chain logistics...")';
    case "importer":
      return 'Describe your import business (e.g., "We import specialty coffee beans from Colombia and Brazil, focusing on premium arabica varieties for retail and café chains...")';
    case "retailer":
      return 'Describe your retail operations (e.g., "We operate a chain of organic food stores selling fresh produce, packaged goods, and health supplements across 5 locations...")';
    default:
      return "Describe your business operations, products/services, target market, and key business activities...";
  }
};

const getBusinessDescriptionHint = (businessType: string) => {
  switch (businessType) {
    case "manufacturer":
      return "Include: Products manufactured, production capacity, certifications, quality processes";
    case "distributor":
      return "Include: Product categories, distribution network, storage facilities, target markets";
    case "importer":
      return "Include: Product types, origin countries, import volume, end customers";
    case "retailer":
      return "Include: Store locations, product range, customer base, business model";
    default:
      return "Include key business details, products/services, and operational scope";
  }
};

const Page = () => {
  const [currentStep, setCurrentStep] = useState("dashboard"); // 'dashboard', 'category', 'company', 'documents', 'submit'
  const API_BASE =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5005";
  const [selectedCategory, setSelectedCategory] = useState("");
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>({
    name: "",
    address: "",
    phone: "",
    email: "",
    businessType: "",
    businessDescription: "",
    fssaiNumber: "",
    gstNumber: "",
  });
  const [uploadedFiles, setUploadedFiles] = useState<{ [key: string]: File[] }>(
    {}
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("Most Recent");
  const [showFilters, setShowFilters] = useState(true);

  // Mock data for regulations
  const regulations: RegulationCard[] = [
    {
      id: "1",
      title: "New FSSAI Packaging Guidelines for Organic Products",
      summary:
        "Updated labeling requirements for organic food products including mandatory QR codes and traceability information.",
      impact: "High",
      sector: ["Food & Beverages", "Manufacturing"],
      date: "2025-08-15",
      views: 1247,
      status: "New",
      tags: ["FSSAI", "Organic", "Labeling", "Compliance"],
    },
    {
      id: "2",
      title: "GST Rate Changes for Healthcare Products",
      summary:
        "Revised GST rates for medical devices and pharmaceutical products effective from September 2025.",
      impact: "High",
      sector: ["Healthcare", "Finance"],
      date: "2025-08-14",
      views: 892,
      status: "Compliance Required",
      tags: ["GST", "Healthcare", "Tax", "Medical Devices"],
    },
    {
      id: "3",
      title: "Export Documentation Updates for Technology Products",
      summary:
        "New export compliance requirements for AI and semiconductor products.",
      impact: "Medium",
      sector: ["Technology", "Export"],
      date: "2025-08-13",
      views: 634,
      status: "Updated",
      tags: ["Export", "Technology", "AI", "Semiconductors"],
    },
  ];

  const categories = [
    {
      id: "food",
      name: "Food & Beverages",
      icon: "🍽️",
      color: "from-emerald-500 to-cyan-500",
    },
    {
      id: "healthcare",
      name: "Healthcare & Pharma",
      icon: "🏥",
      color: "from-blue-500 to-purple-500",
    },
    {
      id: "technology",
      name: "Technology & IT",
      icon: "💻",
      color: "from-purple-500 to-pink-500",
    },
    {
      id: "finance",
      name: "Finance & Banking",
      icon: "🏦",
      color: "from-yellow-500 to-orange-500",
    },
    {
      id: "export",
      name: "Export & Import",
      icon: "🚢",
      color: "from-green-500 to-blue-500",
    },
    {
      id: "manufacturing",
      name: "Manufacturing",
      icon: "🏭",
      color: "from-red-500 to-yellow-500",
    },
  ];

  const handleFileUpload = (documentId: string, files: FileList) => {
    const fileArray = Array.from(files);
    setUploadedFiles((prev) => ({
      ...prev,
      [documentId]: [...(prev[documentId] || []), ...fileArray],
    }));
  };

  const removeFile = (documentId: string, fileIndex: number) => {
    setUploadedFiles((prev) => ({
      ...prev,
      [documentId]:
        prev[documentId]?.filter((_, index) => index !== fileIndex) || [],
    }));
  };

  // Main render logic
  const renderCurrentStep = () => {
    switch (currentStep) {
      case "category":
        return (
          <CategorySelection
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            setCurrentStep={setCurrentStep}
          />
        );
      case "company":
        return (
          <CompanyDetails
            companyInfo={companyInfo}
            setCompanyInfo={setCompanyInfo}
            selectedCategory={selectedCategory}
            setCurrentStep={setCurrentStep}
          />
        );
      case "documents":
        return (
          <DocumentsUpload
            uploadedFiles={uploadedFiles}
            handleFileUpload={handleFileUpload}
            removeFile={removeFile}
            setCurrentStep={setCurrentStep}
            documents={documentsByCategory[selectedCategory] || []}
            selectedCategory={selectedCategory}
          />
        );
      case "submit":
        return (
          <SubmitComponent
            companyInfo={companyInfo}
            uploadedFiles={uploadedFiles}
            API_BASE={API_BASE}
            selectedCategory={selectedCategory}
            setCurrentStep={setCurrentStep}
            setCompanyInfo={setCompanyInfo}
            setUploadedFiles={setUploadedFiles}
            setSelectedCategory={setSelectedCategory}
            documents={documentsByCategory[selectedCategory] || []}
          />
        );
      default:
        return (
          <CategorySelection
            categories={categories}
            selectedCategory={selectedCategory}
            setSelectedCategory={setSelectedCategory}
            setCurrentStep={setCurrentStep}
          />
        );
    }
  };
  return renderCurrentStep();
};

export default Page;
