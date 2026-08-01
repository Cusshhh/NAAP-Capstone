import { Link, router, usePage } from '@inertiajs/react';
import { Users, Briefcase, Shield, LogOut, Menu, Layout, Clock, FileText, Calendar, ChevronRight, Key, MessageSquare } from 'lucide-react';
import type { ReactNode } from 'react';
import React from 'react';
import { Button } from '@/components/ui/button';

interface AdminLayoutProps {
    children: ReactNode;
    auth: {
        user: {
            name: string;
            email: string;
            role?: string;
            is_super_admin?: boolean;
            is_admin?: boolean;
        };
    };
    title?: string;
    headerActions?: ReactNode;
}

export default function AdminLayout({ children, auth, title, headerActions }: AdminLayoutProps) {
    const admin = auth?.user || { name: 'Admin', email: '' } as any;
    const { url, props } = usePage<any>();
    const unreadMessagesCount = (props as any)?.unread_messages_count || 0;

    const handleLogout = () => {
        router.post('/logout');
    };

    const isActive = (path: string) => {
        return url.startsWith(path);
    };

    const navItems = [
        { name: 'Dashboard', href: '/admin/dashboard', icon: Shield },
        { name: 'Jobs', href: '/admin/jobs', icon: Briefcase },
        { name: 'Applicants', href: '/admin/applicants', icon: Users },
        { name: 'Messages', href: '/admin/messages', icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-gray-50 font-sans flex flex-col">
            {/* Navigation Header */}
            <nav className="bg-[#193153] text-white shadow-lg sticky top-0 z-50">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3">
                            <a href="/admin/dashboard" className="bg-white/10 p-2 rounded-full h-12 w-12 flex items-center justify-center overflow-hidden">
                                <img src="/images/PhilSCA_Logo.png" alt="NAAP Logo" className="h-full w-full object-contain" />
                            </a>
                            <div>
                                <span className="font-bold text-lg block leading-none">NAAP HR Admin</span>
                                <span className="text-[10px] text-blue-200 uppercase tracking-widest">Portal</span>
                            </div>
                        </div>

                        {/* Desktop Menu */}
                        <div className="hidden md:flex items-center space-x-2">
                            {navItems.map((item) => (
                                <a key={item.name} href={item.href} className="relative">
                                    <Button 
                                        variant="ghost" 
                                        className={`text-white transition-all duration-200 relative ${
                                            isActive(item.href) 
                                            ? 'bg-white/20 text-[#ffdd59] font-bold shadow-inner' 
                                            : 'hover:bg-white/10 hover:text-[#ffdd59]'
                                        }`}
                                    >
                                        <item.icon className={`h-4 w-4 mr-2 ${isActive(item.href) ? 'text-[#ffdd59]' : ''}`} />
                                        {item.name}
                                        {item.name === 'Messages' && unreadMessagesCount > 0 && (
                                            <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full animate-pulse shadow-md border border-white">
                                                {unreadMessagesCount}
                                            </span>
                                        )}
                                    </Button>
                                </a>
                            ))}
                            
                            <div className="h-6 w-px bg-white/20 mx-2"></div>

                            {headerActions}

                            {/* Admin User Info */}
                            <div className="flex items-center gap-2 px-2">
                                <div className="w-8 h-8 rounded-full bg-[#ffdd59] flex items-center justify-center text-[#193153] font-bold text-xs ring-2 ring-white/10">
                                    {admin.name.charAt(0)}
                                </div>
                                <span className="text-sm font-medium text-blue-100">{admin.name}</span>
                            </div>

                            <Button
                                variant="ghost"
                                className="text-white hover:bg-red-500/20 hover:text-red-300"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-4 w-4 mr-2" />
                                Logout
                            </Button>
                        </div>

                        {/* Mobile Menu Button */}
                        <button className="md:hidden text-white hover:bg-white/10 p-2 rounded-lg">
                            <Menu className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main className="flex-1">
                {children}
            </main>

            {/* Footer */}
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
    );
}
