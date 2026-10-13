"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X, Activity } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    // Check initial auth state
    const token = localStorage.getItem("dermai_token");
    setIsLoggedIn(!!token);

    // Provide a way to update auth state from other components if needed
    const checkAuth = () => setIsLoggedIn(!!localStorage.getItem("dermai_token"));
    window.addEventListener("storage", checkAuth);
    // Custom event for same-page login updates
    window.addEventListener("auth_change", checkAuth);

    return () => {
      window.removeEventListener("storage", checkAuth);
      window.removeEventListener("auth_change", checkAuth);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("dermai_token");
    setIsLoggedIn(false);
    window.dispatchEvent(new Event("auth_change"));
    window.location.href = "/"; // Force redirect and reload
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <Activity className="h-8 w-8 text-[#0284c7]" />
              <span className="text-2xl font-bold text-[#0f172a]">Derma<span className="text-[#0284c7]">AI</span></span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-600 hover:text-[#0284c7] font-medium transition-colors">Home</Link>
            <Link href="/scan" className="text-gray-600 hover:text-[#0284c7] font-medium transition-colors">Analyze Skin</Link>
            {isLoggedIn && (
              <Link href="/dashboard" className="text-gray-600 hover:text-[#0284c7] font-medium transition-colors">Dashboard</Link>
            )}
            <Link href="/doctors" className="text-gray-600 hover:text-[#0284c7] font-medium transition-colors">Find Dermatologists</Link>

            {isLoggedIn ? (
              <button onClick={handleLogout} className="bg-red-50 text-red-600 px-5 py-2 rounded-lg font-medium hover:bg-red-100 transition-colors shadow-sm">
                Logout
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="text-[#0284c7] font-medium hover:text-[#0369a1] transition-colors">
                  Login
                </Link>
                <Link href="/register" className="bg-[#0284c7] text-white px-5 py-2 rounded-lg font-medium hover:bg-[#0369a1] transition-colors shadow-sm">
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center md:hidden">
            <button onClick={() => setIsOpen(!isOpen)} className="text-gray-600 hover:text-[#0284c7]">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 px-4 pt-2 pb-4 space-y-2 shadow-inner">
          <Link href="/" className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:text-[#0284c7] hover:bg-gray-50">Home</Link>
          <Link href="/scan" className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:text-[#0284c7] hover:bg-gray-50">Analyze Skin</Link>
          {isLoggedIn && (
            <Link href="/dashboard" className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:text-[#0284c7] hover:bg-gray-50">Dashboard</Link>
          )}
          <Link href="/doctors" className="block px-3 py-2 rounded-md font-medium text-gray-700 hover:text-[#0284c7] hover:bg-gray-50">Find Dermatologists</Link>

          {isLoggedIn ? (
            <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md font-medium text-red-600 hover:bg-red-50 mt-4">
              Logout
            </button>
          ) : (
            <div className="flex flex-col space-y-2 mt-4">
              <Link href="/login" className="block px-3 py-2 rounded-md font-medium text-[#0284c7] border border-[#0284c7] text-center">Login</Link>
              <Link href="/register" className="block px-3 py-2 rounded-md font-medium text-white bg-[#0284c7] hover:bg-[#0369a1] text-center">Sign Up</Link>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
