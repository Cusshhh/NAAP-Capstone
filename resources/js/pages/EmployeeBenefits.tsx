import { Head, Link } from '@inertiajs/react';
import {
  Gift,
  Heart,
  DollarSign,
  Clock,
  BookOpen,
  Shield,
  Coffee,
  Umbrella,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import React from 'react';
import { getLandingPageContent } from '@/data/mockData';

// --- SHARED UI COMPONENTS ---
const Button = ({ className, variant = "default", size = "default", children, ...props }: any) => {
  const baseStyles = "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95";
  const variants = {
    // Default (See Open Positions): Blue BG -> Turns Yellow on Hover (UNCHANGED)
    default: "bg-[#193153] text-white hover:bg-[#ffdd59] hover:text-[#193153] shadow-md transition-colors duration-300",

    outline: "border-2 border-[#193153] bg-transparent text-[#193153] hover:bg-[#193153] hover:text-[#ffdd59]",

    // Accent (Apply & Join Us): Yellow BG -> Turns Dark Blue on Hover
    accent: "bg-[#ffdd59] text-[#193153] hover:bg-[#193153] hover:text-[#ffdd59] shadow-lg transition-colors duration-300",
  };
  const sizes = { default: "h-10 px-4 py-2 text-sm", lg: "h-12 rounded-md px-8 text-base" };
  return <button className={`${baseStyles} ${variants[variant as keyof typeof variants] || variants.default} ${sizes[size as keyof typeof sizes] || sizes.default} ${className}`} {...props}>{children}</button>;
};

const Card = ({ className, children }: any) => (
  <div className={`rounded-xl border border-gray-100 bg-white text-gray-900 shadow-sm ${className}`}>{children}</div>
);

// --- MOCK DATA: BENEFITS LIST ---
const BENEFITS = [
  {
    icon: Heart,
    title: "Comprehensive Health",
    description: "Premium HMO coverage for employees and eligible dependents, including dental, vision, and annual physical exams."
  },
  {
    icon: DollarSign,
    title: "Competitive Pay",
    description: "Salary Grade standardization compliant with government rates, plus 13th & 14th-month pay and Performance-Based Bonus (PBB)."
  },
  {
    icon: Clock,
    title: "Leave Credits",
    description: "15 days Vacation Leave and 15 days Sick Leave annually (convertible to cash), plus Special Privilege Leaves."
  },
  {
    icon: BookOpen,
    title: "Career Growth",
    description: "Free access to aviation seminars, Master's degree scholarships, and Civil Service Eligibility reviews."
  },
  {
    icon: Shield,
    title: "Government Mandated",
    description: "Full employer contributions to GSIS (Insurance & Pension), PhilHealth, and Pag-IBIG Fund."
  },
  {
    icon: Umbrella,
    title: "Retirement Security",
    description: "Secure retirement packages, gratuity pay for long-term service, and terminal leave benefits."
  },
  {
    icon: Coffee,
    title: "Work-Life Balance",
    description: "Flexible working schedules for select departments, wellness programs, and team-building activities."
  },
  {
    icon: Gift,
    title: "Allowances",
    description: "Monthly PERA (Personnel Economic Relief Allowance), Clothing Allowance, and Laundry Allowance."
  }
];

export default function EmployeeBenefits() {
  const cmsContent = getLandingPageContent();
  const additionalBenefits = cmsContent.perks.posts;

  return (

    <>
      <Head title="Employee Benefits - NAAP Careers" />

      <div className="min-h-screen bg-gray-50 font-sans text-[#1b1b18]">

        {/* --- NAVIGATION --- */}
        <nav className="bg-[#193153] text-white sticky top-0 z-50 shadow-lg transition-colors">
          <div className="container mx-auto px-6 py-4">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-4">
                <Link href="/">
                  <img
                    src="/images/PhilSCA_Logo.png"
                    alt="NAAP Logo"
                    className="h-14 w-auto object-contain bg-white/10 rounded-full p-1"
                  />
                </Link>
                <div className="flex flex-col">
                  <h1 className="font-bold text-3xl leading-none tracking-tight">NAAP Careers</h1>
                  <p className="text-sm text-blue-200 uppercase tracking-widest mt-1">National Aviation Academy of the Philippines</p>
                </div>
              </div>

              <div className="hidden md:flex items-center space-x-6">
                <Link href="/">
                  <button className="text-lg font-semibold tracking-wide text-white hover:text-[#ffdd59] transition-colors bg-transparent">
                    Home
                  </button>
                </Link>
                <Link href="/jobs">
                  <button className="text-lg font-semibold tracking-wide text-white hover:text-[#ffdd59] transition-colors bg-transparent">
                    Browse Job
                  </button>
                </Link>
                <Link href="/login">
                  <button className="text-lg font-semibold tracking-wide text-white hover:text-[#ffdd59] transition-colors bg-transparent">
                    Login/Register
                  </button>
                </Link>
              </div>
            </div>
          </div>
        </nav>

        {/* --- HERO SECTION WITH BACKGROUND IMAGE --- */}
        {/* Increased height to h-[700px] */}
        <div className="relative h-[700px] flex items-center justify-center overflow-hidden bg-[#193153]">

          {/* Background Image Layer */}
          <div className="absolute inset-0">
            <img
              src="/images/NAAP_bg.jpg"
              alt="NAAP Campus Background"
              className="w-full h-full object-cover object-center"
            />
            {/* Gradient Overlay for Text Readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#193153] via-[#193153]/80 to-[#193153]/50" />
          </div>

          <div className="container mx-auto px-6 relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-[#ffdd59] text-[#193153] px-4 py-1.5 rounded-full text-sm font-bold mb-6 animate-fade-in-up">
              <Gift className="w-4 h-4" /> We Value You
            </div>
            <h1 className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight text-white drop-shadow-xl">
              Work with Purpose, <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#ffdd59] to-yellow-200">Live with Security.</span>
            </h1>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto mb-10 drop-shadow-md">
              At the National Aviation Academy of the Philippines, we take care of the people who take care of our future aviators. We offer a comprehensive benefits package designed to support your professional and personal life.
            </p>

            {/* Quick Stats */}
            <div className="flex justify-center gap-8 mb-8 text-blue-100 text-sm font-medium tracking-wide drop-shadow-sm">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#ffdd59]" /> Government Standard
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#ffdd59]" /> Premium Healthcare
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-[#ffdd59]" /> Career Growth
              </div>
            </div>

            <div className="flex justify-center gap-4">
              <Link href="/login">
                <Button variant="accent" size="lg">Apply & Join Us <ArrowRight className="ml-2 w-5 h-5" /></Button>
              </Link>
            </div>
          </div>
        </div>

        {/* --- BENEFITS GRID DASHBOARD (STATIC) --- */}
        <section className="py-20 px-6 bg-gray-50">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-[#193153]">The Perks Package</h2>
              <p className="text-gray-500 mt-2">Everything you get when you become part of the National Aviation Academy of the Philippines family.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {BENEFITS.map((item, index) => (
                <Card key={index} className="p-8 border-t-4 border-t-[#193153]">
                  <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-[#193153] mb-6">
                    <item.icon className="w-7 h-7" />
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </Card>
              ))}
              {additionalBenefits.map((item) => (
                <Card key={item.id} className="p-8 border-t-4 border-t-emerald-500 bg-emerald-50/10">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600 mb-6 font-bold">
                    +
                  </div>
                  <h3 className="font-bold text-xl text-gray-900 mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                </Card>
              ))}
            </div>

          </div>
        </section>

        {/* --- CALL TO ACTION --- */}
        <section className="bg-white py-20 px-6 border-t border-gray-100">
          <div className="container mx-auto text-center max-w-3xl">
            <h2 className="text-3xl font-bold text-[#193153] mb-6">Ready to enjoy these benefits?</h2>
            <p className="text-gray-600 mb-8 text-lg">Don't miss the opportunity to build a rewarding career with great security at the National Aviation Academy of the Philippines.</p>
            <div className="flex justify-center gap-4">
              <Link href="/jobs">
                {/* Hover effect is handled by the 'default' variant in Button component */}
                <Button variant="default" size="lg" className="px-10">See Open Positions</Button>
              </Link>
            </div>
          </div>
        </section>

        {/* --- FOOTER --- */}
        <footer className="bg-[#193153] text-white py-6 border-t border-white/10">
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
                <p className="text-xs text-gray-400">© 2026 National Aviation Academy of the Philippines. All rights reserved.</p>
              </div>
            </div>
          </div>
        </footer>

      </div>
    </>
  );
}