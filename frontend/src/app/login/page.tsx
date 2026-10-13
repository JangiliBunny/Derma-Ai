"use client";
import { useState } from "react";
import Link from "next/link";
import { LogIn, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/api";

export default function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const router = useRouter();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const fd = new URLSearchParams();
            fd.append("username", email);
            fd.append("password", password);

            const res = await fetch(getApiUrl("/api/auth/token"), {
                method: "POST",
                headers: { "Content-Type": "application/x-www-form-urlencoded" },
                body: fd
            });

            if (!res.ok) {
                throw new Error("Invalid credentials");
            }

            const data = await res.json();
            localStorage.setItem("dermai_token", data.access_token);
            window.dispatchEvent(new Event("auth_change"));
            router.push("/dashboard");
        } catch (err: any) {
            setError(err.message);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="h-16 w-16 bg-[#0284c7] rounded-full flex items-center justify-center shadow-lg">
                        <LogIn className="h-8 w-8 text-white" />
                    </div>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">Sign in to DermaAI</h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Or{" "}
                    <Link href="/register" className="font-medium text-[#0284c7] hover:text-[#0369a1]">
                        create a new patient account
                    </Link>
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-xl sm:rounded-2xl sm:px-10 border border-gray-100">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        {error && (
                            <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Email address</label>
                            <div className="mt-1">
                                <input
                                    type="email" required
                                    value={email} onChange={(e) => setEmail(e.target.value)}
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0284c7] focus:border-[#0284c7] sm:text-sm transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700">Password</label>
                            <div className="mt-1">
                                <input
                                    type="password" required
                                    value={password} onChange={(e) => setPassword(e.target.value)}
                                    className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-xl shadow-sm placeholder-gray-400 focus:outline-none focus:ring-[#0284c7] focus:border-[#0284c7] sm:text-sm transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-xl shadow-sm text-sm font-medium text-white bg-[#0284c7] hover:bg-[#0369a1] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#0284c7] transition-all"
                            >
                                Sign in <ArrowRight className="ml-2 h-4 w-4" />
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
