import React from 'react';
import Navbar from '@/components/Navbar';
import { MapPin, Star, Calendar, ChevronRight, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { getApiUrl } from '@/lib/api';

export default async function DoctorProfilePage({ params }: { params: Promise<{ id: string }> | { id: string } }) {
    // Fetch doctor data server-side
    let doctor: any = null;
    let error = null;

    try {
        const resolvedParams = await Promise.resolve(params);
        const res = await fetch(getApiUrl(`/api/doctors/${resolvedParams.id}`), { cache: 'no-store' });
        if (res.ok) {
            doctor = await res.json();
        } else {
            error = "Doctor not found.";
        }
    } catch (e: any) {
        error = e.message;
    }

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col">
            <div className="pt-24 pb-12 px-6 flex-1 max-w-5xl mx-auto w-full">
                <Link href="/doctors" className="inline-flex items-center gap-2 text-slate-500 hover:text-[#0284c7] mb-8 font-medium transition-colors">
                    <ArrowLeft className="w-4 h-4" /> Back to Doctors
                </Link>

                {error ? (
                    <div className="bg-red-50 text-red-700 p-6 rounded-2xl text-center">
                        {error}
                    </div>
                ) : !doctor ? (
                    <div className="text-center py-12">Loading profile...</div>
                ) : (
                    <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 lg:gap-16 items-start">
                        <div className="flex-shrink-0 w-full md:w-auto flex flex-col items-center">
                            <img
                                src={doctor.profile_image || "https://i.pravatar.cc/150?u=" + doctor._id}
                                alt={doctor.full_name}
                                className="w-40 h-40 md:w-48 md:h-48 rounded-full object-cover border-4 border-slate-50 shadow-md"
                            />
                            {doctor.online_consultation_enabled !== false && (
                                <span className="mt-4 px-3 py-1 bg-green-50 text-green-700 text-xs font-bold rounded-full border border-green-100 inline-flex items-center gap-1.5">
                                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> Available for Video Consult
                                </span>
                            )}
                        </div>

                        <div className="flex-1 w-full">
                            <div className="mb-6 border-b border-gray-100 pb-6">
                                <h1 className="text-3xl md:text-4xl font-bold text-slate-800 mb-2">
                                    Dr. {doctor.full_name}
                                </h1>
                                <p className="text-[#0284c7] font-semibold text-lg md:text-xl">
                                    {doctor.specialization || "Dermatology Specialist"}
                                </p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Experience</p>
                                        <p className="text-slate-800 font-medium">{doctor.experience || 5}+ Years</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Hospital / Clinic</p>
                                        <p className="text-slate-800 font-medium flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-slate-400" />
                                            {doctor.hospital_name || 'DERMA AI Virtual Clinic'}
                                        </p>
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <div>
                                        <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-1">Rating</p>
                                        <p className="text-slate-800 font-medium flex items-center gap-1">
                                            <Star className="w-5 h-5 text-amber-400 fill-amber-400" />
                                            {doctor.rating || '4.8'} <span className="text-slate-500 font-normal">({doctor.patients_consulted || 0} reviews)</span>
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-8">
                                <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold mb-3">About Dr. {doctor.full_name.split(' ')[0]}</p>
                                <p className="text-slate-600 leading-relaxed text-sm md:text-base bg-slate-50 p-6 rounded-2xl">
                                    {doctor.about || `Dr. ${doctor.full_name} is a highly skilled ${doctor.specialization || "Dermatologist"} dedicated to providing exceptional patient care. With a focus on early detection and innovative treatments, they have successfully helped numerous patients achieve healthier skin. Book a consultation today to receive expert medical advice tailored to your needs.`}
                                </p>
                            </div>

                            <div className="flex justify-end pt-6 border-t border-gray-100">
                                <Link
                                    href={`/doctors?book_id=${doctor._id}`}
                                    className="bg-[#0284c7] hover:bg-[#0369a1] text-white px-8 py-3.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40"
                                >
                                    <Calendar className="w-5 h-5" /> Schedule an Appointment
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
