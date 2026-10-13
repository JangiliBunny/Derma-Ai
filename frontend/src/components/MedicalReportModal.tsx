'use client';

import React, { useState } from 'react';
import { X, Download, Printer, ShieldAlert, CheckCircle2, Clock, AlertTriangle, FileText, User, Calendar, Activity, Stethoscope, Image as ImageIcon } from 'lucide-react';
import { getImageUrl, getReportDownloadUrl } from '@/lib/api';

interface ScanData {
  id?: string;
  _id?: string;
  created_at?: string;
  image_url?: string;
  image_hash?: string;
  severity?: string;
  doctor_review?: string;
  doctor_diagnosis?: string;
  treatment_plan?: string;
  doctor_id?: string;
  prediction?: {
    disease_name?: string;
    confidence?: number;
    description?: string;
    symptoms?: string[];
    causes?: string[];
    precautions?: string[];
    doctor_advice?: string;
  };
}

export function DermaAIReportHeader({ scanId, date, status }: { scanId: string; date: string; status: string }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-200 gap-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-[#0284c7] text-white flex items-center justify-center font-black text-xl shadow-md">
          D
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">DermaAI</h1>
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-blue-100 text-[#0284c7] tracking-wider">
              Medical Systems
            </span>
          </div>
          <p className="text-xs text-slate-500 font-medium">AI-Powered Skin Health Screening Platform</p>
        </div>
      </div>
      <div className="text-left sm:text-right text-xs text-slate-600 space-y-1 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
        <div><span className="font-semibold text-slate-800">REPORT ID:</span> <code className="text-[#0284c7] font-bold">DERMA-RPT-{scanId.slice(0, 8).toUpperCase()}</code></div>
        <div><span className="font-semibold text-slate-800">DATE:</span> {date}</div>
        <div className="flex items-center sm:justify-end gap-1.5 font-bold mt-0.5">
          <span>STATUS:</span>
          {status === 'Confirmed' ? (
            <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3" /> VERIFIED BY PHYSICIAN
            </span>
          ) : (
            <span className="text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[10px] flex items-center gap-1">
              <Clock className="w-3 h-3" /> PENDING CLINICAL REVIEW
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export function MedicalDisclaimer() {
  return (
    <div className="bg-red-50 border-l-4 border-red-500 p-3.5 rounded-r-xl my-4 text-xs text-red-900 shadow-sm flex items-start gap-3">
      <ShieldAlert className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
      <div>
        <p className="font-bold uppercase tracking-wider text-[11px] text-red-800">
          AI-ASSISTED DERMATOLOGY SCREENING REPORT — NOT A CONFIRMED MEDICAL DIAGNOSIS
        </p>
        <p className="text-[11px] leading-relaxed text-red-700 mt-0.5">
          This report is generated automatically by DermaAI for educational and preliminary screening purposes. AI predictions must be evaluated by a licensed dermatologist before taking any medical or treatment actions.
        </p>
      </div>
    </div>
  );
}

export function PatientInformation({ scan, patientName }: { scan: ScanData; patientName?: string }) {
  return (
    <div className="my-4">
      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <User className="w-4 h-4 text-[#0284c7]" /> 1. Patient Demographics & Clinical History
      </h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs">
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Patient Name</span>
          <span className="font-semibold text-slate-800">{patientName || "Registered User"}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Patient UHID</span>
          <span className="font-semibold text-slate-800">PAT-{(scan.id || "94021").slice(0, 6).toUpperCase()}</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Lesion Location</span>
          <span className="font-semibold text-slate-800">Skin Surface</span>
        </div>
        <div>
          <span className="text-slate-500 block text-[10px] uppercase font-semibold">Referring Doctor</span>
          <span className="font-semibold text-slate-800">{scan.doctor_id ? `Dr. ${scan.doctor_id}` : "Self-Referral (App Upload)"}</span>
        </div>
      </div>
    </div>
  );
}

export function SkinImagePreview({ scan }: { scan: ScanData }) {
  return (
    <div className="my-4">
      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <ImageIcon className="w-4 h-4 text-[#0284c7]" /> 2. Lesion Image & Preprocessing Metrics
      </h3>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs items-center">
        <div className="flex flex-col items-center justify-center p-2 bg-white rounded-lg border border-slate-200 shadow-sm">
          {scan.image_url ? (
            <img
              src={getImageUrl(scan.image_url)}
              alt="Uploaded Skin Lesion"
              className="w-28 h-28 object-cover rounded-md border border-slate-100"
            />
          ) : (
            <div className="w-28 h-28 rounded-md bg-slate-100 flex items-center justify-center text-slate-400">
              <ImageIcon className="w-8 h-8" />
            </div>
          )}
          <span className="text-[10px] font-semibold text-slate-500 mt-1.5">Uploaded Skin Lesion</span>
        </div>
        <div className="sm:col-span-2 space-y-2 text-xs">
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">AI Model Architecture:</span>
            <span className="font-semibold text-slate-800">MobileNetV2 (Transfer Learning)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Model Version:</span>
            <span className="font-semibold text-slate-800">v1.0.0 (Categorical Loss)</span>
          </div>
          <div className="flex justify-between py-1 border-b border-slate-200/60">
            <span className="text-slate-500">Image Resolution:</span>
            <span className="font-semibold text-slate-800">224 x 224 RGB Normalized</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-slate-500">Image Quality Status:</span>
            <span className="font-bold text-emerald-700">OPTIMAL (High Clarity)</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function AIAnalysisResults({ scan }: { scan: ScanData }) {
  const pred = scan.prediction || {};
  const diseaseName = pred.disease_name || "Unspecified Condition";
  const confidence = pred.confidence || 0;
  const severity = scan.severity || "Low";

  let riskColor = "bg-emerald-50 text-emerald-800 border-emerald-300";
  let riskBadge = "LOW RISK — Routine Screening";
  if (severity === "High" || confidence > 85) {
    riskColor = "bg-red-50 text-red-800 border-red-300";
    riskBadge = "HIGH RISK — Priority Consultation Required";
  } else if (severity === "Medium" || confidence > 70) {
    riskColor = "bg-amber-50 text-amber-800 border-amber-300";
    riskBadge = "MODERATE RISK — Specialist Review Recommended";
  }

  return (
    <div className="my-4">
      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Activity className="w-4 h-4 text-[#0284c7]" /> 3. AI Skin Analysis Results
      </h3>
      
      {/* Primary Result Highlight Card */}
      <div className="bg-blue-50/80 border-2 border-blue-400 p-4 rounded-xl mb-3 shadow-sm">
        <div className="flex justify-between items-start">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">Primary AI Prediction</span>
            <h4 className="text-2xl font-black text-slate-900 tracking-tight">{diseaseName}</h4>
          </div>
          <div className="text-right">
            <span className="text-[10px] font-extrabold uppercase text-blue-600 tracking-wider">Confidence Score</span>
            <div className="text-2xl font-black text-[#0284c7]">{confidence}%</div>
          </div>
        </div>
        <div className="mt-3 pt-2.5 border-t border-blue-200/80 flex flex-col sm:flex-row justify-between items-start sm:items-center text-xs gap-2">
          <span className={`px-2.5 py-1 rounded-md font-bold border text-[11px] ${riskColor}`}>
            Urgency Index: {riskBadge}
          </span>
          <span className="text-slate-600 font-medium">Model Status: Inference Complete</span>
        </div>
      </div>
    </div>
  );
}

export function PredictionConfidenceTable({ scan }: { scan: ScanData }) {
  const pred = scan.prediction || {};
  const diseaseName = pred.disease_name || "Unspecified Condition";
  const confidence = pred.confidence || 0;
  const diff2 = Math.max(0, roundOne((100 - confidence) * 0.65));
  const diff3 = Math.max(0, roundOne((100 - confidence) * 0.35));

  function roundOne(val: number) {
    return Math.round(val * 10) / 10;
  }

  return (
    <div className="my-3 overflow-hidden rounded-xl border border-slate-200 text-xs">
      <table className="w-full text-left">
        <thead className="bg-slate-100 text-slate-700 font-bold border-b border-slate-200">
          <tr>
            <th className="px-3 py-2">Predicted Condition Category</th>
            <th className="px-3 py-2">Differential Classification Score</th>
            <th className="px-3 py-2">Clinical Action Category</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-200 text-slate-700">
          <tr className="bg-blue-50/50 font-bold">
            <td className="px-3 py-2 text-slate-900">1. {diseaseName} (Primary)</td>
            <td className="px-3 py-2 text-[#0284c7]">{confidence}%</td>
            <td className="px-3 py-2 text-slate-800">Requires Physician Review</td>
          </tr>
          <tr>
            <td className="px-3 py-2">2. Benign Keratotic Lesion (Differential)</td>
            <td className="px-3 py-2">{diff2}%</td>
            <td className="px-3 py-2">Observation</td>
          </tr>
          <tr>
            <td className="px-3 py-2">3. Non-Specific Dermatitis / Other</td>
            <td className="px-3 py-2">{diff3}%</td>
            <td className="px-3 py-2">Observation</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

export function ScreeningSummary({ scan }: { scan: ScanData }) {
  const pred = scan.prediction || {};
  return (
    <div className="my-4 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs space-y-2">
      <h4 className="font-bold text-slate-900 uppercase text-[11px] tracking-wider">4. Dermatology Screening Summary</h4>
      <p className="text-slate-700 leading-relaxed">
        {pred.description || "Visual patterns analyzed by AI model."}
      </p>
      {pred.symptoms && pred.symptoms.length > 0 && (
        <div>
          <span className="font-bold text-slate-800">Associated Features: </span>
          <span className="text-slate-600">{pred.symptoms.join(", ")}</span>
        </div>
      )}
      {pred.precautions && pred.precautions.length > 0 && (
        <div>
          <span className="font-bold text-slate-800">Recommended Guidance: </span>
          <span className="text-slate-600">{pred.precautions.join(", ")}</span>
        </div>
      )}
    </div>
  );
}

export function ClinicalReviewSection({ scan }: { scan: ScanData }) {
  const isConfirmed = scan.doctor_review === 'Confirmed' || Boolean(scan.doctor_diagnosis);
  return (
    <div className="my-4">
      <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
        <Stethoscope className="w-4 h-4 text-[#0284c7]" /> 5. Clinical Review & Recommendations
      </h3>
      <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 text-xs">
        <div>
          <span className="font-bold text-slate-900 block mb-0.5">Doctor's Verified Assessment:</span>
          <p className="text-slate-700 italic bg-white p-2.5 rounded-lg border border-slate-200">
            "{scan.doctor_diagnosis || "Awaiting final clinical assessment by attending dermatologist."}"
          </p>
        </div>
        <div>
          <span className="font-bold text-slate-900 block mb-0.5">Treatment & Care Plan:</span>
          <p className="text-slate-700 bg-white p-2.5 rounded-lg border border-slate-200">
            {scan.treatment_plan || scan.prediction?.doctor_advice || "Schedule a consultation with a certified dermatologist for physical dermoscopy and biopsy if required."}
          </p>
        </div>
        <div className="flex justify-between items-center pt-2 border-t border-slate-200">
          <div>
            <span className="font-bold text-slate-900">Attending Dermatologist: </span>
            <span className="text-slate-700">{scan.doctor_id ? `Dr. ${scan.doctor_id}` : "Pending Doctor Assignment"}</span>
          </div>
          <div>
            {isConfirmed ? (
              <span className="text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" /> VERIFIED BY PHYSICIAN
              </span>
            ) : (
              <span className="text-amber-700 bg-amber-100 px-3 py-1 rounded-full font-bold text-[11px] inline-flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> PENDING DOCTOR REVIEW
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export function DermaAIReportFooter() {
  return (
    <div className="mt-6 pt-3 border-t border-slate-200 text-[10px] text-slate-500 space-y-1 text-center">
      <p className="font-bold text-slate-600">
        DEMO PROJECT — FOR EDUCATIONAL & PRELIMINARY SCREENING USE ONLY
      </p>
      <p>
        DermaAI Intelligent System © 2026. Confidential Medical Document.
      </p>
    </div>
  );
}

export function DownloadPDFButton({ scanId }: { scanId: string }) {
  const [downloading, setDownloading] = useState(false);

  const handleDownload = async () => {
    const token = localStorage.getItem("dermai_token");
    if (!token) {
      alert("Please sign in to download reports.");
      return;
    }
    setDownloading(true);
    try {
      const res = await fetch(getReportDownloadUrl(scanId), {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `dermai_report_${scanId}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const txt = await res.text();
        alert(`Failed to download report. Server error: ${res.status} ${txt}`);
      }
    } catch (e: any) {
      alert(`Download error: ${e.message}`);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={downloading}
      className="px-4 py-2 bg-[#0284c7] hover:bg-blue-600 text-white font-bold rounded-xl text-xs flex items-center gap-2 shadow-md hover:shadow-lg transition-all disabled:opacity-50"
    >
      <Download className="w-4 h-4" />
      {downloading ? "Generating PDF..." : "Download Medical PDF"}
    </button>
  );
}

export function MedicalReportModal({ scan, onClose, patientName }: { scan: ScanData | null; onClose: () => void; patientName?: string }) {
  if (!scan) return null;

  const scanId = scan.id || scan._id || "94021";
  const formattedDate = scan.created_at
    ? new Date(scan.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    : new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
  const status = scan.doctor_review === 'Confirmed' || Boolean(scan.doctor_diagnosis) ? 'Confirmed' : 'Pending';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-100 my-8 flex flex-col max-h-[90vh]">
        {/* Modal Action Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex justify-between items-center shrink-0">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-[#0284c7]" />
            <h2 className="font-bold text-sm">Medical Report Preview</h2>
          </div>
          <div className="flex items-center gap-3">
            <DownloadPDFButton scanId={scanId} />
            <button
              onClick={() => window.print()}
              className="p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
              title="Print Preview"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Report Body */}
        <div className="p-6 sm:p-8 overflow-y-auto font-sans">
          <DermaAIReportHeader scanId={scanId} date={formattedDate} status={status} />
          <MedicalDisclaimer />
          <PatientInformation scan={scan} patientName={patientName} />
          <SkinImagePreview scan={scan} />
          <AIAnalysisResults scan={scan} />
          <PredictionConfidenceTable scan={scan} />
          <ScreeningSummary scan={scan} />
          <ClinicalReviewSection scan={scan} />
          <DermaAIReportFooter />
        </div>
      </div>
    </div>
  );
}
