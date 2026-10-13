"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Activity, Users, FileText, TrendingUp, Calendar, ArrowRight, AlertCircle, Video } from "lucide-react";
import { getApiUrl, API_BASE_URL } from "@/lib/api";
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend,
    ArcElement,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

import Sidebar from "@/components/Sidebar";
import PatientProfileHeader from "@/components/PatientProfileHeader";
import HealthMetricsCards from "@/components/HealthMetricsCards";
import { RecentScansTable, DiseaseHistoryTable } from "@/components/ScanTables";
import DoctorAssignmentCard from "@/components/DoctorAssignmentCard";
import AITimelineChart from "@/components/AITimelineChart";

import DoctorProfileHeader from "@/components/DoctorProfileHeader";
import DoctorBio from "@/components/DoctorBio";
import DoctorServicesAndSocials from "@/components/DoctorServicesAndSocials";
import AboutDoctorCard from "@/components/AboutDoctorCard";
import AIDiagnosedCasesTable from "@/components/AIDiagnosedCasesTable";
import DoctorAnalyticsCards from "@/components/DoctorAnalyticsCards";

ChartJS.register(
    CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Title, Tooltip, Legend
);

export default function DashboardPage() {
    const router = useRouter();
    const [role, setRole] = useState<string | null>(null);

    useEffect(() => {
        const token = localStorage.getItem("dermai_token");
        if (!token) {
            router.push("/login");
            return;
        }

        // Simple JWT decode for role
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            setRole(payload.role || "patient");
        } catch {
            setRole("patient");
        }
    }, [router]);

    const handleLogout = () => {
        localStorage.removeItem("dermai_token");
        window.dispatchEvent(new Event("auth_change"));
        router.push("/");
    };

    if (!role) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

    return (
        <div className="min-h-screen bg-slate-50 flex">
            {/* Sidebar */}
            <Sidebar onLogout={handleLogout} />

            {/* Main Content Area */}
            <div className="flex-1 overflow-x-hidden">
                <div className="p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">
                            {role === 'doctor' ? 'Clinical Dashboard' : 'Patient Portal'}
                        </h1>
                        <p className="text-gray-500 mt-1">Welcome back. Here is your overview.</p>
                    </div>

                    {role === 'doctor' ? <DoctorDashboard /> : <PatientDashboard />}
                </div>
            </div>
        </div>
    );
}

