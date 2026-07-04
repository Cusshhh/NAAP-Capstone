import { Head, Link } from '@inertiajs/react';
import {
  Award,
  CheckCircle,
  BookOpen,
  Users,
  TrendingUp,
  Star,
  FileText,
  ShieldCheck,
  ArrowRight
} from 'lucide-react';
import React from 'react';

// --- SHARED COMPONENTS ---
const Button = ({ className, variant = "default", size = "default", children, ...props }: any) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95";
  const variants = {
    default: "bg-[#193153] text-white hover:bg-[#193153]/90 shadow-md",
    accent: "bg-[#ffdd59] text-[#193153] hover:bg-[#193153] hover:text-[#ffdd59] shadow-lg transition-colors duration-300",
    outline: "border-2 border-[#193153] text-[#193153] hover:bg-[#193153] hover:text-[#ffdd59]",
  };
  const sizes = { default: "h-10 px-4 py-2 text-sm", lg: "h-12 rounded-md px-8 text-base" };
  return <button className={`${baseStyles} ${variants[variant as keyof typeof variants] || variants.default} ${sizes[size as keyof typeof sizes] || sizes.default} ${className}`} {...props}>{children}</button>;
};

const Card = ({ className, children }: any) => (
  <div className={`rounded-xl border border-gray-100 bg-white text-gray-900 shadow-sm ${className}`}>{children}</div>
);

// --- 4 PILLARS DATA ---
const PILLARS = [
  {
    icon: Users,
    title: "Recruitment, Selection & Placement",
    desc: "Merit-based hiring ensuring only the most qualified aviation professionals join our ranks.",
    status: "Level 2 Maturity"
  },
  {
    icon: BookOpen,
    title: "Learning & Development",
    desc: "Continuous capacity building through scholarships, trainings, and industry partnerships.",
    status: "Level 2 Maturity"
  },
  {
    icon: TrendingUp,
    title: "Performance Management",
    desc: "Data-driven performance reviews that align individual goals with the Academy's mission.",
    status: "Level 2 Maturity"
  },
  {
    icon: Star,
    title: "Rewards & Recognition",
    desc: "Recognizing excellence and service through a structured and transparent awards system.",
    status: "Level 2 Maturity"
  }
];

