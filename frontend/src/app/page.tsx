"use client";
import Link from 'next/link';
import { ShieldCheck, Upload, Activity, Stethoscope, ArrowRight, Dna } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#0284c7] via-[#0369a1] to-[#0f172a] text-white">
        {/* Background Patterns */}
        <div className="absolute inset-0 opacity-10">
          <svg className="absolute w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="medical-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M0 40 L40 0 H20 L0 20 Z" fill="currentColor" fillOpacity="0.5" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#medical-grid)" />
          </svg>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32 relative z-10 flex flex-col md:flex-row items-center">

          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="md:w-1/2 text-center md:text-left mb-12 md:mb-0"
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/20 mb-6 backdrop-blur-sm">
              <ShieldCheck className="w-5 h-5 text-teal-300" />
              <span className="text-sm font-medium tracking-wide">AI-Powered Dermatology</span>
            </div>

            <h1 className="text-5xl md:text-6xl font-extrabold leading-tight mb-6">
              Detect Skin Diseases <br />
              <span className="text-teal-300">With 99% Accuracy</span>
            </h1>

            <p className="text-lg md:text-xl text-blue-100 mb-8 max-w-2xl">
              Upload a dermatoscopic image and let our advanced deep learning models instantly analyze it for over 20 different skin conditions, including Melanoma and Basal Cell Carcinoma.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
              <Link href="/scan" className="inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-[#0284c7] bg-white rounded-xl shadow-xl hover:bg-gray-50 transition-all transform hover:-translate-y-1">
                <Upload className="mr-2 w-5 h-5" />
                Upload Scan Now
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="md:w-1/2 flex justify-center lg:justify-end"
          >
            <div className="relative w-full max-w-md">
              <div className="absolute inset-0 bg-teal-400 rounded-full filter blur-[100px] opacity-30 animate-pulse"></div>
              {/* Decorative scan element */}
              <div className="relative bg-white/10 p-4 rounded-2xl border border-white/20 backdrop-blur-md shadow-2xl">
                <div className="w-full h-64 bg-slate-800 rounded-xl overflow-hidden relative group">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Activity className="w-20 h-20 text-teal-400 opacity-50" />
                  </div>
                  {/* Scan line animation */}
                  <div className="absolute top-0 w-full h-1 bg-teal-400 shadow-[0_0_15px_bg-teal-400] animate-[scan_2s_ease-in-out_infinite]"></div>
                </div>

                <div className="mt-4 p-4 bg-white rounded-xl text-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold">Analysis Complete</span>
                    <span className="text-green-600 font-bold bg-green-100 px-2 py-1 rounded-md text-sm">98.5% Confidence</span>
                  </div>
                  <div className="space-y-2">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-teal-500 w-[98%]"></div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Benign Nevus</span>
                      <span>Detected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Disease Awareness Section */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Capable of Detecting 20+ Conditions</h2>
            <p className="text-lg text-slate-600 max-w-3xl mx-auto">
              Our AI is trained on thousands of clinically verified images to distinguish between various skin diseases with dermatologist-level accuracy.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Dna className="w-10 h-10 text-teal-600" />}
              title="Malignant Lesions"
              desc="Early detection of Melanoma, Basal Cell Carcinoma, and other critical skin cancers."
            />
            <FeatureCard
              icon={<Activity className="w-10 h-10 text-[#0284c7]" />}
              title="Common Conditions"
              desc="Accurate identification of Psoriasis, Eczema, Acne, Rosacea, and benign keratosis."
            />
            <FeatureCard
              icon={<Stethoscope className="w-10 h-10 text-sky-500" />}
              title="Instant Reports"
              desc="Generate detailed PDF medical reports including symptoms, causes, and treatment advice."
            />
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-20 bg-slate-50 border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-slate-900 mb-6">Are you a Dermatologist?</h2>
          <p className="text-lg text-slate-600 mb-8">
            Join our platform to manage your patients, verify AI predictions, and streamline your clinical workflow.
          </p>
          <Link href="/register?role=doctor" className="inline-flex items-center gap-2 px-8 py-3 text-lg font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800 transition-colors">
            Register as Doctor <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
  return (
    <div className="p-8 bg-slate-50 rounded-2xl border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1 group">
      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-slate-600 leading-relaxed">
        {desc}
      </p>
    </div>
  );
}
