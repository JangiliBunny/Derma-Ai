import React from 'react';
import { User, Star, MapPin, Mail, Phone, Video } from 'lucide-react';

export default function DoctorAssignmentCard({ doctor }: { doctor?: any }) {
    // For demo purposes, we will use mock data if a doctor is not explicitly assigned 
    // to match the requested UI, or render a placeholder if preferred.
    const doc = doctor || {
        name: "Dr. Rahul Sharma",
        specialization: "Dermatologist",
        experience: "10+ years experience",
        rating: "4.8",
        hospital: "SkinCare Clinic",
        email: "rahul.sharma@gmail.com",
        contact: "+91-9876543210",
        online_consultation: true,
        photoUrl: null
    };

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-blue-50/50 to-transparent">
                <h2 className="text-lg font-bold text-slate-800">Assigned Doctor</h2>
            </div>

            <div className="p-6">
                <div className="flex items-start gap-4 mb-6">
                    <div className="w-16 h-16 rounded-full bg-slate-100 border-2 border-white shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {doc.photoUrl ? (
                            <img src={doc.photoUrl} alt={doc.name} className="w-full h-full object-cover" />
                        ) : (
                            <User className="w-8 h-8 text-[#0284c7] opacity-60" />
                        )}
                    </div>
                    <div>
                        <h3 className="font-bold text-lg text-slate-800">{doc.name}</h3>
                        <p className="text-[#0284c7] font-medium text-sm">{doc.specialization}</p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-gray-500 font-medium">
                            <span>{doc.experience}</span>
                            <span className="flex items-center text-amber-500">
                                <Star className="w-3.5 h-3.5 fill-current mr-1" /> {doc.rating} Rating
                            </span>
                        </div>
                    </div>
                </div>

                <div className="space-y-3 mb-8">
                    <div className="flex items-center text-sm gap-3">
                        <div className="p-2 rounded-lg bg-gray-50 text-gray-500"><MapPin className="w-4 h-4" /></div>
                        <span className="text-slate-700 font-medium">{doc.hospital}</span>
                    </div>
                    <div className="flex items-center text-sm gap-3">
                        <div className="p-2 rounded-lg bg-gray-50 text-gray-500"><Mail className="w-4 h-4" /></div>
                        <span className="text-slate-700 font-medium">{doc.email}</span>
                    </div>
                    <div className="flex items-center text-sm gap-3">
                        <div className="p-2 rounded-lg bg-gray-50 text-gray-500"><Phone className="w-4 h-4" /></div>
                        <span className="text-slate-700 font-medium">{doc.contact}</span>
                    </div>
                    <div className="flex items-center text-sm gap-3">
                        <div className={`p-2 rounded-lg ${doc.online_consultation ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                            <Video className="w-4 h-4" />
                        </div>
                        <span className={`font-medium ${doc.online_consultation ? 'text-green-700' : 'text-gray-500'}`}>
                            Online Consultation: {doc.online_consultation ? 'Available' : 'Unavailable'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                    <button className="col-span-2 px-4 py-2.5 bg-[#0284c7] text-white rounded-xl font-medium hover:bg-[#0369a1] transition-colors shadow-sm shadow-blue-500/20 text-sm">
                        Book Appointment
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 text-slate-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm">
                        View Profile
                    </button>
                    <button className="px-4 py-2 bg-white border border-gray-200 text-slate-700 rounded-xl font-medium hover:bg-gray-50 transition-colors shadow-sm text-sm">
                        Chat
                    </button>
                </div>
            </div>
        </div>
    );
}
