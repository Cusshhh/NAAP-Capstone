import { Head, Link, router, usePage } from '@inertiajs/react';
import {
  Users,
  Award,
  TrendingUp,
  Briefcase,
  Gift,
  MapPin,
  Building
} from 'lucide-react';
import React, { useState } from 'react';
import LoginModal from '@/components/landing/LoginModal';
import RegisterModal from '@/components/landing/RegisterModal';
import { getAnalyticsData, getAnnouncements, getApplications } from '@/data/mockData';


// --- COMPONENTS ---
const Button = ({ className, variant = "default", size = "default", children, ...props }: any) => {
  const baseStyles = "cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95";

  const variants = {
    default: "bg-blue-600 text-white hover:bg-blue-700 shadow-md",
    primaryAction: "bg-white text-[#193153] shadow-xl hover:bg-[#193153] hover:text-[#ffdd59]",
    outline: "border-2 border-white bg-transparent text-white hover:bg-white/10",
    ghost: "hover:bg-white/10 text-white",
    outlineDark: "border border-[#193153] text-[#193153] hover:bg-[#193153] hover:text-[#ffdd59] bg-transparent",
    nav: "text-[#193153] hover:text-[#ffdd59] bg-transparent",
  };

  const sizes = {
    default: "h-10 px-4 py-2 text-sm",
    lg: "h-12 rounded-md px-8 text-base",
    xl: "h-14 rounded-md px-10 text-lg",
    icon: "h-10 w-10",
  };

  return (
    <button className={`${baseStyles} ${variants[variant as keyof typeof variants] || variants.default} ${sizes[size as keyof typeof sizes] || sizes.default} ${className}`} {...props}>
      {children}
    </button>
  );
};

