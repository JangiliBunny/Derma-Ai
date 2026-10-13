"use client";

import React, { useState, useEffect } from 'react';
import DoctorListCard from "@/components/DoctorListCard";
import { Search, Filter, Activity } from 'lucide-react';
import Link from 'next/link';
import Navbar from "@/components/Navbar";
import { getApiUrl } from "@/lib/api";

export default function DoctorsPage() {
    const [doctors, setDoctors] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState("");

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await fetch(getApiUrl("/api/doctors/"));
                if (res.ok) {
                    const data = await res.json();
                    setDoctors(data);
                }
            } catch (error) {
                console.error("Failed to load doctors", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchDoctors();
    }, []);

    const filteredDoctors = doctors.filter(doc =>
        doc.full_name?.toLowerCase().includes(search.toLowerCase()) ||
        doc.specialization?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="mb-8 text-center max-w-3xl mx-auto">
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 mb-4">Find a Doctor</h1>
                    <p className="text-lg text-slate-600">Browse our verified network of dermatologists and specialists. Book online video consultations or clinic visits safely and easily.</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 mb-8 flex flex-col sm:flex-row gap-4 max-w-4xl mx-auto">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by doctor name or condition..."
                            className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <button className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium rounded-xl border border-slate-200 transition-colors">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                </div>

                {/* Doctor List */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0284c7]"></div>
                    </div>
                ) : (
                    <div className="space-y-6 max-w-4xl mx-auto">
                        {filteredDoctors.length > 0 ? (
                            filteredDoctors.map((doc, idx) => (
                                <DoctorListCard key={idx} doctor={doc} />
                            ))
                        ) : (
                            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                                <div className="w-16 h-16 bg-blue-50 text-[#0284c7] rounded-full flex items-center justify-center mx-auto mb-4">
                                    <Search className="w-8 h-8" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 mb-1">No doctors found</h3>
                                <p className="text-slate-500">Try adjusting your search criteria.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
