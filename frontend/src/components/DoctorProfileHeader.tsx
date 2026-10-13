import React from 'react';
import { User, Star, MapPin, Mail, Phone, Award } from 'lucide-react';
import Link from 'next/link';

export default function DoctorProfileHeader({ profile }: { profile: any }) {
    if (!profile) return null;

    const rating = profile.rating || 5.0;

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col md:flex-row gap-8 items-start relative overflow-hidden">
            {/* Soft background shape */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-teal-50 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl opacity-50 pointer-events-none"></div>

            <div className="flex-shrink-0 relative group z-10">
                <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-slate-100 to-teal-50 border-4 border-white shadow-md flex items-center justify-center overflow-hidden">
                    {profile.photoUrl ? (
                        <img src={profile.photoUrl} alt={profile.full_name} className="w-full h-full object-cover" />
                    ) : (
                        <User className="w-12 h-12 text-teal-600 opacity-60" />
                    )}
                </div>
            </div>

            <div className="flex-1 w-full z-10">
                <div className="flex justify-between items-start mb-4 border-b border-gray-100 pb-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 tracking-tight">{profile.full_name || "Doctor Name"}</h1>
                        <p className="text-sm font-medium text-teal-700 bg-teal-50 px-2 flex items-center gap-1.5 py-0.5 rounded-full inline-flex mt-1">
                            <Award className="w-3.5 h-3.5" />
                            {profile.specialization || "Dermatology Specialist"}
                        </p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-100">
                            <Star className="w-4 h-4 text-amber-500 fill-current" />
                            <span className="font-bold text-amber-700">{rating.toFixed(1)}</span>
                        </div>
                        <Link href="/dashboard/profile" className="px-4 py-2 bg-white border border-gray-200 shadow-sm text-sm font-medium text-slate-700 rounded-xl hover:bg-gray-50 transition-colors hidden sm:block">
                            Edit Profile
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-y-4 gap-x-6">
                    <div className="flex items-center text-sm gap-2">
                        <Mail className="w-4 h-4 text-gray-400" />
                        <div>
                            <p className="text-gray-500 text-xs">Email</p>
                            <p className="font-medium text-slate-700 truncate">{profile.email || "No email provided"}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-sm gap-2">
                        <Phone className="w-4 h-4 text-gray-400" />
                        <div>
                            <p className="text-gray-500 text-xs">Phone Number</p>
                            <p className="font-medium text-slate-700">{profile.mobile_number || "N/A"}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-sm gap-2 lg:col-span-2">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        <div>
                            <p className="text-gray-500 text-xs">Clinic / Hospital Address</p>
                            <p className="font-medium text-slate-700 line-clamp-1">{profile.hospital_name || "Not associated with a clinic"}</p>
                        </div>
                    </div>
                    <div className="flex items-center text-sm gap-2 flex-col items-start gap-0.5">
                        <p className="text-gray-500 text-xs w-full">Years of Experience</p>
                        <p className="font-bold text-slate-800 text-lg">{profile.experience || "0"}+<span className="text-sm font-medium text-gray-500 ml-1">years</span></p>
                    </div>
                    <div className="flex items-center text-sm gap-2 flex-col items-start gap-0.5 lg:col-span-3">
                        <p className="text-gray-500 text-xs w-full">Domain</p>
                        <p className="font-medium text-slate-600 bg-slate-100 px-3 py-1 rounded text-sm inline-block">
                            Skin Diseases / Dermatology
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
