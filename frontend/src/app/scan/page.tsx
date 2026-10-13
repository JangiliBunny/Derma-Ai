"use client";
import { useState, useRef } from "react";
import { UploadCloud, FileImage, ShieldCheck, Activity, AlertCircle, ArrowRight, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { getApiUrl, getReportDownloadUrl } from "@/lib/api";

export default function ScanPage() {
    const [file, setFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [scanId, setScanId] = useState<string | null>(null);
    const [error, setError] = useState<string>("");
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const selected = e.target.files?.[0];
        if (selected) {
            if (!selected.type.startsWith("image/")) {
                setError("Please upload a valid image file.");
                return;
            }
            setError("");
            setFile(selected);
            setPreviewUrl(URL.createObjectURL(selected));
            setResult(null); // Reset previous result
            setScanId(null);
        }
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        const dropped = e.dataTransfer.files?.[0];
        if (dropped && dropped.type.startsWith("image/")) {
            setError("");
            setFile(dropped);
            setPreviewUrl(URL.createObjectURL(dropped));
            setResult(null);
            setScanId(null);
        } else {
            setError("Please drop a valid image file.");
        }
    };

    const analyzeImage = async () => {
        if (!file) return;
        setIsAnalyzing(true);
        setError("");

        try {
            const formData = new FormData();
            formData.append("file", file);

            const token = localStorage.getItem("dermai_token");
            if (!token) {
                throw new Error("You must be logged in to analyze images. Please sign in.");
            }

            const res = await fetch(getApiUrl("/api/predictions/analyze"), {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                },
                body: formData
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Analysis failed");
            }

            const data = await res.json();
            setResult(data.prediction);
            setScanId(data.id);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsAnalyzing(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-extrabold text-[#0f172a] mb-4">AI Dermatologist Analysis</h1>
                    <p className="text-lg text-slate-600">Upload a clear picture of your skin condition for instant, AI-powered analysis.</p>
                </div>

                <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-2">

                        {/* Upload Section */}
                        <div className="p-8 border-b md:border-b-0 md:border-r border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <UploadCloud className="w-6 h-6 mr-2 text-[#0284c7]" /> Upload Scan
                            </h2>

                            <div
                                className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all ${file ? 'border-[#0284c7] bg-blue-50' : 'border-gray-300 hover:border-[#0284c7] hover:bg-gray-50'
                                    }`}
                                onDragOver={handleDragOver}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    ref={fileInputRef}
                                    onChange={handleFileChange}
                                />

                                {previewUrl ? (
                                    <div className="relative w-full h-48 rounded-xl overflow-hidden mb-4 shadow-sm">
                                        <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity cursor-pointer">
                                            <span className="text-white font-medium">Change Image</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="py-8">
                                        <FileImage className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                                        <p className="text-sm font-medium text-slate-700">Click or drag image here</p>
                                        <p className="text-xs text-gray-500 mt-1">PNG, JPG up to 10MB</p>
                                    </div>
                                )}
                            </div>

                            {error && (
                                <div className="mt-4 p-3 bg-red-50 text-red-700 text-sm rounded-lg flex items-center">
                                    <AlertCircle className="w-4 h-4 mr-2" /> {error}
                                </div>
                            )}

                            <button
                                onClick={analyzeImage}
                                disabled={!file || isAnalyzing}
                                className="w-full mt-6 flex items-center justify-center py-4 px-6 border border-transparent rounded-xl shadow-sm text-base font-medium text-white bg-[#0f172a] hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <Activity className="animate-pulse w-5 h-5 mr-2" /> Analyzing Image...
                                    </>
                                ) : (
                                    <>
                                        Run AI Analysis <ArrowRight className="ml-2 w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </div>

                        {/* Results Section */}
                        <div className="p-8 bg-white relative">
                            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center">
                                <ShieldCheck className="w-6 h-6 mr-2 text-teal-600" /> Assessment Results
                            </h2>

                            <AnimatePresence>
                                {isAnalyzing && (
                                    <motion.div
                                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                                        className="absolute inset-0 z-10 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center p-8 text-center rounded-r-3xl"
                                    >
                                        <div className="w-16 h-16 border-4 border-gray-200 border-t-[#0284c7] rounded-full animate-spin mb-4"></div>
                                        <p className="text-lg font-medium text-slate-800">Processing image through neural network...</p>
                                        <p className="text-sm text-slate-500 mt-2">Extracting features and running MobileNetV2 transfer learning model.</p>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {!result && !isAnalyzing && (
                                <div className="h-full flex flex-col items-center justify-center text-center text-gray-400 pb-12">
                                    <Activity className="w-16 h-16 mb-4 opacity-20" />
                                    <p>Upload an image and run analysis<br />to see results here.</p>
                                </div>
                            )}

                            {result && !isAnalyzing && (
                                <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                                    <div className="p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-white shadow-lg">
                                        <p className="text-sm text-slate-300 font-medium mb-1">Detected Condition</p>
                                        <h3 className="text-3xl font-bold text-teal-300 mb-4">{result.disease_name}</h3>

                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="font-medium">AI Confidence</span>
                                                <span className="font-bold">{result.confidence}%</span>
                                            </div>
                                            <div className="h-2.5 bg-slate-700 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }} animate={{ width: `${result.confidence}%` }} transition={{ duration: 1, ease: "easeOut" }}
                                                    className={`h-full ${result.confidence > 90 ? 'bg-teal-400' : result.confidence > 75 ? 'bg-yellow-400' : 'bg-red-400'}`}
                                                ></motion.div>
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <h4 className="font-bold text-slate-800 mb-2">Description</h4>
                                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-gray-100">{result.description}</p>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Symptoms</h4>
                                            <ul className="text-sm text-slate-600 space-y-1">
                                                {result.symptoms.map((s: string, i: number) => (
                                                    <li key={i} className="flex items-start"><span className="text-[#0284c7] mr-2">•</span> {s}</li>
                                                ))}
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 mb-2 text-sm uppercase tracking-wider">Precautions</h4>
                                            <ul className="text-sm text-slate-600 space-y-1">
                                                {result.precautions.map((p: string, i: number) => (
                                                    <li key={i} className="flex items-start"><span className="text-teal-600 mr-2">•</span> {p}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-gray-100 flex gap-3">
                                        <button
                                            onClick={async () => {
                                                const token = localStorage.getItem("dermai_token");
                                                if (!token || !scanId) return;

                                                try {
                                                    const res = await fetch(getReportDownloadUrl(scanId), {
                                                        headers: { "Authorization": `Bearer ${token}` }
                                                    });

                                                    if (res.ok) {
                                                        const blob = await res.blob();
                                                        const url = window.URL.createObjectURL(blob);
                                                        const a = document.createElement('a');
                                                        a.href = url;
                                                        // Using the parent scanId from state instead of result.id
                                                        a.download = `dermai_report_${scanId}.pdf`;
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
                                            className="flex-1 flex items-center justify-center py-3 bg-white border border-gray-300 text-slate-700 rounded-xl hover:bg-gray-50 font-medium transition-colors text-sm"
                                        >
                                            <Download className="w-4 h-4 mr-2" /> Download Report
                                        </button>
                                        <button
                                            onClick={() => {
                                                const msg = new SpeechSynthesisUtterance(`Analysis Complete. Detected ${result.disease_name} with ${Math.round(result.confidence)} percent confidence. ${result.description} Please consult a dermatologist.`);
                                                window.speechSynthesis.speak(msg);
                                            }}
                                            className="flex-1 flex items-center justify-center py-3 bg-teal-50 text-teal-700 border border-teal-200 rounded-xl hover:bg-teal-100 font-medium transition-colors text-sm"
                                        >
                                            <Activity className="w-4 h-4 mr-2" /> Listen
                                        </button>
                                    </div>
                                </motion.div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
