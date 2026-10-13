import React, { useState, useEffect } from 'react';
import { User, Mail, Phone, MapPin, Activity, Award, Briefcase, Camera } from 'lucide-react';
import AvailabilitySettings from './AvailabilitySettings';
import { getApiUrl } from '@/lib/api';

export default function ProfileEditForm() {
    const [profile, setProfile] = useState<any>(null);
    const [role, setRole] = useState<"patient" | "doctor">("patient");
    const [formData, setFormData] = useState<any>({});
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState({ text: "", type: "" });

    useEffect(() => {
        const fetchProfile = async () => {
            const token = localStorage.getItem("dermai_token");
            if (!token) return;
            try {
                const res = await fetch(getApiUrl("/api/auth/me"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    setProfile(data);
                    setFormData(data);
                    setRole(data.role === "doctor" ? "doctor" : "patient");
                }
            } catch (e) {
                console.error("Failed to fetch profile", e);
            }
        };
        fetchProfile();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async (extraData: any = {}) => {
        setIsSaving(true);
        const token = localStorage.getItem("dermai_token");
        if (!token) return;

        const payload = { ...formData, ...extraData };

        try {
            const res = await fetch(getApiUrl("/api/auth/me"), {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
            });
            if (res.ok) {
                const updated = await res.json();
                setProfile(updated);
                setFormData(updated);
                showMessage("Profile updated successfully!", "success");
            } else {
                showMessage("Failed to update profile.", "error");
            }
        } catch (e) {
            showMessage("An network error occurred.", "error");
        } finally {
            setIsSaving(false);
        }
    };

    const showMessage = (text: string, type: string) => {
        setMessage({ text, type });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    };

    if (!profile) return <div className="animate-pulse flex space-x-4"><div className="flex-1 space-y-4 py-1"><div className="h-4 bg-slate-200 rounded w-3/4"></div></div></div>;

    return (
        <div className="space-y-6 max-w-5xl">
            {message.text && (
                <div className={`p-4 rounded-xl text-sm font-medium animate-in slide-in-from-top-2 ${message.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
                    {message.text}
                </div>
            )}

            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-8 items-start">
                {/* Avatar Section */}
                <div className="flex flex-col items-center gap-4">
                    <div className="relative group cursor-pointer">
                        <img
                            src={profile.profile_image || `https://ui-avatars.com/api/?name=${profile.full_name}&background=0284c7&color=fff&size=150`}
                            alt="Profile"
                            className="w-32 h-32 rounded-full object-cover border-4 border-slate-50 shadow-sm"
                        />
                        <div className="absolute inset-0 bg-slate-900/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera className="w-8 h-8 text-white" />
                        </div>
                    </div>
                    <button className="text-sm font-medium text-[#0284c7] hover:underline">Change Photo</button>
                </div>

                {/* Main Form Fields */}
                <div className="flex-1 w-full space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                <User className="w-4 h-4 text-slate-400" /> Full Name
                            </label>
                            <input name="full_name" value={formData.full_name || ""} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0284c7] focus:border-transparent outline-none transition-all" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                <Mail className="w-4 h-4 text-slate-400" /> Email Address
                            </label>
                            <input disabled value={profile.email} className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-slate-50 text-slate-500 cursor-not-allowed" />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                <Phone className="w-4 h-4 text-slate-400" /> Phone Number
                            </label>
                            <input name="mobile_number" value={formData.mobile_number || ""} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0284c7] focus:border-transparent outline-none transition-all" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Age</label>
                                <input type="number" name="age" value={formData.age || ""} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0284c7] focus:border-transparent outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Gender</label>
                                <select name="gender" value={formData.gender || ""} onChange={(e) => setFormData({ ...formData, gender: e.target.value })} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0284c7] focus:border-transparent outline-none transition-all bg-white">
                                    <option value="">Select</option>
                                    <option value="Male">Male</option>
                                    <option value="Female">Female</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Role Specific Fields */}
                    {role === "patient" && (
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                <Activity className="w-4 h-4 text-slate-400" /> Medical History
                            </label>
                            <textarea name="medical_history" value={formData.medical_history || ""} onChange={handleChange} rows={4} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0284c7] focus:border-transparent outline-none transition-all placeholder:text-gray-400" placeholder="List any known allergies, previous skin conditions, or current medications..." />
                        </div>
                    )}

                    {role === "doctor" && (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Award className="w-4 h-4 text-slate-400" /> Specialization
                                    </label>
                                    <input name="specialization" value={formData.specialization || ""} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0284c7] focus:border-transparent outline-none transition-all" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                        <Briefcase className="w-4 h-4 text-slate-400" /> Experience (Years)
                                    </label>
                                    <input type="number" name="experience" value={formData.experience || ""} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0284c7] focus:border-transparent outline-none transition-all" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2">
                                    <MapPin className="w-4 h-4 text-slate-400" /> Clinic / Hospital Name
                                </label>
                                <input name="hospital_name" value={formData.hospital_name || ""} onChange={handleChange} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0284c7] focus:border-transparent outline-none transition-all" />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-slate-700 mb-2">Short Biography</label>
                                <textarea name="bio" value={formData.bio || ""} onChange={handleChange} rows={3} className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0284c7] focus:border-transparent outline-none transition-all placeholder:text-gray-400" placeholder="Describe your background and expertise..." />
                            </div>
                        </>
                    )}

                    <div className="flex justify-end pt-4">
                        <button
                            onClick={() => handleSave()}
                            disabled={isSaving}
                            className="bg-[#0284c7] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0369a1] disabled:opacity-50 transition-colors shadow-sm"
                        >
                            {isSaving ? "Saving..." : "Save Profile Details"}
                        </button>
                    </div>
                </div>
            </div>

            {/* If doctor, show the dynamic Availability Settings block below the profile */}
            {role === "doctor" && (
                <AvailabilitySettings profile={profile} onSave={handleSave} />
            )}
        </div>
    );
}
