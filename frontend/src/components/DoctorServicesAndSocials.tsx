import React from 'react';
import { Facebook, Instagram, Twitter, Linkedin, Phone } from 'lucide-react';

export default function DoctorServicesAndSocials({ profile }: { profile: any }) {
    if (!profile) return null;

    const defaultServices = [
        { name: "Skin Consultation", price: "$50" },
        { name: "Acne Treatment", price: "$80" },
        { name: "Psoriasis Therapy", price: "$120" },
        { name: "Mole Examination", price: "$70" }
    ];

    const services = profile.services?.length ? profile.services : defaultServices;

    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col h-full">
            <h2 className="text-lg font-bold text-slate-800 mb-4">Services & Pricing</h2>

            <div className="flex-1 space-y-3 mb-6">
                {services.map((service: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-50 last:border-0">
                        <span className="text-sm font-medium text-slate-700">{service.name}</span>
                        <span className="text-sm font-bold text-[#0284c7]">{service.price}</span>
                    </div>
                ))}
            </div>

            <button className="text-sm font-medium text-[#0284c7] hover:text-[#0369a1] mb-6 flex items-center transition-colors">
                Read More Services <svg className="w-4 h-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </button>

            <div className="mt-auto pt-6 border-t border-gray-100">
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Connect on Social</p>
                <div className="flex gap-3">
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-[#0284c7] hover:text-white transition-all shadow-sm">
                        <Facebook className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-pink-600 hover:text-white transition-all shadow-sm">
                        <Instagram className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-sky-500 hover:text-white transition-all shadow-sm">
                        <Twitter className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-blue-700 hover:text-white transition-all shadow-sm">
                        <Linkedin className="w-5 h-5" />
                    </a>
                    <a href="#" className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-500 hover:bg-green-500 hover:text-white transition-all shadow-sm">
                        {/* Using Phone icon for whatsapp alternative if no pure whatsapp icon exists in lucide standard */}
                        <Phone className="w-5 h-5" />
                    </a>
                </div>
            </div>
        </div>
    );
}
