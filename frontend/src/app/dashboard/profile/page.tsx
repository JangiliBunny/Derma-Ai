"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import ProfileEditForm from "@/components/ProfileEditForm";

export default function ProfilePage() {
    const [role, setRole] = useState<"patient" | "doctor">("patient");

    useEffect(() => {
        const token = localStorage.getItem("dermai_token");
        if (!token) return;
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setRole(payload.role || "patient");
        } catch {
            setRole("patient");
        }
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0 hidden md:block">
                <Sidebar role={role} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full overflow-y-auto">
                <div className="mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">My Profile Settings</h1>
                    <p className="text-slate-500">Manage your personal information, contact details, and account preferences.</p>
                </div>

                <ProfileEditForm />
            </div>
        </div>
    );
}
