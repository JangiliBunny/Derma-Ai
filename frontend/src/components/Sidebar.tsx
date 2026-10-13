import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, Calendar, Activity, Search, Shield, LogOut, Video } from 'lucide-react';
import { getApiUrl } from '@/lib/api';

export default function Sidebar({ role, onLogout }: { role?: string, onLogout?: () => void }) {
    const pathname = usePathname();
    const [pendingCount, setPendingCount] = useState<number>(0);

    useEffect(() => {
        const fetchPendingBadge = async () => {
            if (role !== 'doctor') return;
            const token = localStorage.getItem("dermai_token");
            if (!token) return;
            try {
                const res = await fetch(getApiUrl("/api/appointments/my-appointments"), {
                    headers: { "Authorization": `Bearer ${token}` }
                });
                if (res.ok) {
                    const appts = await res.json();
                    const pending = appts.filter((a: any) => a.status === "Pending").length;
                    setPendingCount(pending);
                }
            } catch (e) {
                // Ignore silently
            }
        };
        fetchPendingBadge();
    }, [role, pathname]);

    let navigation: Array<{ name: string; href: string; icon: any; badge?: number }> = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'My Profile', href: '/dashboard/profile', icon: User },
    ];

    if (role === 'doctor') {
        navigation.push({ name: 'Video Appointments', href: '/dashboard/appointments', icon: Video, badge: pendingCount });
    } else if (role === 'admin') {
        navigation.push({ name: 'Admin Panel', href: '/admin', icon: Shield });
    } else {
        // Patient
        navigation.push({ name: 'New Scan', href: '/scan', icon: Activity });
        navigation.push({ name: 'Find Doctors', href: '/dashboard/doctors', icon: Search });
        navigation.push({ name: 'My Appointments', href: '/dashboard/appointments', icon: Calendar });
    }

    return (
        <div className="w-64 bg-white border-r border-gray-100 flex flex-col h-full min-h-screen sticky top-0">
            <div className="p-6 border-b border-gray-100 flex items-center justify-center">
                <Link href="/" className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#0284c7] to-teal-400 flex items-center justify-center text-white font-bold text-lg shadow-md shadow-blue-500/20">
                        D
                    </div>
                    <span className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
                        DermaAI
                    </span>
                </Link>
            </div>

            <nav className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-4">
                <p className="px-4 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Main Menu</p>
                {navigation.map((item: any) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                        <Link
                            key={item.name}
                            href={item.href}
                            className={`flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all ${isActive
                                ? "bg-blue-50 text-[#0284c7] shadow-sm border border-blue-100/50"
                                : "text-slate-500 hover:bg-gray-50 hover:text-slate-800"
                                }`}
                        >
                            <div className="flex items-center">
                                <Icon className={`mr-3 h-5 w-5 ${isActive ? "text-[#0284c7]" : "text-slate-400"}`} />
                                {item.name}
                            </div>
                            {item.badge !== undefined && item.badge > 0 && (
                                <span className="bg-rose-500 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse">
                                    {item.badge}
                                </span>
                            )}
                        </Link>
                    )
                })}
            </nav>

            <div className="p-4 border-t border-gray-100">
                <button
                    onClick={onLogout}
                    className="flex items-center w-full px-4 py-3 text-sm font-medium text-red-500 rounded-xl hover:bg-red-50 transition-colors"
                >
                    <LogOut className="mr-3 h-5 w-5" />
                    Logout
                </button>
            </div>
        </div>
    );
}

