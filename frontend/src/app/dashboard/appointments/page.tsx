"use client";

import React, { useState, useEffect } from 'react';
import Sidebar from "@/components/Sidebar";
import AppointmentsTable from "@/components/AppointmentsTable";
import { getApiUrl } from "@/lib/api";

export default function AppointmentsPage() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [role, setRole] = useState<"patient" | "doctor">("patient");
    const [filter, setFilter] = useState("All");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        fetchAppointments();
    }, []);

    const fetchAppointments = async () => {
        setIsLoading(true);
        const token = localStorage.getItem("dermai_token");
        if (!token) return;

        try {
            // First determine role and fetch appointments
            const profileRes = await fetch(getApiUrl("/api/auth/me"), {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (profileRes.ok) {
                const profileData = await profileRes.json();
                setRole(profileData.role === "doctor" ? "doctor" : "patient");
            }

            const apptRes = await fetch(getApiUrl("/api/appointments/my-appointments"), {
                headers: { "Authorization": `Bearer ${token}` }
            });

            if (apptRes.ok) {
                setAppointments(await apptRes.json());
            }
        } catch (error) {
            console.error("Failed to fetch appointments:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleStatusChange = async (appId: string, newStatus: string, meetUrl?: string) => {
        const token = localStorage.getItem("dermai_token");
        if (!token) return;
        setErrorMessage(null);

        try {
            const res = await fetch(getApiUrl(`/api/appointments/${appId}/status`), {
                method: "PUT",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    status: newStatus,
                    meet_url: meetUrl
                })
            });

            if (res.ok) {
                fetchAppointments();
            } else {
                const errData = await res.json();
                const detailMsg = errData.detail || "Failed to update appointment status";
                setErrorMessage(detailMsg);
                throw new Error(detailMsg);
            }
        } catch (error: any) {
            console.error("Error updating status:", error);
            if (!errorMessage) {
                setErrorMessage(error.message || "Error updating appointment status");
            }
            throw error;
        }
    };

    const handleCancelAppointment = async (appId: string) => {
        if (!confirm("Are you sure you want to cancel this appointment?")) return;

        const token = localStorage.getItem("dermai_token");
        if (!token) return;
        setErrorMessage(null);

        try {
            const res = await fetch(getApiUrl(`/api/appointments/${appId}/cancel`), {
                method: "POST",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });

            if (res.ok) {
                fetchAppointments();
            } else {
                const errData = await res.json();
                setErrorMessage(errData.detail || "Failed to cancel appointment");
            }
        } catch (error: any) {
            console.error("Error cancelling appointment:", error);
            setErrorMessage("Failed to cancel appointment");
        }
    };

    const todayStr = new Date().toISOString().split('T')[0];

    const filterCategories = [
        { id: "All", label: "All Appointments" },
        { id: "Pending", label: "Pending Requests" },
        { id: "Approved", label: "Approved" },
        { id: "Today", label: "Today's Consultations" },
        { id: "UpcomingVideo", label: "Upcoming Video" },
        { id: "Completed", label: "Completed" },
        { id: "CancelledOrRejected", label: "Cancelled / Rejected" },
    ];

    const getFilteredAppointments = () => {
        switch (filter) {
            case "Pending":
                return appointments.filter(a => a.status === "Pending");
            case "Approved":
                return appointments.filter(a => a.status === "Approved");
            case "Today":
                return appointments.filter(a => a.date === todayStr && (a.status === "Pending" || a.status === "Approved"));
            case "UpcomingVideo":
                return appointments.filter(a => a.status === "Approved" && a.consultation_type === "Online");
            case "Completed":
                return appointments.filter(a => a.status === "Completed");
            case "CancelledOrRejected":
                return appointments.filter(a => a.status === "Cancelled" || a.status === "Rejected");
            default:
                return appointments;
        }
    };

    const displayAppointments = getFilteredAppointments();

    const getCountForFilter = (catId: string) => {
        switch (catId) {
            case "Pending": return appointments.filter(a => a.status === "Pending").length;
            case "Approved": return appointments.filter(a => a.status === "Approved").length;
            case "Today": return appointments.filter(a => a.date === todayStr && (a.status === "Pending" || a.status === "Approved")).length;
            case "UpcomingVideo": return appointments.filter(a => a.status === "Approved" && a.consultation_type === "Online").length;
            case "Completed": return appointments.filter(a => a.status === "Completed").length;
            case "CancelledOrRejected": return appointments.filter(a => a.status === "Cancelled" || a.status === "Rejected").length;
            default: return appointments.length;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar Navigation */}
            <div className="w-64 flex-shrink-0 hidden md:block">
                <Sidebar role={role} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="mb-8 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-2">
                            {role === 'doctor' ? 'Video Consultations & Appointments' : 'My Appointments'}
                        </h1>
                        <p className="text-slate-500">
                            {role === 'doctor'
                                ? 'Manage patient requests, set Google Meet links, and conduct video sessions.'
                                : 'Track the status of your booked clinic visits and video sessions.'}
                        </p>
                    </div>
                </div>

                {errorMessage && (
                    <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex justify-between items-center animate-in fade-in">
                        <span>{errorMessage}</span>
                        <button onClick={() => setErrorMessage(null)} className="font-bold text-rose-600 hover:text-rose-900 text-xs">Dismiss</button>
                    </div>
                )}

                {/* Status Filter Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-4 mb-6 hide-scrollbar">
                    {filterCategories.map(cat => {
                        const count = getCountForFilter(cat.id);
                        const isActive = filter === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => setFilter(cat.id)}
                                className={`px-4 py-2.5 rounded-2xl text-xs font-semibold transition-all flex items-center gap-2 whitespace-nowrap ${
                                    isActive
                                        ? 'bg-slate-900 text-white shadow-md shadow-slate-900/10'
                                        : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100/60'
                                }`}
                            >
                                {cat.label}
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                                    isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-slate-100 text-slate-700'
                                }`}>
                                    {count}
                                </span>
                            </button>
                        );
                    })}
                </div>

                {/* Dynamic Table populated based on user role */}
                {isLoading ? (
                    <div className="flex justify-center items-center h-64 bg-white rounded-2xl border border-gray-100 shadow-sm">
                        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-[#0284c7]"></div>
                    </div>
                ) : (
                    <AppointmentsTable
                        appointments={displayAppointments}
                        role={role}
                        onStatusChange={handleStatusChange}
                        onCancelAppointment={handleCancelAppointment}
                    />
                )}
            </div>
        </div>
    );
}

