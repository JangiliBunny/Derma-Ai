import React, { useState } from 'react';
import { Eye, CheckCircle, XCircle, AlertTriangle, FileText, Image as ImageIcon } from 'lucide-react';
import { MedicalReportModal } from './MedicalReportModal';
import { getImageUrl } from '@/lib/api';

export default function AIDiagnosedCasesTable({ cases }: { cases: any[] }) {
    const [selectedCase, setSelectedCase] = useState<any>(null);
    const [reportModalCase, setReportModalCase] = useState<any>(null);

    const handleFeedback = (id: string, fb: string) => {
        console.log(`Setting feedback for ${id} to ${fb}`);
    };

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden col-span-1 lg:col-span-2">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                        <FileText className="w-5 h-5 text-[#0284c7]" />
                        AI Diagnosed Cases Pending Review
                    </h2>
                    <span className="text-sm font-medium text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                        {cases.filter(c => !c.doctor_feedback).length} Pending
                    </span>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4">Patient ID</th>
                                <th className="px-6 py-4">Scan Image</th>
                                <th className="px-6 py-4">Predicted Disease</th>
                                <th className="px-6 py-4">Confidence</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 rounded-tr-lg">AI Feedback & Medical Report</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {cases.length > 0 ? cases.map((c, idx) => (
                                <tr key={idx} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="px-6 py-4 font-mono font-medium text-slate-600">
                                        #{c.patient_id?.substring(0, 6) || "P001"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden cursor-pointer hover:border-[#0284c7] transition-colors" onClick={() => setSelectedCase(c)}>
                                            {c.image_url ? (
                                                <img src={getImageUrl(c.image_url)} alt="Scan" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-bold text-slate-800">
                                        {c.prediction?.disease_name || "Unknown"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#0284c7] border border-blue-100">
                                            {c.prediction?.confidence ? Math.round(c.prediction.confidence) : 0}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(c.created_at).toLocaleDateString('en-GB', { month: 'short', day: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            {c.doctor_feedback ? (
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${c.doctor_feedback === 'Confirmed' ? 'bg-green-50 text-green-700' :
                                                        c.doctor_feedback === 'Incorrect' ? 'bg-red-50 text-red-700' : 'bg-orange-50 text-orange-700'
                                                    }`}>
                                                    {c.doctor_feedback === 'Confirmed' && <CheckCircle className="w-3.5 h-3.5" />}
                                                    {c.doctor_feedback === 'Incorrect' && <XCircle className="w-3.5 h-3.5" />}
                                                    {c.doctor_feedback === 'Needs Testing' && <AlertTriangle className="w-3.5 h-3.5" />}
                                                    {c.doctor_feedback}
                                                </span>
                                            ) : (
                                                <div className="flex gap-1.5">
                                                    <button
                                                        onClick={() => handleFeedback(c.id, "Confirmed")}
                                                        className="p-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors border border-transparent hover:border-green-200 shadow-xs"
                                                        title="Confirm AI Prediction"
                                                    >
                                                        <CheckCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleFeedback(c.id, "Incorrect")}
                                                        className="p-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors border border-transparent hover:border-red-200 shadow-xs"
                                                        title="Mark Incorrect"
                                                    >
                                                        <XCircle className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleFeedback(c.id, "Needs Testing")}
                                                        className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-md transition-colors border border-transparent hover:border-orange-200 shadow-xs"
                                                        title="Needs Further Testing"
                                                    >
                                                        <AlertTriangle className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setReportModalCase(c)}
                                                className="px-2.5 py-1 text-[#0284c7] hover:bg-blue-50 rounded-md transition-colors flex items-center gap-1 text-xs font-bold border border-blue-200 shadow-xs"
                                            >
                                                <Eye className="w-3.5 h-3.5" /> Full Report
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <FileText className="w-10 h-10 text-gray-300 mb-3" />
                                            <p>No cases assigned to you for review.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {selectedCase && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4" onClick={() => setSelectedCase(null)}>
                        <div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden" onClick={e => e.stopPropagation()}>
                            <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-slate-50">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <ImageIcon className="w-4 h-4 text-[#0284c7]" />
                                    AI Prediction: {selectedCase.prediction?.disease_name}
                                </h3>
                                <button onClick={() => setSelectedCase(null)} className="text-gray-400 hover:text-red-500 transition-colors">
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-6 bg-slate-900 flex justify-center">
                                {selectedCase.image_url ? (
                                    <img src={getImageUrl(selectedCase.image_url)} alt="Scan Details" className="max-h-96 object-contain rounded-lg" />
                                ) : (
                                    <div className="h-64 flex items-center justify-center text-gray-500">No Image</div>
                                )}
                            </div>
                            <div className="p-6 bg-white">
                                <p className="text-sm font-medium text-gray-500 mb-2">Doctor Notes:</p>
                                <textarea
                                    className="w-full border border-gray-200 rounded-xl p-3 text-sm focus:ring-[#0284c7] focus:border-[#0284c7] transition-shadow shadow-sm"
                                    rows={3}
                                    placeholder="Add medical notes or prescriptions here..."
                                ></textarea>
                                <div className="mt-4 flex justify-end gap-3">
                                    <button className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-50 rounded-lg transition-colors border border-gray-200" onClick={() => setSelectedCase(null)}>
                                        Cancel
                                    </button>
                                    <button className="px-4 py-2 bg-[#0284c7] hover:bg-[#0369a1] text-white font-medium rounded-lg transition-colors shadow-sm" onClick={() => setSelectedCase(null)}>
                                        Save Report
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {reportModalCase && (
                <MedicalReportModal
                    scan={reportModalCase}
                    onClose={() => setReportModalCase(null)}
                />
            )}
        </>
    );
}
