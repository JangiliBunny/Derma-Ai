import React from 'react';
import { Award, BookOpen, GraduationCap, Users } from 'lucide-react';

export default function DoctorBio({ profile }: { profile: any }) {
    if (!profile) return null;

    const defaultBio = `Dr. ${profile.full_name || "Doctor"} is a senior dermatologist with over ${profile.experience || 10} years of experience in treating acne, eczema, psoriasis, fungal infections, and other skin conditions. Specializes in AI-assisted dermatology diagnostics.`;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h2 className="text-lg font-bold text-slate-800 mb-4">About the Doctor</h2>

            <p className="text-slate-600 text-sm leading-relaxed mb-6">
                {profile.bio || defaultBio}
            </p>

            <div className="space-y-4 mt-auto">
                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-blue-50 text-[#0284c7] mt-0.5">
                        <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Education</p>
                        <p className="text-xs text-slate-500">{profile.education || "MBBS, MD - Dermatology"}</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-teal-50 text-teal-600 mt-0.5">
                        <Award className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Certifications</p>
                        <p className="text-xs text-slate-500">Board Certified Dermatologist</p>
                    </div>
                </div>

                <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-purple-50 text-purple-600 mt-0.5">
                        <Users className="w-4 h-4" />
                    </div>
                    <div>
                        <p className="text-sm font-bold text-slate-800">Patient Feedback</p>
                        <p className="text-xs text-slate-500">Highly recommended for accurate diagnosis</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
