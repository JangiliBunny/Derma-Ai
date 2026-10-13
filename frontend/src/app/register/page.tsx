"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { UserPlus, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";

export default function RegisterPage() {
    const [formData, setFormData] = useState({ fullName: "", email: "", password: "", role: "patient" });
    const [error, setError] = useState("");
    const router = useRouter();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get("role") === "doctor") {
            setFormData(prev => ({ ...prev, role: "doctor" }));
        }
    }, []);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(getApiUrl("/api/auth/register"), {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    full_name: formData.fullName,
                    email: formData.email,
                    password: formData.password,
                    role: formData.role
                })
            });

            if (!res.ok) {
                const errData = await res.json();
                throw new Error(errData.detail || "Registration failed");
            }

            router.push("/login");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-teal-600 rounded-full flex items-center justify-center shadow-lg">
                        <UserPlus className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Create an account</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Already have an account?{" "}
                    <Link href="/login" className="font-medium text-teal-600 hover:text-teal-700">
                        Sign in here
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleRegister}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Full Name</label>
                            <div className="mt-1">
                                <input
                                    type="text" required
                                    value={formData.fullName} onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email address</label>
                            <div className="mt-1">
                                <input
                                    type="email" required
                                    value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1">
                                <input
                                    type="password" required
                                    value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Role</label>
                            <div className="mt-1">
                                <select
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                    className="block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                >
                                    <option value="patient">Patient</option>
                                    <option value="doctor">Doctor</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all"
                            >
                                Register Account <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
