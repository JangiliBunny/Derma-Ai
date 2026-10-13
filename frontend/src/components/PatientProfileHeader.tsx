import React from 'react';
import { User, Mail, Activity, Calendar, Hash, Droplet } from 'lucide-react';
import Link from 'next/link';

export default function PatientProfileHeader({ profile }: { profile: any }) {
    if (!profile) return null;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
            {/* Soft background shape */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl opacity-50 pointer-events-none"></div>

            <div className="flex-shrink-0 relative group">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-slate-100 to-blue-50 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                    {profile.photoUrl ? (
                        <img src={profile.photoUrl} alt={profile.full_name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-12 h-12 text-[#0284c7] opacity-60" />
                    )}
                </div>
                <button className="absolute bottom-2 right-2 bg-white text-slate-700 p-1.5 rounded-lg shadow-sm border border-gray-200 hover:bg-gray-50 opacity-0 group-hover:opacity-100 transition-opacity">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                </button>
            </div>

            <div className="flex-1 w-full z-10">
                <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{profile.full_name || "Patient Name"}</h1>
                        <p className="text-sm font-medium text-[#0284c7] bg-blue-50 px-2 py-0.5 rounded-full inline-block mt-1">
                            {profile.department || "Dermatology"}
                        </p>
                    </div>
                    <Link href="/dashboard/profile" className="px-4 py-2 bg-white border border-gray-200 shadow-sm text-sm font-medium text-slate-700 rounded-xl hover:bg-gray-50 transition-colors hidden sm:block">
                        Edit Profile
                    </Link>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-y-4 gap-x-6">
                    <div className="flex items-center text-sm gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                            <p className="text-gray-500 text-xs">Email</p>
                            <p className="font-medium text-slate-700 truncate">{profile.email || "No email"}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-sm gap-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <div>
                            <p className="text-gray-500 text-xs">Gender / Age</p>
                            <p className="font-medium text-slate-700">{profile.gender || "Unspecified"} • {profile.age ? `${profile.age} yrs` : "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-sm gap-2">
                        <Droplet className="w-4 h-4 text-red-400" />
                        <div>
                            <p className="text-gray-500 text-xs">Blood Group</p>
                            <p className="font-medium text-slate-700">{profile.blood_group || "Unknown"}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-sm gap-2">
                        <Activity className="w-4 h-4 text-teal-500" />
                        <div>
                            <p className="text-gray-500 text-xs">Status</p>
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                {profile.status || "Active"}
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center text-sm gap-2">
                        <Calendar className="w-4 h-4 text-purple-400" />
                        <div>
                            <p className="text-gray-500 text-xs">Registered Date</p>
                            <p className="font-medium text-slate-700">{profile.created_at ? new Date(profile.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-sm gap-2 flex-col items-start gap-0.5">
                        <p className="text-gray-500 text-xs w-full">Appointments</p>
                        <p className="font-bold text-slate-800 text-lg">{profile.appointments_count || "0"}</p>
                    </div>
                    <div className="flex items-center text-sm gap-2 flex-col items-start gap-0.5">
                        <p className="text-gray-500 text-xs w-full">Patient ID</p>
                        <p className="font-mono font-medium text-slate-600 bg-slate-100 px-2 py-1 rounded text-xs">
                            #{profile.id?.substring(0, 6) || "P001"}
                        </p>
                    </div>
                </div>

                <Link href="/dashboard/profile" className="mt-4 px-4 py-2 w-full text-center flex items-center justify-center bg-white border border-gray-200 shadow-sm text-sm font-medium text-slate-700 rounded-xl hover:bg-gray-50 transition-colors sm:hidden">
                    Edit Profile
                </Link>
            </div>
        </div>
    );
}
