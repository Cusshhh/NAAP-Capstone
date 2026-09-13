import { Link, router, usePage } from '@inertiajs/react';
import { Users, Briefcase, Shield, LogOut, Menu, Layout, Clock, FileText, Calendar, ChevronRight, Key, MessageSquare, ChevronDown, User, Settings, ShieldCheck, Bell, CheckCheck } from 'lucide-react';
import type { ReactNode } from 'react';
import React from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    const pendingApplicantsCount = (props as any)?.pending_applicants_count || 0;

    const [notificationsOpen, setNotificationsOpen] = React.useState(false);
    const storageKey = `read_admin_notifs_${admin.id || admin.email || 'admin'}`;
    const [readNotifIds, setReadNotifIds] = React.useState<string[]>(() => {
        if (typeof window !== 'undefined') {
            try {
                return JSON.parse(localStorage.getItem(storageKey) || '[]');
            } catch (e) {
                return [];
            }
        }
        return [];
    });

    const buildAdminNotifs = () => {
        const list: any[] = [];
        if (pendingApplicantsCount > 0) {
            list.push({
                id: `pending_apps_${pendingApplicantsCount}`,
                text: `${pendingApplicantsCount} job application(s) pending HR review & screening.`,
                time: 'Live Alert',
                isRead: readNotifIds.includes(`pending_apps_${pendingApplicantsCount}`),
                href: '/admin/applicants',
                type: 'applicant'
            });
        }
        if (unreadMessagesCount > 0) {
            list.push({
                id: `unread_msgs_${unreadMessagesCount}`,
                text: `${unreadMessagesCount} unread message(s) received from applicants.`,
                time: 'Live Alert',
                isRead: readNotifIds.includes(`unread_msgs_${unreadMessagesCount}`),
                href: '/admin/messages',
                type: 'message'
            });
        }
        if (typeof window !== 'undefined') {
            try {
                const ints = JSON.parse(localStorage.getItem('scheduled_interviews_custom') || '[]');
                if (Array.isArray(ints) && ints.length > 0) {
                    const latest = ints[ints.length - 1];
                    list.push({
                        id: `interview_${latest.id || latest.date}`,
                        text: `Upcoming interview scheduled for ${latest.candidateName || 'Applicant'} (${latest.position || 'Vacancy'}) on ${latest.date || 'Soon'}.`,
                        time: latest.time || 'Scheduled',
                        isRead: readNotifIds.includes(`interview_${latest.id || latest.date}`),
                        href: '/admin/dashboard',
                        type: 'interview'
                    });
                }
            } catch (e) {}
        }
        list.push({
            id: `activity_system_log`,
            text: `System Activity Audit Logs are active & recording user events.`,
            time: 'Active System',
            isRead: readNotifIds.includes(`activity_system_log`),
            href: '/admin/activity-log',
            type: 'system'
        });

        return list;
    };

    const adminNotifications = buildAdminNotifs();
    const hasUnreadAdminNotif = adminNotifications.some(n => !n.isRead);

    const handleMarkAllRead = () => {
        const allIds = adminNotifications.map(n => n.id);
        const updated = Array.from(new Set([...readNotifIds, ...allIds]));
        setReadNotifIds(updated);
        localStorage.setItem(storageKey, JSON.stringify(updated));
    };

    const handleMarkSingleRead = (id: string, href: string) => {
        if (!readNotifIds.includes(id)) {
            const updated = [...readNotifIds, id];
            setReadNotifIds(updated);
            localStorage.setItem(storageKey, JSON.stringify(updated));
        }
        router.visit(href);
    };

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
                                        {item.name === 'Applicants' && pendingApplicantsCount > 0 && (
                                            <span className="ml-1.5 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-white bg-red-500 rounded-full animate-pulse shadow-md border border-white">
                                                {pendingApplicantsCount}
                                            </span>
                                        )}
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

                            {/* Admin Notification Bell */}
                            <div className="relative">
                                <button
                                    onClick={() => setNotificationsOpen(!notificationsOpen)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors relative cursor-pointer outline-none flex items-center justify-center"
                                    title="Admin Notifications"
                                >
                                    <Bell className="w-5 h-5 text-white" />
                                    {hasUnreadAdminNotif && (
                                        <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[#193153] animate-pulse"></span>
                                    )}
                                </button>

                                {notificationsOpen && (
                                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 py-2 z-50 text-gray-800 animate-in fade-in zoom-in-95 duration-200">
                                        <div className="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
                                            <span className="font-bold text-xs uppercase tracking-wider text-[#193153]">System Alerts</span>
                                            {hasUnreadAdminNotif && (
                                                <button 
                                                    onClick={handleMarkAllRead} 
                                                    className="text-xs text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                                                >
                                                    <CheckCheck className="w-3.5 h-3.5" /> Mark read
                                                </button>
                                            )}
                                        </div>
                                        <div className="max-h-72 overflow-y-auto">
                                            {adminNotifications.length === 0 ? (
                                                <div className="px-4 py-6 text-center text-gray-400 text-xs">No notifications yet</div>
                                            ) : (
                                                adminNotifications.map(n => (
                                                    <div
                                                        key={n.id}
                                                        onClick={() => {
                                                            setNotificationsOpen(false);
                                                            handleMarkSingleRead(n.id, n.href);
                                                        }}
                                                        className={`px-4 py-3 border-b border-gray-50 last:border-0 cursor-pointer transition-colors ${
                                                            n.isRead ? 'bg-gray-50/70 hover:bg-gray-100/60' : 'bg-blue-50/40 hover:bg-blue-50/80'
                                                        }`}
                                                    >
                                                        <div className="flex gap-2.5 items-start">
                                                            {!n.isRead && <div className="mt-1.5 w-2 h-2 bg-red-500 rounded-full shrink-0 animate-pulse"></div>}
                                                            <div className="flex-1">
                                                                <p className={`text-xs leading-snug ${n.isRead ? 'text-gray-500 font-normal' : 'text-gray-900 font-semibold'}`}>
                                                                    {n.text}
                                                                </p>
                                                                <span className="text-[10px] text-blue-600 font-medium mt-1 inline-block">
                                                                    {n.time} &bull; Click to open
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Admin User Profile Dropdown */}
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <button className="flex items-center gap-2.5 px-3 py-1.5 rounded-full hover:bg-white/10 transition-all duration-200 outline-none cursor-pointer group border border-transparent hover:border-white/10">
                                        <div className="w-8 h-8 rounded-full bg-[#ffdd59] flex items-center justify-center text-[#193153] font-bold text-xs ring-2 ring-[#ffdd59]/50 group-hover:ring-[#ffdd59] transition-all shadow-xs shrink-0 overflow-hidden">
                                            {admin.avatar_url || admin.profile_data?.avatar_url ? (
                                                <img src={admin.avatar_url || admin.profile_data?.avatar_url} alt={admin.name} className="w-full h-full object-cover" />
                                            ) : (
                                                admin.name.charAt(0)
                                            )}
                                        </div>
                                        <span className="text-sm font-medium text-blue-100 group-hover:text-white transition-colors max-w-[140px] truncate">
                                            {admin.name}
                                        </span>
                                        <ChevronDown className="w-3.5 h-3.5 text-blue-200 group-hover:text-[#ffdd59] transition-transform duration-200 group-data-[state=open]:rotate-180" />
                                    </button>
                                </DropdownMenuTrigger>

                                <DropdownMenuContent align="end" className="w-60 bg-white shadow-xl rounded-xl border border-gray-100 p-1.5 mt-2 z-50">
                                    {/* Admin Identity Card Header */}
                                    <div className="p-3 bg-gradient-to-br from-[#193153]/5 to-blue-50/50 rounded-lg mb-1 border border-blue-100/50">
                                        <div className="flex items-center gap-2.5">
                                            <div className="w-9 h-9 rounded-full bg-[#193153] text-[#ffdd59] font-bold text-sm flex items-center justify-center shrink-0 shadow-xs overflow-hidden">
                                                {admin.avatar_url || admin.profile_data?.avatar_url ? (
                                                    <img src={admin.avatar_url || admin.profile_data?.avatar_url} alt={admin.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    admin.name.charAt(0)
                                                )}
                                            </div>
                                            <div className="overflow-hidden">
                                                <p className="font-bold text-[#193153] text-sm leading-tight truncate">{admin.name}</p>
                                                <p className="text-xs text-gray-500 truncate mt-0.5">{admin.email || 'admin@naap.edu.ph'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <DropdownMenuSeparator className="my-1" />

                                    {/* Options */}
                                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-xs font-medium py-2 px-2.5 text-gray-700 hover:bg-gray-100 hover:text-[#193153] transition-colors">
                                        <a href="/settings/profile" className="flex items-center gap-2 w-full">
                                            <Settings className="w-4 h-4 text-blue-600" />
                                            <span>Account Settings</span>
                                        </a>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-xs font-medium py-2 px-2.5 text-gray-700 hover:bg-gray-100 hover:text-[#193153] transition-colors">
                                        <a href="/settings/two-factor" className="flex items-center gap-2 w-full">
                                            <ShieldCheck className="w-4 h-4 text-emerald-600" />
                                            <span>Security & 2FA</span>
                                        </a>
                                    </DropdownMenuItem>

                                    <DropdownMenuItem asChild className="cursor-pointer rounded-lg text-xs font-medium py-2 px-2.5 text-gray-700 hover:bg-gray-100 hover:text-[#193153] transition-colors">
                                        <a href="/admin/activity-log" className="flex items-center gap-2 w-full">
                                            <Clock className="w-4 h-4 text-purple-600" />
                                            <span>Activity Audit Logs</span>
                                        </a>
                                    </DropdownMenuItem>

                                    <DropdownMenuSeparator className="my-1" />

                                    {/* Logout Option */}
                                    <DropdownMenuItem 
                                        onClick={handleLogout}
                                        className="cursor-pointer rounded-lg text-xs font-semibold py-2 px-2.5 text-red-600 hover:bg-red-50 hover:text-red-700 transition-colors flex items-center gap-2"
                                    >
                                        <LogOut className="w-4 h-4 text-red-500" />
                                        <span>Log Out</span>
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
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
