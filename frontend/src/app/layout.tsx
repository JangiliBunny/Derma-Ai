import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "DermAI - Intelligent Skin Disease Detection",
  description: "AI-powered skin disease detection and analysis platform for doctors and patients.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col font-sans`}>
        <Navbar />
        <main className="flex-1">
          {children}
        </main>

        {/* Floating Chatbot Button */}
        <div className="fixed bottom-6 right-6 z-50">
          <a href="/chat" className="flex items-center justify-center w-14 h-14 bg-[#0284c7] text-white rounded-full shadow-2xl hover:bg-[#0369a1] hover:scale-110 transition-all transform group">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
            <span className="absolute right-16 px-3 py-1 bg-gray-900 text-white text-xs font-semibold rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity">
              Ask AI Assistant
            </span>
          </a>
        </div>
      </body>
    </html>
  );
}
