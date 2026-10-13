'use client';

import React, { useState } from 'react';
import { Eye, Download, Image as ImageIcon } from 'lucide-react';
import { MedicalReportModal } from './MedicalReportModal';
import { getImageUrl, getReportDownloadUrl } from '@/lib/api';

export function RecentScansTable({ scans }: { scans: any[] }) {
    const [selectedScan, setSelectedScan] = useState<any | null>(null);

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Recent Skin Disease Scans</h2>
                    <span className="text-xs text-slate-500 font-medium">{scans.length} Scans Found</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-lg">Scan Date</th>
                                <th className="px-6 py-4">Skin Image</th>
                                <th className="px-6 py-4">AI Predicted Disease</th>
                                <th className="px-6 py-4">Confidence</th>
                                <th className="px-6 py-4">Severity</th>
                                <th className="px-6 py-4">Doctor Assigned</th>
                                <th className="px-6 py-4 rounded-tr-lg text-right">Medical Report</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {scans.length > 0 ? scans.map((scan, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        {new Date(scan.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="w-10 h-10 rounded-lg bg-gray-100 border border-gray-200 flex items-center justify-center overflow-hidden shadow-xs">
                                            {scan.image_url ? (
                                                <img src={getImageUrl(scan.image_url)} alt="Scan" className="w-full h-full object-cover" />
                                            ) : (
                                                <ImageIcon className="w-5 h-5 text-gray-400" />
                                            )}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-800">
                                        {scan.prediction?.disease_name || "Unknown"}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-[#0284c7] border border-blue-100">
                                            {scan.prediction?.confidence || 0}%
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${scan.severity === 'High' ? 'bg-red-50 text-red-700 border-red-100' :
                                            scan.severity === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                'bg-green-50 text-green-700 border-green-100'
                                            }`}>
                                            {scan.severity || "Low"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {scan.doctor_id ? `Dr. ${scan.doctor_id}` : "Pending Assignment"}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button
                                            onClick={() => setSelectedScan(scan)}
                                            className="px-3 py-1.5 text-[#0284c7] hover:bg-blue-50 border border-blue-200 rounded-lg transition-colors inline-flex items-center gap-1.5 text-xs font-bold shadow-xs"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> View Report
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <ImageIcon className="w-10 h-10 text-gray-300 mb-3" />
                                            <p>No recent scans found.</p>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedScan && (
                <MedicalReportModal
                    scan={selectedScan}
                    onClose={() => setSelectedScan(null)}
                />
            )}
        </>
    );
}

export function DiseaseHistoryTable({ scans }: { scans: any[] }) {
    const [selectedScan, setSelectedScan] = useState<any | null>(null);

    return (
        <>
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-lg font-bold text-slate-800">Skin Disease History</h2>
                    <span className="text-xs text-slate-500 font-medium">{scans.length} Records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-lg">Date</th>
                                <th className="px-6 py-4">Disease</th>
                                <th className="px-6 py-4">AI Confidence</th>
                                <th className="px-6 py-4">Severity</th>
                                <th className="px-6 py-4">Doctor Diagnosis</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4 rounded-tr-lg text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {scans.length > 0 ? scans.map((scan, idx) => (
                                <tr key={idx} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-slate-600 font-medium">
                                        {new Date(scan.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
                                    </td>
                                    <td className="px-6 py-4 font-semibold text-slate-800">
                                        {scan.prediction?.disease_name || "Unknown"}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">
                                        {scan.prediction?.confidence || 0}%
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${scan.severity === 'High' ? 'bg-red-50 text-red-700 border-red-100' :
                                            scan.severity === 'Medium' ? 'bg-orange-50 text-orange-700 border-orange-100' :
                                                'bg-green-50 text-green-700 border-green-100'
                                            }`}>
                                            {scan.severity || "Low"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        {scan.doctor_diagnosis ? (
                                            <span className="text-green-600 font-medium inline-flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-green-500"></div>Confirmed</span>
                                        ) : (
                                            <span className="text-orange-500 font-medium inline-flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-orange-400"></div>Pending</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200">
                                            {scan.doctor_review === "Pending" ? "Needs Review" : "Under Treatment"}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-right space-x-2">
                                        <button
                                            onClick={() => setSelectedScan(scan)}
                                            className="px-2.5 py-1.5 text-slate-700 hover:text-[#0284c7] hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg transition-all inline-flex items-center gap-1.5 text-xs font-semibold shadow-xs"
                                        >
                                            <Eye className="w-3.5 h-3.5" /> View Report
                                        </button>
                                        <button
                                            onClick={async () => {
                                                const token = localStorage.getItem("dermai_token");
                                                if (!token) return;
                                                try {
                                                    const dloadId = scan.id || scan._id;
                                                    const res = await fetch(getReportDownloadUrl(dloadId), {
                                                        headers: { "Authorization": `Bearer ${token}` }
                                                    });
                                                    if (res.ok) {
                                                        const blob = await res.blob();
                                                        const url = window.URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        a.download = `dermai_report_${dloadId}.pdf`;
                                                        document.body.appendChild(a);
                                                        a.click();
                                                        a.remove();
                                                        window.URL.revokeObjectURL(url);
                                                    } else {
                                                        const txt = await res.text();
                                                        alert(`Failed to download report. Server responded: ${res.status} ${txt}`);
                                                    }
                                                } catch (e: any) {
                                                    alert(`Download error: ${e.message}`);
                                                }
                                            }}
                                            className="p-1.5 text-slate-600 hover:text-[#0284c7] hover:bg-blue-50 border border-gray-200 hover:border-blue-200 rounded-lg transition-all inline-flex items-center gap-1 text-xs font-semibold shadow-xs"
                                            title="Download PDF"
                                        >
                                            <Download className="w-3.5 h-3.5" />
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        <p>No history available.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedScan && (
                <MedicalReportModal
                    scan={selectedScan}
                    onClose={() => setSelectedScan(null)}
                />
            )}
        </>
    );
}
