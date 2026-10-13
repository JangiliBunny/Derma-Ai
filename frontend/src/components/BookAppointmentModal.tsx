import React, { useState, useEffect } from 'react';
import { X, Calendar, Clock, Image as ImageIcon, CheckCircle, ChevronDown } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

export default function BookAppointmentModal({ doctor, onClose }: { doctor: any, onClose: () => void }) {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        date: '',
        time: '',
        consultation_type: 'Online',
        reason: '',
        scan_image_url: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [scans, setScans] = useState<any[]>([]);
    const [isLoadingScans, setIsLoadingScans] = useState(false);

    useEffect(() => {
        const fetchScans = async () => {
            setIsLoadingScans(true);
            const token = localStorage.getItem("dermai_token");
            if (!token) {
                setIsLoadingScans(false);
                return;
            }
            try {
                const res = await fetch(getApiUrl("/api/predictions/history"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setScans(data);
                }
            } catch (e) {
                console.error("Failed to fetch scans", e);
            } finally {
                setIsLoadingScans(false);
            }
        };
        fetchScans();
    }, []);

    const availableTimes = ["09:00 AM", "10:30 AM", "11:00 AM", "02:00 PM", "03:30 PM", "04:00 PM"];

    const [bookingError, setBookingError] = useState<string | null>(null);

    const handleBook = async () => {
        setIsSubmitting(true);
        setBookingError(null);
        const token = localStorage.getItem("dermai_token");

        try {
            const res = await fetch(getApiUrl("/api/appointments/book"), {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    doctor_id: doctor._id || doctor.id,
                    ...formData
                })
            });

            if (res.ok) {
                setStep(3); // Success screen
            } else {
                const data = await res.json();
                setBookingError(data.detail || "Failed to book appointment. Please try again.");
            }
        } catch (error) {
            console.error("Booking error:", error);
            setBookingError("An error occurred while communicating with the server.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">

                {/* Header */}
                <div className="bg-gradient-to-r from-[#0284c7] to-[#0369a1] p-6 text-white relative flex items-center gap-4">
                    <img src={doctor.profile_image || "https://i.pravatar.cc/150"} alt={doctor.full_name} className="w-14 h-14 rounded-full border-2 border-white object-cover" />
                    <div>
                        <h2 className="text-xl font-bold">Book Visit</h2>
                        <p className="text-blue-100 text-sm">Dr. {doctor.full_name} &bull; {doctor.specialization || "Dermatologist"}</p>
                    </div>
                    <button onClick={onClose} className="absolute top-4 right-4 p-2 text-blue-100 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#0284c7]" /> Select Date
                                </label>
                                <input
                                    type="date"
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 focus:ring-2 focus:ring-[#0284c7] focus:border-transparent outline-none transition-all"
                                    value={formData.date}
                                    min={new Date().toISOString().split('T')[0]}
                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                />
                            </div>

                            {formData.date && (
                                <div className="animate-in slide-in-from-top-2">
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-[#0284c7]" /> Available Time Slots
                                    </label>
                                    <div className="grid grid-cols-3 gap-3">
                                        {availableTimes.map(time => (
                                            <button
                                                key={time}
                                                onClick={() => setFormData({ ...formData, time })}
                                                className={`py-2 rounded-xl text-sm font-medium transition-all ${formData.time === time ? 'bg-[#0284c7] text-white shadow-md' : 'bg-slate-50 text-slate-600 hover:bg-slate-100 border border-slate-200'}`}
                                            >
                                                {time}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Consultation Mode</label>
                                <div className="flex gap-4">
                                    <label className="flex-1 cursor-pointer">
                                        <input type="radio" name="mode" className="peer sr-only" checked={formData.consultation_type === 'Online'} onChange={() => setFormData({ ...formData, consultation_type: 'Online' })} />
                                        <div className="px-4 py-3 rounded-xl border border-gray-200 text-center peer-checked:border-[#0284c7] peer-checked:bg-blue-50 peer-checked:text-[#0284c7] font-medium transition-all">Video Consult</div>
                                    </label>
                                    <label className="flex-1 cursor-pointer">
                                        <input type="radio" name="mode" className="peer sr-only" checked={formData.consultation_type === 'Clinic'} onChange={() => setFormData({ ...formData, consultation_type: 'Clinic' })} />
                                        <div className="px-4 py-3 rounded-xl border border-gray-200 text-center peer-checked:border-[#0284c7] peer-checked:bg-blue-50 peer-checked:text-[#0284c7] font-medium transition-all">Clinic Visit</div>
                                    </label>
                                </div>
                            </div>

                            <button
                                disabled={!formData.date || !formData.time}
                                onClick={() => setStep(2)}
                                className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all mt-6"
                            >
                                Continue to Details
                            </button>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-6 animate-in slide-in-from-right-4">
                            {bookingError && (
                                <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium rounded-xl">
                                    {bookingError}
                                </div>
                            )}
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Reason for Visit / Symptoms</label>
                                <textarea
                                    className="w-full border border-gray-200 rounded-xl px-4 py-3 h-28 resize-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent outline-none transition-all placeholder:text-gray-400"
                                    placeholder="Briefly describe your skin concern..."
                                    value={formData.reason}
                                    onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                                ></textarea>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex justify-between items-center">
                                    <span>Attach AI Skin Scan <span className="text-gray-400 font-normal">(Optional)</span></span>
                                </label>
                                <div className="relative">
                                    <select
                                        className="w-full border border-gray-200 rounded-xl px-4 py-3 appearance-none focus:ring-2 focus:ring-[#0284c7] focus:border-transparent outline-none transition-all placeholder:text-gray-400 bg-white shadow-sm"
                                        value={formData.scan_image_url}
                                        onChange={(e) => setFormData({ ...formData, scan_image_url: e.target.value })}
                                        disabled={isLoadingScans}
                                    >
                                        <option value="">-- No report attached --</option>
                                        {scans.map((scan) => (
                                            <option key={scan.id || scan._id} value={scan.image_url}>
                                                {new Date(scan.created_at).toLocaleDateString()} - {scan.prediction?.disease_name} ({Math.round(scan.prediction?.confidence || 0)}%)
                                            </option>
                                        ))}
                                    </select>
                                    <div className="absolute inset-y-0 right-0 flex items-center pr-4 pointer-events-none text-slate-400">
                                        <ChevronDown className="w-5 h-5" />
                                    </div>
                                </div>
                                <p className="text-xs text-gray-500 mt-2 flex items-center gap-1.5"><ImageIcon className="w-3.5 h-3.5" /> Allows the doctor to review your scan alongside your request.</p>
                            </div>

                            <div className="flex gap-3 pt-4 border-t border-gray-100">
                                <button onClick={() => setStep(1)} className="px-6 py-3.5 rounded-xl font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors">
                                    Back
                                </button>
                                <button
                                    onClick={handleBook}
                                    disabled={!formData.reason || isSubmitting}
                                    className="flex-1 bg-[#0284c7] text-white rounded-xl py-3.5 font-bold hover:bg-[#0369a1] disabled:opacity-50 flex justify-center items-center gap-2 transition-colors shadow-lg shadow-blue-500/20"
                                >
                                    {isSubmitting ? (
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                    ) : (
                                        "Confirm Booking"
                                    )}
                                </button>
                            </div>
                        </div>
                    )}

                    {step === 3 && (
                        <div className="py-8 flex flex-col items-center justify-center text-center animate-in zoom-in">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
                                <CheckCircle className="w-10 h-10 text-green-500" />
                            </div>
                            <h3 className="text-2xl font-bold text-slate-800 mb-2">Request Sent!</h3>
                            <p className="text-slate-600 max-w-sm mb-8">
                                Your appointment request for <strong className="text-slate-900">{formData.date} at {formData.time}</strong> has been sent to Dr. {doctor.full_name}. You will be notified once it is approved.
                            </p>
                            <button
                                onClick={onClose}
                                className="w-full bg-slate-900 text-white rounded-xl py-3.5 font-bold hover:bg-slate-800 transition-colors"
                            >
                                Track in My Appointments
                            </button>
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