function UpcomingConsultationsWidget({ role }: { role: "patient" | "doctor" }) {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAppointments = async () => {
            const token = localStorage.getItem("dermai_token");
            if (!token) return;
            try {
                const res = await fetch(getApiUrl("/api/appointments/my-appointments"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const data = await res.json();
                    const approvedOnline = data.filter((a: any) => a.status === "Approved" && a.consultation_type === "Online" && a.meet_url);
                    setAppointments(approvedOnline);
                }
            } catch (e) {
                console.error("Failed to fetch upcoming consultations", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAppointments();
    }, []);

    if (isLoading || appointments.length === 0) return null;

    return (
        <div className="bg-gradient-to-r from-sky-900 via-slate-900 to-indigo-950 rounded-3xl p-6 text-white shadow-xl mb-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-sky-500/10 rounded-full blur-2xl"></div>
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-sky-500/20 backdrop-blur-md flex items-center justify-center text-sky-400 border border-sky-400/30">
                        <Calendar className="w-6 h-6" />
                    </div>
                    <div>
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold mb-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Upcoming Video Consultation
                        </div>
                        <h3 className="text-lg font-bold text-white">
                            {role === 'doctor' ? `Session with ${appointments[0].patient_name || 'Patient'}` : `Session with ${appointments[0].doctor_name || 'Doctor'}`}
                        </h3>
                        <p className="text-xs text-slate-300 flex items-center gap-3 mt-1">
                            <span>📅 {appointments[0].date}</span>
                            <span>⏰ {appointments[0].time} {appointments[0].end_time ? `- ${appointments[0].end_time}` : ''}</span>
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href={appointments[0].meet_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all hover:scale-105 active:scale-95 flex items-center gap-2"
                    >
                        Join Consultation <ArrowRight className="w-4 h-4" />
                    </a>
                </div>
            </div>
        </div>
    );
}

function PatientDashboard() {
    const [scans, setScans] = useState<any[]>([]);
    const [profile, setProfile] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isServerError, setIsServerError] = useState(false);

    const fetchData = async () => {
        const token = localStorage.getItem("dermai_token");
        if (!token) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setIsServerError(false);

        try {
            // Fetch Profile
            const profileRes = await fetch(getApiUrl("/api/auth/me"), {
                headers: { "Authorization": `Bearer ${token}` }
            }).catch(() => null);

            if (profileRes && profileRes.ok) {
                setProfile(await profileRes.json());
            }

            // Fetch History
            const historyRes = await fetch(getApiUrl("/api/predictions/history"), {
                headers: { "Authorization": `Bearer ${token}` }
            }).catch(() => null);

            if (historyRes && historyRes.ok) {
                const historyData = await historyRes.json();
                setScans(historyData.reverse());
            } else if (!profileRes || !profileRes.ok) {
                setIsServerError(true);
            }
        } catch (e) {
            setIsServerError(true);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) return <div className="py-12 text-center text-slate-500 font-medium">Loading patient dashboard...</div>;

    const latestScan = scans.length > 0 ? scans[0] : null;
    const lastConfidence = latestScan?.prediction?.confidence ? Math.round(latestScan.prediction.confidence) : undefined;
    const docAssignment = latestScan?.doctor_id ? {
        name: `Dr. ${latestScan.doctor_id}`,
        specialization: "Dermatologist",
        experience: "Expert",
        rating: "4.9",
        hospital: "Primary Care",
        email: "contact@clinic.com",
        contact: "+1 234 567 8900",
        online_consultation: true,
    } : undefined;

    return (
        <div className="space-y-6">
            {isServerError && (
                <div className="p-4 bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl text-xs flex justify-between items-center shadow-xs">
                    <span>⚠️ DermaAI Backend is starting or temporarily offline at <code>{API_BASE_URL}</code>.</span>
                    <button onClick={fetchData} className="px-3 py-1 bg-amber-600 text-white rounded-lg font-bold hover:bg-amber-700 transition-colors">Retry Connection</button>
                </div>
            )}
            <UpcomingConsultationsWidget role="patient" />
            <PatientProfileHeader profile={{ ...profile, appointments_count: scans.length }} />

            <HealthMetricsCards profile={profile} lastScanConfidence={lastConfidence} />

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                <div className="xl:col-span-2 space-y-6">
                    <AITimelineChart scans={scans} />
                    <RecentScansTable scans={scans.slice(0, 5)} />
                    <DiseaseHistoryTable scans={scans} />
                </div>

                <div className="xl:col-span-1 space-y-6">
                    <DoctorAssignmentCard doctor={docAssignment} />
                </div>
            </div>
        </div>
    );
}


function DoctorAppointmentAlerts() {
    const [appointments, setAppointments] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAppts = async () => {
            const token = localStorage.getItem("dermai_token");
            if (!token) return;
            try {
                const res = await fetch(getApiUrl("/api/appointments/my-appointments"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    setAppointments(await res.json());
                }
            } catch (e) {
                console.error("Failed to fetch appointment alerts", e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchAppts();
    }, []);

    if (isLoading) return null;

    const todayStr = new Date().toISOString().split('T')[0];

    const pendingRequests = appointments.filter(a => a.status === "Pending");
    const todayAppointments = appointments.filter(a => a.date === todayStr && (a.status === "Pending" || a.status === "Approved"));
    const upcomingVideoConsults = appointments.filter(a => a.status === "Approved" && a.consultation_type === "Online" && a.meet_url);

    // Latest 3-5 active alerts
    const activeAlerts = [...pendingRequests, ...appointments.filter(a => a.status === "Approved")]
        .filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)
        .slice(0, 4);

    return (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6 space-y-6">
            {/* Header & Stats Grid */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-gray-100 pb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center relative">
                        <Activity className="w-5 h-5" />
                        {pendingRequests.length > 0 && (
                            <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-500 rounded-full ring-2 ring-white animate-ping"></span>
                        )}
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                            Appointment Alerts
                            {pendingRequests.length > 0 && (
                                <span className="bg-rose-100 text-rose-700 text-xs font-extrabold px-2.5 py-0.5 rounded-full">
                                    {pendingRequests.length} New
                                </span>
                            )}
                        </h2>
                        <p className="text-xs text-slate-500">Live summary of incoming consultation requests and today's schedule</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href="/dashboard/appointments"
                        className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                    >
                        View All Appointments <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                </div>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-amber-50/60 border border-amber-100 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-amber-800">Pending Requests</p>
                        <p className="text-2xl font-extrabold text-amber-900 mt-0.5">{pendingRequests.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-sm">
                        ⏳
                    </div>
                </div>

                <div className="bg-blue-50/60 border border-blue-100 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-blue-800">Scheduled Today</p>
                        <p className="text-2xl font-extrabold text-blue-900 mt-0.5">{todayAppointments.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                        <Calendar className="w-5 h-5" />
                    </div>
                </div>

                <div className="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 flex items-center justify-between">
                    <div>
                        <p className="text-xs font-semibold text-emerald-800">Upcoming Video Consults</p>
                        <p className="text-2xl font-extrabold text-emerald-900 mt-0.5">{upcomingVideoConsults.length}</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                        <Video className="w-5 h-5" />
                    </div>
                </div>
            </div>

            {/* Recent Alerts List */}
            {activeAlerts.length === 0 ? (
                <div className="py-6 text-center text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-gray-200">
                    <p className="text-sm font-medium">All caught up! You have no active appointment alerts right now.</p>
                </div>
            ) : (
                <div className="space-y-3">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Recent Alerts & Requests</p>
                    <div className="grid grid-cols-1 gap-2.5">
                        {activeAlerts.map(app => (
                            <div key={app.id || app._id} className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 bg-slate-50 hover:bg-slate-100/80 rounded-2xl border border-slate-100 transition-colors gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-sky-600 text-white font-bold text-xs flex items-center justify-center flex-shrink-0">
                                        {(app.patient_name || app.patient_id).substring(0, 2).toUpperCase()}
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-bold text-slate-900">{app.patient_name || `Patient ${app.patient_id.substring(0, 6)}`}</h4>
                                        <p className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                                            <span>📅 {app.date} at {app.time}</span>
                                            <span>&bull;</span>
                                            <span className="font-medium text-slate-700">{app.consultation_type === 'Online' ? '🎥 Video' : '🏥 Clinic'}</span>
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between sm:justify-end gap-3">
                                    <span className={`px-3 py-1 text-[11px] font-bold rounded-full border ${
                                        app.status === 'Pending' ? 'bg-amber-100 text-amber-800 border-amber-200' : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                                    }`}>
                                        {app.status === 'Pending' ? 'Pending Approval' : 'Confirmed'}
                                    </span>
                                    <Link
                                        href="/dashboard/appointments"
                                        className="text-xs font-bold text-[#0284c7] hover:underline"
                                    >
                                        Manage &rarr;
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

function DoctorDashboard() {
    const [profile, setProfile] = useState<any>(null);
    const [cases, setCases] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const fetchData = async () => {
        const token = localStorage.getItem("dermai_token");
        if (!token) return;

        try {
            // Fetch Doctor Profile
            const profileRes = await fetch(getApiUrl("/api/auth/me"), {
                headers: { "Authorization": `Bearer ${token}` }
            }).catch(() => null);
            if (profileRes && profileRes.ok) {
                setProfile(await profileRes.json());
            }

            // Fetch assigned cases
            const casesRes = await fetch(getApiUrl("/api/predictions/history"), {
                headers: { "Authorization": `Bearer ${token}` }
            }).catch(() => null);
            if (casesRes && casesRes.ok) {
                const casesData = await casesRes.json();
                setCases(casesData.reverse().slice(0, 8)); // Mock assigned cases
            }
        } catch (e) {
            // Ignore fetch network errors silently
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    if (isLoading) return <div className="py-12 text-center text-gray-500">Loading Clinical Dashboard...</div>;

    return (
        <div className="space-y-6">
            <DoctorAppointmentAlerts />
            <DoctorProfileHeader profile={profile} />

            <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
                <div className="xl:col-span-2 space-y-6 flex flex-col">
                    <DoctorBio profile={profile} />
                </div>

                <div className="xl:col-span-1 space-y-6 flex flex-col">
                    <DoctorServicesAndSocials profile={profile} />
                </div>

                <div className="xl:col-span-1 space-y-6 flex flex-col">
                    <AboutDoctorCard profile={profile} />
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <AIDiagnosedCasesTable cases={cases} />
                <DoctorAnalyticsCards cases={cases} />
            </div>
        </div>
    );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
    return (
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center">
            <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center mr-4">
                {icon}
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500">{title}</p>
                <p className="text-2xl font-bold text-slate-900">{value}</p>
            </div>
        </div>
    );
}