const Card = ({ className, children }: any) => (
  <div className={`rounded-xl border bg-white text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
    {children}
  </div>
);

const CardContent = ({ className, children }: any) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

// --- MAIN COMPONENT ---
export default function Welcome() {
  const analytics = getAnalyticsData();
  const allApps = getApplications();
  const openPositionsCount = analytics.openPositions;
  const hiredCount = allApps.filter((a: any) => a.status === 'Hired').length;
  const displayHired = hiredCount;

  // --- DYNAMIC STATS STRIP CALCULATIONS ---
  // Calculates the 'Employment / Success Rate' based on processed applications
  const totalProcessed = allApps.filter((a: any) => ['Hired', 'Rejected'].includes(a.status)).length;
  const employmentRate = totalProcessed > 0 ? Math.round((hiredCount / totalProcessed) * 100) : 0;

  // Count unique campuses or departments as 'Industry Partners' for the sake of making it dynamic
  const uniqueCampuses = new Set(allApps.map((a: any) => a.campus)).size;
  const industryPartnersCount = uniqueCampuses > 0 ? uniqueCampuses * 12 : 50; // Just a dynamic multiplier for demo

  const announcements = getAnnouncements() || [];
  const defaultAnnouncement = {
    id: 0,
    image: '/images/Dorm1.jpg',
    title: "Welcome to NAAP",
    description: "Shaping the skies, one professional at a time."
  };
  const heroAnnouncement = announcements.length > 0 ? announcements[Math.floor(Math.random() * announcements.length)] : defaultAnnouncement;

  // --- MODAL STATE ---
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);

  const openLogin = () => { setIsLoginOpen(true); setIsRegisterOpen(false); };
  const openRegister = () => { setIsRegisterOpen(true); setIsLoginOpen(false); };



  return (
    <>
      <Head title="NAAP Careers" />

      <LoginModal
        isOpen={isLoginOpen}
        onClose={() => setIsLoginOpen(false)}
        onSwitchToRegister={openRegister}
      />
      <RegisterModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSwitchToLogin={openLogin}
      />

      <div className="min-h-screen bg-gray-50 font-sans text-[#1b1b18]">

        <nav className="bg-[#193153] text-white sticky top-0 z-50 shadow-lg transition-colors">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <img
                  src="/images/PhilSCA_Logo.png"
                  alt="NAAP Logo"
                  className="h-14 w-auto object-contain bg-white/10 rounded-full p-1"
                />
                <div className="flex flex-col">
                  <h1 className="font-bold text-3xl leading-none tracking-tight">NAAP Careers</h1>
                  <p className="text-sm text-blue-200 uppercase tracking-widest mt-1">National Aviation Academy of the Philippines</p>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-6">
                {selected_campus ? (
                  <button 
                    onClick={() => setIsCampusModalOpen(true)} 
                    className="text-xs bg-white/10 hover:bg-white/20 border border-white/20 text-[#ffdd59] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <MapPin className="w-3.5 h-3.5" />
                    {selected_campus.campus_name} (Change)
                  </button>
                ) : (
                  <button 
                    onClick={() => setIsCampusModalOpen(true)} 
                    className="text-xs bg-[#ffdd59] hover:bg-[#ffdd59]/90 text-[#193153] font-bold px-3 py-1.5 rounded-full flex items-center gap-1 cursor-pointer transition-all active:scale-95"
                  >
                    <Building className="w-3.5 h-3.5" />
                    Select Campus
                  </button>
                )}
                
                <button onClick={openLogin} className="text-sm font-medium hover:text-[#ffdd59] transition-colors cursor-pointer">
                  Applicant Login
                </button>
                <Link href="/admin-login" className="text-sm font-medium hover:text-[#ffdd59] transition-colors">
                  Admin Login
                </Link>
              </div>
            </div>
          </div>
        </nav>

        <section className="relative h-[700px] flex items-center justify-center overflow-hidden">
          <div className="absolute inset-0">
            <img
              src={heroAnnouncement.image}
              alt={heroAnnouncement.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#193153]/95 via-[#193153]/60 to-[#193153]/20" />
          </div>

          <div className="container relative z-10 px-4 text-center">
            <div className="max-w-4xl mx-auto">
              <div className="min-h-[240px] flex flex-col justify-center">
                <h2 className="text-6xl md:text-7xl font-extrabold text-white mb-8 tracking-tight drop-shadow-xl transition-all duration-500">
                  {heroAnnouncement.title}
                </h2>
                <p className="text-2xl text-blue-50 mb-10 leading-relaxed drop-shadow-md font-light transition-all duration-500">
                  {heroAnnouncement.description}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row justify-center gap-6 mt-4">
                <Link href="/jobs">
                  <Button variant="primaryAction" size="xl" className="w-full sm:w-auto font-bold">
                    <Briefcase className="mr-2 h-6 w-6" />
                    Explore Careers
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="py-20 -mt-10 relative z-20 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <Link href="/jobs" className="block group cursor-pointer">
                <Card className="h-full border-b-8 border-b-[#193153] shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="pt-10 text-center">
                    <div className="inline-flex p-4 rounded-full bg-blue-50 mb-6 group-hover:bg-[#ffdd59] group-hover:text-[#193153] transition-colors duration-300">
                      <Briefcase className="h-10 w-10 text-[#193153] group-hover:text-[#193153] transition-colors duration-300" />
                    </div>
                    <h3 className="text-5xl font-bold text-gray-900 mb-2">{openPositionsCount}+</h3>
                    <p className="text-base font-bold text-gray-500 uppercase tracking-widest">Open Positions</p>
                  </CardContent>
                </Card>
              </Link>

              <div onClick={() => router.visit('/professionals-hired')} className="block h-full group cursor-pointer">
                <Card className="h-full border-b-8 border-b-emerald-500 shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="pt-10 text-center">
                    <div className="inline-flex p-4 rounded-full bg-emerald-50 mb-6 group-hover:bg-[#193153] group-hover:text-[#ffdd59] transition-colors duration-300">
                      <Users className="h-10 w-10 text-emerald-600 group-hover:text-[#ffdd59] transition-colors duration-300" />
                    </div>
                    <h3 className="text-5xl font-bold text-gray-900 mb-2">{displayHired}+</h3>
                    <p className="text-base font-bold text-gray-500 uppercase tracking-widest">Professionals Hired</p>
                  </CardContent>
                </Card>
              </div>

              <div onClick={() => router.visit('/employee-benefits')} className="block h-full group cursor-pointer">
                <Card className="h-full border-b-8 border-b-purple-500 shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="pt-10 text-center">
                    <div className="inline-flex p-4 rounded-full bg-purple-50 mb-6 group-hover:bg-[#ffdd59] group-hover:text-[#193153] transition-colors duration-300">
                      <Gift className="h-10 w-10 text-purple-600 group-hover:text-[#193153] transition-colors duration-300" />
                    </div>
                    <h3 className="text-5xl font-bold text-gray-900 mb-2">Perks</h3>
                    <p className="text-base font-bold text-gray-500 uppercase tracking-widest">Employee Benefits & Rewards</p>
                  </CardContent>
                </Card>
              </div>

              <div onClick={() => router.visit('/news/csc-prime-hrm-level-2')} className="block h-full group cursor-pointer">
                <Card className="h-full border-b-8 border-b-orange-500 shadow-xl hover:-translate-y-2 transition-all duration-300">
                  <CardContent className="pt-10 text-center">
                    <div className="inline-flex p-4 rounded-full bg-orange-50 mb-6 group-hover:bg-[#193153] group-hover:text-[#ffdd59] transition-colors duration-300">
                      <TrendingUp className="h-10 w-10 text-orange-600 group-hover:text-[#ffdd59] transition-colors duration-300" />
                    </div>
                    <h3 className="text-5xl font-bold text-gray-900 mb-2">Level 2</h3>
                    <p className="text-base font-bold text-gray-500 uppercase tracking-widest">CSC PRIME-HRM Recognition</p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </section>

        {/* --- DYNAMIC STATS STRIP --- */}
        <div className="bg-white border-b border-gray-200 py-10 mt-10">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center divide-x divide-gray-100">
              <div>
                <div className="text-4xl font-bold text-[#193153] mb-1">{hiredCount}+</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Hired Professionals</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#193153] mb-1">{employmentRate}%</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Employment Rate</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#193153] mb-1">{industryPartnersCount}+</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">Industry Partners</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[#193153] mb-1">Lvl 2</div>
                <div className="text-sm text-gray-500 uppercase tracking-wide">CSC PRIME-HRM</div>
              </div>
            </div>
          </div>
        </div>

        <footer className="bg-[#193153] text-white py-6 border-t border-white/10 mt-auto">
          <div className="container mx-auto px-6">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center space-x-3">
                <img
                  src="/images/PhilSCA_Logo.png"
                  alt="NAAP Logo"
                  className="h-10 w-auto object-contain bg-white/10 rounded-full p-1"
                />
                <div>
                  <span className="font-bold text-lg tracking-tight block">NAAP Careers</span>
                  <span className="text-xs text-blue-200">National Aviation Academy of the Philippines</span>
                </div>
              </div>

              <div className="text-center md:text-right">
                <p className="text-xs text-blue-200 mb-1">Shaping the skies, one professional at a time.</p>
                <p className="text-xs text-gray-400">© 2026 NAAP. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}