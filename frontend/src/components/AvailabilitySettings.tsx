import React, { useState } from 'react';
import { Clock, CalendarDays, Video, Users, CheckCircle, Save } from 'lucide-react';

export default function AvailabilitySettings({ profile, onSave }: { profile: any, onSave: (data: any) => void }) {
    const daysOfWeek = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

    // Default to a 9-5 schedule if no profile data exists yet
    const [availableDays, setAvailableDays] = useState<string[]>(profile?.available_days || ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]);
    const [workingHours, setWorkingHours] = useState(profile?.working_hours || "09:00 AM - 05:00 PM");
    const [maxAppointments, setMaxAppointments] = useState(profile?.max_appointments_per_day || 15);
    const [onlineEnabled, setOnlineEnabled] = useState(profile?.online_consultation_enabled ?? true);
    const [isSaving, setIsSaving] = useState(false);

    const toggleDay = (day: string) => {
        if (availableDays.includes(day)) {
            setAvailableDays(availableDays.filter(d => d !== day));
        } else {
            setAvailableDays([...availableDays, day]);
        }
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await onSave({
                available_days: availableDays,
                working_hours: workingHours,
                max_appointments_per_day: maxAppointments,
                online_consultation_enabled: onlineEnabled
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm col-span-1 lg:col-span-2">
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-xl font-bold text-slate-800">Availability & Settings</h2>
                    <p className="text-slate-500 text-sm mt-1">Configure when you are available for patient consultations.</p>
                </div>
            </div>

            <div className="space-y-8">
                {/* Working Days */}
                <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-3 flex items-center gap-2">
                        <CalendarDays className="w-4 h-4 text-[#0284c7]" /> Available Working Days
                    </label>
                    <div className="flex flex-wrap gap-3">
                        {daysOfWeek.map(day => {
                            const isSelected = availableDays.includes(day);
                            return (
                                <button
                                    key={day}
                                    onClick={() => toggleDay(day)}
                                    className={`px-4 py-2 rounded-xl text-sm font-medium transition-all border ${isSelected ? 'bg-blue-50 text-[#0284c7] border-blue-200 shadow-sm' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'}`}
                                >
                                    {isSelected && <CheckCircle className="w-3.5 h-3.5 inline mr-1.5" />}
                                    {day}
                                </button>
                            );
                        })}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Working Hours */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                            <Clock className="w-4 h-4 text-[#0284c7]" /> Standard Operating Hours
                        </label>
                        <select
                            className="w-full border border-gray-200 rounded-xl px-4 py-3 bg-slate-50 focus:ring-2 focus:ring-[#0284c7] focus:border-transparent outline-none transition-all text-slate-700"
                            value={workingHours}
                            onChange={(e) => setWorkingHours(e.target.value)}
                        >
                            <option value="09:00 AM - 05:00 PM">09:00 AM - 05:00 PM</option>
                            <option value="10:00 AM - 06:00 PM">10:00 AM - 06:00 PM</option>
                            <option value="08:00 AM - 04:00 PM">08:00 AM - 04:00 PM</option>
                            <option value="12:00 PM - 08:00 PM">12:00 PM - 08:00 PM</option>
                        </select>
                    </div>

                    {/* Max Appointments */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                            <Users className="w-4 h-4 text-[#0284c7]" /> Daily Appointment Limit
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="number"
                                className="w-24 border border-gray-200 rounded-xl px-4 py-3 bg-slate-50 text-center focus:ring-2 focus:ring-[#0284c7] focus:border-transparent outline-none text-slate-700 font-bold"
                                value={maxAppointments}
                                min="1"
                                max="50"
                                onChange={(e) => setMaxAppointments(parseInt(e.target.value))}
                            />
                            <span className="text-sm font-medium text-slate-500">patients per day</span>
                        </div>
                    </div>
                </div>

                {/* Settings Toggles */}
                <div className="pt-6 border-t border-gray-100 flex items-center justify-between">
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 mb-1 flex items-center gap-2">
                            <Video className="w-4 h-4 text-[#0284c7]" /> Online Consultations
                        </label>
                        <p className="text-xs text-slate-500">Allow patients to book remote video sessions.</p>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={onlineEnabled} onChange={() => setOnlineEnabled(!onlineEnabled)} />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0284c7]"></div>
                    </label>
                </div>

                <div className="pt-6 flex justify-end">
                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 disabled:opacity-50 transition-colors flex items-center gap-2"
                    >
                        {isSaving ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                            <><Save className="w-4 h-4" /> Save Schedule</>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}
