import { Link } from '@inertiajs/react';
import {
    Gift,
    Heart,
    DollarSign,
    Clock,
    BookOpen,
    Shield,
    Coffee,
    Umbrella,
    CheckCircle,
    ArrowRight
} from 'lucide-react';
import React from 'react';
import { Button } from '@/components/ui/button';
import { getLandingPageContent } from '@/data/mockData';

// Reusing Button component styles or passing from parent, 
// but for isolation let's define simple local ones or use global UI

const Card = ({ className, children }: any) => (
    <div className={`rounded-xl border border-gray-100 bg-white text-gray-900 shadow-sm ${className}`}>{children}</div>
);

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

export default function EmployeeBenefitsSection() {
    const cmsContent = getLandingPageContent();
    const additionalBenefits = cmsContent.perks.posts;

    return (
        <section id="employee-benefits" className="py-20 bg-white">
            {/* HERO-LIKE INTRO WITHIN SECTION */}
            <div className="container mx-auto px-6 mb-20">
                <div className="relative rounded-3xl overflow-hidden bg-[#193153] text-white p-10 md:p-16 text-center shadow-2xl">
                    {/* Background Pattern/Image Overlay */}
                    <div className="absolute inset-0 opacity-10 bg-[url('/images/NAAP_bg.jpg')] bg-cover bg-center mix-blend-overlay"></div>

                    <div className="relative z-10 max-w-3xl mx-auto">
                        <div className="inline-flex items-center gap-2 bg-[#ffdd59] text-[#193153] px-4 py-1.5 rounded-full text-sm font-bold mb-6">
                            <Gift className="w-4 h-4" /> We Value You
                        </div>
                        <h2 className="text-4xl md:text-5xl font-extrabold mb-6 tracking-tight leading-tight">
                            Work with Purpose, <br />
                            <span className="text-[#ffdd59]">Live with Security.</span>
                        </h2>
                        <p className="text-lg text-blue-100 mb-10 leading-relaxed">
                            At the National Aviation Academy of the Philippines, we take care of the people who take care of our future aviators. We offer a comprehensive benefits package designed to support your professional and personal life.
                        </p>

                        {/* Quick Stats */}
                        <div className="flex flex-wrap justify-center gap-6 text-sm font-medium tracking-wide">
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
                    </div>
                </div>
            </div>

            {/* BENEFITS GRID */}
            <div className="container mx-auto px-6">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-bold text-[#193153]">The Perks Package</h2>
                    <p className="text-gray-500 mt-2">Everything you get when you become part of the National Aviation Academy of the Philippines family.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {BENEFITS.map((item, index) => (
                        <Card key={index} className="p-8 border-t-4 border-t-[#193153] hover:shadow-lg transition-shadow">
                            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center text-[#193153] mb-6">
                                <item.icon className="w-7 h-7" />
                            </div>
                            <h3 className="font-bold text-xl text-gray-900 mb-3">{item.title}</h3>
                            <p className="text-sm text-gray-600 leading-relaxed">{item.description}</p>
                        </Card>
                    ))}
                    {additionalBenefits.map((item) => (
                        <Card key={item.id} className="p-8 border-t-4 border-t-emerald-500 bg-emerald-50/10 hover:shadow-lg transition-shadow">
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
    );
}
