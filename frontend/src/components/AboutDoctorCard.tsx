import React from 'react';
import { Calendar, Users, MessageCircle, Clock, CheckCircle } from 'lucide-react';

export default function AboutDoctorCard({ profile }: { profile: any }) {
    if (!profile) return null;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full bg-gradient-to-b from-white to-slate-50/50">
            <h2 className="text-lg font-bold text-slate-800 mb-6">Consultation Overview</h2>

            <div className="grid grid-cols-2 gap-4 mb-8 flex-1">
                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <Clock className="w-4 h-4 text-blue-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Experience</span>
                    </div>
                    <p className="text-xl font-bold text-slate-800">{profile.experience || 10} <span className="text-sm font-medium text-gray-500">years</span></p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <CheckCircle className="w-4 h-4 text-green-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Recommendation</span>
                    </div>
                    <p className="text-xl font-bold text-slate-800">92<span className="text-sm font-medium text-gray-500">%</span></p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center">
                    <div className="flex items-center gap-2 mb-2">
                        <Users className="w-4 h-4 text-purple-500" />
                        <span className="text-xs font-semibold text-gray-500 uppercase">Patients Treated</span>
                    </div>
                    <p className="text-xl font-bold text-slate-800">2000<span className="text-sm font-medium text-gray-500">+</span></p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm flex flex-col justify-center relative overflow-hidden group">
                    <div className="absolute inset-0 bg-teal-500 opacity-0 group-hover:opacity-10 transition-opacity"></div>
                    <div className="flex items-center gap-2 mb-2">
                        <MessageCircle className="w-4 h-4 text-teal-600 z-10" />
                        <span className="text-xs font-semibold text-gray-500 uppercase z-10 text-center">Online Consulation</span>
                    </div>
                    <p className="text-sm font-bold text-teal-700 z-10 flex items-center justify-center gap-1.5 bg-teal-50 py-1 rounded-md">
                        <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span> Available
                    </p>
                </div>
            </div>

            <div className="mt-auto space-y-3">
                <button className="w-full py-3.5 bg-[#0284c7] hover:bg-[#0369a1] text-white rounded-xl font-medium shadow-sm shadow-blue-500/20 transition-all flex items-center justify-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Book Appointment
                </button>
                <button className="w-full py-3 bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 rounded-xl font-medium transition-colors">
                    Leave a Review
                </button>
            </div>
        </div>
    );
}
