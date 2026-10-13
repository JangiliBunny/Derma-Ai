import React, { useState } from 'react';
import { MapPin, Star, Calendar, ChevronRight } from 'lucide-react';
import BookAppointmentModal from './BookAppointmentModal';
import Link from 'next/link';

export default function DoctorListCard({ doctor }: { doctor: any }) {
    const [isBookingMode, setIsBookingMode] = useState(false);

    return (
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row gap-6 items-start transition-all hover:shadow-md">
            <div className="relative">
                <img
                    src={doctor.profile_image || "https://i.pravatar.cc/150?u=" + doctor._id}
                    alt={doctor.full_name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-slate-50"
                />
                {doctor.online_consultation_enabled !== false && (
                    <div className="absolute bottom-1 right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                )}
            </div>

            <div className="flex-1 w-full">
                <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                    <div>
                        <h3 className="text-xl font-bold text-slate-800">
                            Dr. {doctor.full_name}
                        </h3>
                        <p className="text-[#0284c7] font-medium text-sm mb-2">{doctor.specialization || "Dermatology Specialist"}</p>

                        <div className="flex flex-wrap gap-4 text-sm text-slate-600">
                            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                                <span className="font-semibold text-slate-800">{doctor.rating || '4.8'}</span>
                                <span className="text-xs">({doctor.patients_consulted || 0} reviews)</span>
                            </div>
                            <div className="flex items-center gap-1 bg-slate-50 px-2 py-1 rounded-md">
                                <MapPin className="w-4 h-4 text-slate-400" />
                                <span>{doctor.hospital_name || 'DERMA AI Virtual Clinic'}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-2 w-full md:w-auto">
                        <button
                            onClick={() => setIsBookingMode(true)}
                            className="w-full md:w-auto bg-[#0284c7] hover:bg-[#0369a1] text-white px-5 py-2.5 rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-sm"
                        >
                            <Calendar className="w-4 h-4" />
                            Book Appointment
                        </button>
                        <Link href={`/doctors/${doctor._id || doctor.id}`} className="w-full md:w-auto bg-slate-50 hover:bg-slate-100 text-slate-700 px-5 py-2.5 rounded-xl font-medium flex items-center justify-center gap-1 transition-colors border border-slate-200">
                            View Profile
                            <ChevronRight className="w-4 h-4" />
                        </Link>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex flex-wrap gap-2">
                    <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider mr-2 self-center">Experience</span>
                    <span className="px-3 py-1 bg-blue-50 text-blue-700 text-xs font-medium rounded-full border border-blue-100">
                        {doctor.experience || 5}+ Years
                    </span>
                    <span className="px-3 py-1 bg-teal-50 text-teal-700 text-xs font-medium rounded-full border border-teal-100">
                        {doctor.online_consultation_enabled !== false ? 'Video Consults' : 'In-Person Only'}
                    </span>
                </div>
            </div>

            {isBookingMode && (
                <BookAppointmentModal
                    doctor={doctor}
                    onClose={() => setIsBookingMode(false)}
                />
            )}
        </div>
    );
}