export default function CscPrimeHrm() {
  return (
    <>
      <Head title="CSC PRIME-HRM Level 2 - NAAP" />

      <div className="min-h-screen bg-gray-50 font-sans text-[#1b1b18]">

        {/* --- NAVIGATION --- */}
        <nav className="bg-[#193153] text-white sticky top-0 z-50 shadow-lg transition-colors">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <img src="/images/PhilSCA_Logo.png" alt="NAAP Logo" className="h-14 w-auto object-contain bg-white/10 rounded-full p-1" />
                </Link>
                <div className="flex flex-col">
                  <h1 className="font-bold text-3xl leading-none tracking-tight">NAAP Careers</h1>
                  <p className="text-sm text-blue-200 uppercase tracking-widest mt-1">National Aviation Academy of the Philippines</p>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-6">
                <Link href="/"><button className="text-lg font-semibold tracking-wide text-white hover:text-[#ffdd59] transition-colors bg-transparent">Home</button></Link>
                <Link href="/jobs"><button className="text-lg font-semibold tracking-wide text-white hover:text-[#ffdd59] transition-colors bg-transparent">Browse Job</button></Link>
                <Link href="/login"><button className="text-lg font-semibold tracking-wide text-white hover:text-[#ffdd59] transition-colors bg-transparent">Login/Register</button></Link>
              </div>
            </div>
          </div>
        </nav>

        {/* --- HERO SECTION WITH BACKGROUND IMAGE --- */}
        <div className="relative h-[600px] flex items-center overflow-hidden">

          {/* Background Image Layer */}
          <div className="absolute inset-0 z-0">
            <img
              src="/images/csc.png" // Make sure this file exists in public/images/
              alt="CSC and PhilSCA Hangar Background"
              className="w-full h-full object-cover object-center"
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-[#193153]/95 via-[#193153]/80 to-[#193153]/40" />
          </div>

          <div className="container mx-auto px-6 relative z-10 flex flex-col md:flex-row items-center gap-12 h-full">
            <div className="w-full md:w-1/2 text-center md:text-left text-white">
              <div className="inline-flex items-center gap-2 bg-[#ffdd59] text-[#193153] px-4 py-1.5 rounded-full text-sm font-bold mb-6 animate-fade-in-up">
                <Award className="w-4 h-4" /> Excellence in HR Management
              </div>
              <h1 className="text-5xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight drop-shadow-lg">
                CSC PRIME-HRM <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffdd59] to-orange-400">Level 2 Accredited</span>
              </h1>
              <p className="text-xl text-blue-50 mb-8 leading-relaxed drop-shadow-md font-light">
                The National Aviation Academy of the Philippines has achieved <strong>Process-Defined HR Management</strong> maturity. This guarantees fair, transparent, and efficient processes for all applicants and employees.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center md:justify-start">
                {/* UPDATE: Direct Link to /login with button styles */}
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center whitespace-nowrap font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95 bg-[#ffdd59] text-[#193153] hover:bg-[#193153] hover:text-[#ffdd59] shadow-lg duration-300 h-12 rounded-md px-8 text-base"
                >
                  Join a World-Class Team <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </div>
            </div>

            {/* Visual Badge/Certificate Representation - Hidden on smaller screens to show bg image better */}
            <div className="w-full md:w-1/2 hidden md:flex justify-center">
              <div className="relative w-80 h-80 bg-white/10 rounded-full flex items-center justify-center border-4 border-[#ffdd59]/30 shadow-2xl backdrop-blur-sm animate-pulse-slow">
                <div className="text-center">
                  <Award className="w-32 h-32 text-[#ffdd59] mx-auto mb-2" />
                  <h3 className="text-2xl font-bold text-white">Bronze Award</h3>
                  <p className="text-blue-200 uppercase tracking-widest text-sm">Maturity Level 2</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- THE 4 PILLARS GRID --- */}
        <section className="py-20 px-6 container mx-auto -mt-16 relative z-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {PILLARS.map((item, index) => (
              <Card key={index} className="p-8 border-t-4 border-t-orange-500 hover:-translate-y-2 transition-transform duration-300 shadow-xl">
                <div className="w-14 h-14 bg-orange-50 rounded-full flex items-center justify-center text-orange-600 mb-6">
                  <item.icon className="w-7 h-7" />
                </div>
                <h3 className="font-bold text-lg text-gray-900 mb-2 min-h-[56px]">{item.title}</h3>
                <div className="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full mb-4">
                  <CheckCircle className="w-3 h-3 inline mr-1" /> {item.status}
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{item.desc}</p>
              </Card>
            ))}
          </div>
        </section>

        {/* --- WHAT THIS MEANS FOR YOU --- */}
        <section className="bg-white py-20 px-6 border-t border-gray-100">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#193153]">What This Means For Applicants</h2>
              <p className="text-gray-600 mt-2">Why apply to a PRIME-HRM Level 2 Agency?</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
              <div className="flex gap-4 p-6 rounded-xl border border-gray-50 hover:shadow-md transition-all bg-blue-50/30">
                <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-[#193153]">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Merit & Fitness Only</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">Hiring is based strictly on qualifications. No "palakasan" system. Your skills matter most.</p>
                </div>
              </div>
              <div className="flex gap-4 p-6 rounded-xl border border-gray-50 hover:shadow-md transition-all bg-blue-50/30">
                <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-[#193153]">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Faster Processing</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">Our recruitment process is standardized and efficient, reducing waiting time for results.</p>
                </div>
              </div>
              <div className="flex gap-4 p-6 rounded-xl border border-gray-50 hover:shadow-md transition-all bg-blue-50/30">
                <div className="shrink-0 w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-[#193153]">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-lg text-gray-900 mb-2">Career Security</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">Join an organization with stable, documented, and clear career progression paths.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="bg-[#193153] text-white py-6 border-t border-white/10">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <img src="/images/PhilSCA_Logo.png" alt="NAAP Logo" className="h-10 w-auto object-contain bg-white/10 rounded-full p-1" />
                <div>
                  <span className="font-bold text-lg tracking-tight block">NAAP Careers</span>
                  <span className="text-xs text-blue-200">National Aviation Academy of the Philippines</span>
                </div>
              </div>
              <div className="text-center md:text-right">
                <p className="text-xs text-blue-200 mb-1">Shaping the skies, one professional at a time.</p>
                <p className="text-xs text-gray-400">© 2026 National Aviation Academy of the Philippines. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}