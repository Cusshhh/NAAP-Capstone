import {
    Users,
    Briefcase,
    Gift,
    TrendingUp,
} from 'lucide-react';
import React, { useState } from 'react';
import { getAnalyticsData, getAnnouncements, getApplications } from '@/data/mockData';

// Reusing Card components for internal use
const Card = ({ className, children, onClick }: any) => (
    <div onClick={onClick} className={`rounded-xl border bg-white text-card-foreground shadow-sm hover:shadow-md transition-all duration-300 ${className}`}>
        {children}
    </div>
);

const CardContent = ({ className, children }: any) => (
    <div className={`p-6 ${className}`}>
        {children}
    </div>
);

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

export default function LegacyWelcomeSection() {
    const analytics = getAnalyticsData();
    const allApps = getApplications();
    const openPositionsCount = analytics.openPositions;
    const hiredCount = allApps.filter((a: any) => a.status === 'Hired').length;
    const displayHired = hiredCount;

    const announcements = getAnnouncements() || [];
    const defaultAnnouncement = {
        id: 0,
        image: '/images/Dorm1.jpg',
        title: "Welcome to NAAP",
        description: "Shaping the skies, one professional at a time."
    };
    const heroAnnouncement = announcements.length > 0 ? announcements[Math.floor(Math.random() * announcements.length)] : defaultAnnouncement;

    const scrollToSection = (id: string) => {
        const section = document.getElementById(id);
        if (section) {
            section.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="bg-gray-50">
            {/* --- DYNAMIC HERO SECTION --- */}
            <section className="relative h-[600px] flex items-center justify-center overflow-hidden">
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
                        <div className="min-h-[200px] flex flex-col justify-center">
                            <h2 className="text-5xl md:text-6xl font-extrabold text-white mb-6 tracking-tight drop-shadow-xl">
                                {heroAnnouncement.title}
                            </h2>
                            <p className="text-xl text-blue-50 mb-8 leading-relaxed drop-shadow-md font-light">
                                {heroAnnouncement.description}
                            </p>
                        </div>

                        <div className="flex flex-col sm:flex-row justify-center gap-6 mt-4">
                            <Button onClick={() => scrollToSection('job-board')} variant="primaryAction" size="xl" className="w-full sm:w-auto font-bold">
                                <Briefcase className="mr-2 h-6 w-6" />
                                Explore Careers
                            </Button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="py-20 -mt-10 relative z-20 px-4">
                <div className="container mx-auto max-w-7xl">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div onClick={() => scrollToSection('job-board')} className="block group cursor-pointer">
                            <Card className="h-full border-b-8 border-b-[#193153] shadow-xl hover:-translate-y-2 transition-all duration-300">
                                <CardContent className="pt-10 text-center">
                                    <div className="inline-flex p-4 rounded-full bg-blue-50 mb-6 group-hover:bg-[#ffdd59] group-hover:text-[#193153] transition-colors duration-300">
                                        <Briefcase className="h-10 w-10 text-[#193153] group-hover:text-[#193153] transition-colors duration-300" />
                                    </div>
                                    <h3 className="text-5xl font-bold text-gray-900 mb-2">{openPositionsCount}+</h3>
                                    <p className="text-base font-bold text-gray-500 uppercase tracking-widest">Open Positions</p>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Note: Professionals Hired card removed since it's redundant on this page now */}

                        <div className="block h-full group cursor-default">
                            {/* Placeholder or different stat could go here, for now keeping layout balanced */}
                            <Card className="h-full border-b-8 border-b-emerald-500 shadow-xl">
                                <CardContent className="pt-10 text-center">
                                    <div className="inline-flex p-4 rounded-full bg-emerald-50 mb-6 group-hover:bg-[#193153] group-hover:text-[#ffdd59] transition-colors duration-300">
                                        <Users className="h-10 w-10 text-emerald-600 group-hover:text-[#ffdd59] transition-colors duration-300" />
                                    </div>
                                    <h3 className="text-5xl font-bold text-gray-900 mb-2">{displayHired}+</h3>
                                    <p className="text-base font-bold text-gray-500 uppercase tracking-widest">Total Hires</p>
                                </CardContent>
                            </Card>
                        </div>

                        <div onClick={() => scrollToSection('employee-benefits')} className="block h-full group cursor-pointer">
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

                        <div className="block h-full group cursor-pointer">
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
        </div>
    );
}
