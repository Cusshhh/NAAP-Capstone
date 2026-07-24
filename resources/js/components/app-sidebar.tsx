import { Link, usePage } from '@inertiajs/react';
import { BookOpen, Folder, LayoutGrid, Briefcase, Users, PieChart, Layout, History } from 'lucide-react';
import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import type { NavItem } from '@/types';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/admin/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Job Management',
        href: '/admin/jobs',
        icon: Briefcase,
    },
    {
        title: 'Applicants',
        href: '/admin/applicants',
        icon: Users,
    },
    {
        title: 'Staffing Monitoring',
        href: '/admin/staffing',
        icon: PieChart,
    },
    {
        title: 'Manage Content',
        href: '/admin/cms',
        icon: Layout,
    },
    {
        title: 'Activity Log',
        href: '/admin/activity-log',
        icon: History,
    }
];

const footerNavItems: NavItem[] = [
    {
        title: 'Repository',
        href: 'https://github.com/laravel/react-starter-kit',
        icon: Folder,
    },
    {
        title: 'Documentation',
        href: 'https://laravel.com/docs/starter-kits#react',
        icon: BookOpen,
    },
];

export function AppSidebar() {
    const { auth } = usePage<any>().props;
    const isAdmin = !!(user && (user.is_admin || user.email === 'admin@naap.edu.ph'));

    const applicantNavItems: NavItem[] = [
        {
            title: 'Dashboard',
            href: '/dashboard',
            icon: LayoutGrid,
        },
        {
            title: 'Find Jobs',
            href: '/jobs',
            icon: Briefcase,
        },
        {
            title: 'HR Newsroom',
            href: '/hr-news',
            icon: BookOpen,
        }
    ];

    const mainItems = isAdmin ? mainNavItems : applicantNavItems;

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
