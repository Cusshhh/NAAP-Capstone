import { Link, router } from '@inertiajs/react';
import { Users, Briefcase, FileText, Award, LogOut, Shield, TrendingUp, UserCheck, UserX, MapPin, Menu, Calendar, Clock, ChevronRight, Download, XCircle, UserPlus, Layout } from 'lucide-react';
import React, { useState } from 'react';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    LineChart,
    Line,
    Legend,
    CartesianGrid,
} from 'recharts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getAnalyticsData, mockInterviews, getActivities, getStaffingData, getJobs, mockEvents } from '@/data/mockData';
import AdminLayout from '@/layouts/AdminLayout';

export default function AdminDashboard({ auth }: { auth: any }) {
    const admin = auth?.user || { name: 'Admin' };
    const [analytics, setAnalytics] = useState(getAnalyticsData());
    const [activities, setActivities] = useState(getActivities());
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);

    // Initial load and sync
    React.useEffect(() => {
        const handleSync = () => {
            setAnalytics(getAnalyticsData());
            setActivities(getActivities());
        };
        window.addEventListener('storage', handleSync);
        // Also refresh on mount in case things changed
        handleSync();
        return () => window.removeEventListener('storage', handleSync);
    }, []);

    const [reportType, setReportType] = useState('applicants');
    const [dateRange, setDateRange] = useState('month');

    const handleGenerateReport = () => {
        // Simulate report generation
        setIsReportModalOpen(false);
        // You would typically trigger a download here
        console.log(`Generating ${reportType} report for ${dateRange}`);
        // Maybe show a toast notification here in a real app
    };

    const COLORS = ['#3b82f6', '#eab308', '#22c55e', '#ef4444', '#10b981'];

    const jobs = getJobs();
    const campuses = Array.from(new Set(jobs.map(j => j.location).filter(Boolean)));


    const [viewMode, setViewMode] = useState<'global' | 'campus'>('global');
    const [selectedCampus, setSelectedCampus] = useState<string | null>(null);
    const [campusAnalytics, setCampusAnalytics] = useState<any>(null);

    const handleCampusClick = (campus: string) => {
        const data = getAnalyticsData(campus);
        setCampusAnalytics(data);
        setSelectedCampus(campus);
        setViewMode('campus');
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleBackToGlobal = () => {
        setViewMode('global');
        setSelectedCampus(null);
        setCampusAnalytics(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const currentData = viewMode === 'campus' ? campusAnalytics : analytics;

    return (
        <AdminLayout auth={auth}>
            <div className="container mx-auto px-4 py-8">
                {/* Dashboard Title & View Header */}
                <div className="mb-8 border-b border-gray-200 pb-4 flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-[#193153]">Welcome, {admin.name.split(' ')[0]}!</h1>
                        <p className="text-gray-500 mt-1">Here's your administrative overview for today.</p>
                    </div>
                </div>

                {viewMode === 'campus' && (
                    <div className="flex items-center gap-2 bg-blue-50 px-4 py-2 rounded-lg border border-blue-100 mb-8">
                        <MapPin className="h-5 w-5 text-blue-600" />
                        <span className="font-bold text-blue-900">{selectedCampus}</span>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleBackToGlobal}
                            className="ml-2 text-blue-600 hover:text-blue-800 hover:bg-blue-100 h-8 px-2"
                        >
                            <ChevronRight className="h-4 w-4 rotate-180 mr-1" />
                            Back to Global
                        </Button>
                    </div>
                )}

                {/* Overview Cards Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                    {/* Total Applicants Card */}
                    <Link href="/admin/applicants">
                        <Card className="bg-gradient-to-br from-sky-500 to-sky-600 text-white border-0 shadow-lg cursor-pointer hover:scale-105 transition-transform">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sky-100 mb-1 text-sm font-medium uppercase tracking-wider">Total Applicants</p>
                                        <p className="text-3xl font-bold">{currentData.totalApplicants}</p>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <Users className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Open Positions Card */}
                    <Link href="/admin/jobs">
                        <Card className="bg-gradient-to-br from-emerald-500 to-emerald-600 text-white border-0 shadow-lg cursor-pointer hover:scale-105 transition-transform">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-emerald-100 mb-1 text-sm font-medium uppercase tracking-wider">Open Positions</p>
                                        <p className="text-3xl font-bold">{currentData.openPositions}</p>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <Briefcase className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Pending Applications Card */}
                    <Link href="/admin/applicants?status=Under Review">
                        <Card className="bg-gradient-to-br from-amber-500 to-amber-600 text-white border-0 shadow-lg cursor-pointer hover:scale-105 transition-transform">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-amber-100 mb-1 text-sm font-medium uppercase tracking-wider">Pending Review</p>
                                        <p className="text-3xl font-bold">{currentData.pendingApplications}</p>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <FileText className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Shortlisted Candidates Card */}
                    <Link href="/admin/applicants?status=Shortlisted">
                        <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white border-0 shadow-lg cursor-pointer hover:scale-105 transition-transform">
                            <CardContent className="p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-indigo-100 mb-1 text-sm font-medium uppercase tracking-wider">Shortlisted</p>
                                        <p className="text-3xl font-bold">{currentData.shortlistedCandidates}</p>
                                    </div>
                                    <div className="bg-white/20 p-3 rounded-xl">
                                        <Award className="h-8 w-8 text-white" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                {/* Overview Cards Row 2 (Smaller) */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                    {/* Hired Candidates Card */}
                    <Link href={`/admin/applicants?status=Hired${selectedCampus ? `&campus=${encodeURIComponent(selectedCampus)}` : ''}`}>
                        <Card className="bg-white border-l-4 border-green-500 shadow-sm cursor-pointer hover:bg-green-50/30 transition-colors h-full">
                            <CardContent className="p-4 flex items-center justify-between h-full">
                                <div className="flex items-center gap-4">
                                    <div className="bg-green-100 p-2 rounded-lg text-green-600">
                                        <UserCheck className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs font-bold uppercase">Hired Candidates</p>
                                        <p className="text-2xl font-bold text-gray-800">{currentData.applicationsByStatus.find((status: any) => status.name === 'Hired')?.value || 0}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded font-bold">+{currentData.hiredThisMonth} this month</div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Rejected Candidates Card */}
                    <Link href={`/admin/applicants?status=Rejected${selectedCampus ? `&campus=${encodeURIComponent(selectedCampus)}` : ''}`}>
                        <Card className="bg-white border-l-4 border-red-500 shadow-sm cursor-pointer hover:bg-red-50/30 transition-colors h-full">
                            <CardContent className="p-4 flex items-center justify-between h-full">
                                <div className="flex items-center gap-4">
                                    <div className="bg-red-100 p-2 rounded-lg text-red-600">
                                        <UserX className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs font-bold uppercase">Rejected Applications</p>
                                        <p className="text-2xl font-bold text-gray-800">{currentData.rejectedApplications || 0}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded font-bold">+{currentData.rejectedThisMonth} this month</div>
                            </CardContent>
                        </Card>
                    </Link>

                    {/* Staffing Summary Card */}
                    <Link href="/admin/staffing">
                        <Card className="bg-white border-l-4 border-amber-400 shadow-sm cursor-pointer hover:bg-amber-50/30 transition-colors">
                            <CardContent className="p-4 flex items-center justify-between h-full">
                                <div className="flex items-center gap-4">
                                    <div className="bg-amber-100 p-2 rounded-lg text-amber-600">
                                        <Shield className="h-6 w-6" />
                                    </div>
                                    <div>
                                        <p className="text-gray-500 text-xs font-bold uppercase">Unfilled Positions</p>
                                        <p className="text-2xl font-bold text-gray-800">{currentData.unfilledPositions}</p>
                                    </div>
                                </div>
                                <div className="text-xs text-amber-600 bg-amber-50 px-2 py-1 rounded font-bold tracking-tight">Staffing Gap</div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">

                    {/* LEFT COLUMN: Charts (3/4 width) */}
                    <div className="lg:col-span-3 space-y-8">

                        {/* Monthly Trends Chart */}
                        <Card className="shadow-md">
                            <CardHeader className="border-b border-gray-100 bg-gray-50/50">
                                <CardTitle className="flex items-center text-[#193153]">
                                    <TrendingUp className="h-5 w-5 mr-2 text-[#ffdd59]" />
                                    Monthly Application Trends
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="pt-6">
                                <ResponsiveContainer width="100%" height={300}>
                                    <LineChart data={currentData.monthlyTrends}>
                                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                                        <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                        <YAxis axisLine={false} tickLine={false} />
                                        <Tooltip
                                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        />
                                        <Legend />
                                        <Line
                                            type="monotone"
                                            dataKey="applications"
                                            stroke="#3b82f6"
                                            strokeWidth={3}
                                            dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#fff' }}
                                            activeDot={{ r: 6 }}
                                            name="Applications"
                                        />
                                    </LineChart>
                                </ResponsiveContainer>
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Applicants per Position Bar Chart */}
                            <Card className="shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-base text-gray-700">Applicants per Position</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <BarChart data={currentData.applicantsPerPosition || []} layout="vertical">
                                            <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                                            <XAxis type="number" hide />
                                            <YAxis dataKey="position" type="category" width={120} tick={{ fontSize: 12 }} interval={0} />
                                            <Tooltip cursor={{ fill: 'transparent' }} />
                                            <Bar dataKey="applicants" fill="#193153" radius={[0, 4, 4, 0]} barSize={20} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Hiring Timeline Line Chart */}
                            <Card className="shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-base text-gray-700">Time to Hire (Days)</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={currentData.hiringTimeline || []}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip />
                                            <Line type="monotone" dataKey="daysToHire" stroke="#eab308" strokeWidth={3} dot={false} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Application Status Distribution Pie Chart */}
                            <Card className="shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-base text-gray-700">Application Status Distribution</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <PieChart>
                                            <Pie
                                                data={currentData.applicationsByStatus}
                                                cx="50%"
                                                cy="50%"
                                                innerRadius={60}
                                                outerRadius={80}
                                                paddingAngle={5}
                                                dataKey="value"
                                                label={({ percent }) => percent !== undefined && percent > 0 ? `${(percent * 100).toFixed(0)}%` : ''}
                                            >
                                                {currentData.applicationsByStatus.map((entry: any, index: number) => (
                                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                                ))}
                                            </Pie>
                                            <Tooltip />
                                            <Legend
                                                layout="vertical"
                                                verticalAlign="middle"
                                                align="left"
                                                formatter={(value) => {
                                                    return <span className="text-sm font-medium text-gray-700 ml-2">{value}</span>;
                                                }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>

                            {/* Monthly / Annual Hiring Summary Line Chart */}
                            <Card className="shadow-md">
                                <CardHeader>
                                    <CardTitle className="text-base text-gray-700">Hired vs Rejected</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ResponsiveContainer width="100%" height={250}>
                                        <LineChart data={currentData.hiringSummary}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                            <XAxis dataKey="month" axisLine={false} tickLine={false} />
                                            <YAxis axisLine={false} tickLine={false} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="hired" stroke="#22c55e" strokeWidth={2} dot={false} name="Hired" />
                                            <Line type="monotone" dataKey="rejected" stroke="#ef4444" strokeWidth={2} dot={false} name="Rejected" />
                                        </LineChart>
                                    </ResponsiveContainer>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Campus Specific Jobs List */}
                        {viewMode === 'campus' && (
                            <Card className="shadow-md">
                                <CardHeader className="border-b border-gray-100 flex flex-row items-center justify-between">
                                    <CardTitle className="text-lg text-[#193153] flex items-center">
                                        <Briefcase className="h-5 w-5 mr-2 text-blue-600" />
                                        Open Positions at {selectedCampus?.split(' - ')[1]}
                                    </CardTitle>
                                    <Link href={`/admin/jobs?location=${selectedCampus}`}>
                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                                            Manage All Jobs
                                        </Button>
                                    </Link>
                                </CardHeader>
                                <CardContent className="p-0">
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-left">
                                            <thead>
                                                <tr className="bg-gray-50 text-gray-500 text-xs uppercase tracking-wider">
                                                    <th className="px-6 py-3 font-bold">Job Title</th>
                                                    <th className="px-6 py-3 font-bold">Department</th>
                                                    <th className="px-6 py-3 font-bold">Applicants</th>
                                                    <th className="px-6 py-3 font-bold text-right">Action</th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-100">
                                                {currentData.jobs && currentData.jobs.length > 0 ? (
                                                    currentData.jobs.map((job: any) => (
                                                        <tr key={job.id} className="hover:bg-gray-50/50 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <p className="font-bold text-gray-800">{job.title}</p>
                                                                <p className="text-xs text-gray-500">{job.employmentType}</p>
                                                            </td>
                                                            <td className="px-6 py-4 text-sm text-gray-600">{job.department}</td>
                                                            <td className="px-6 py-4">
                                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                                    {job.applicantCount || 0} applicants
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right">
                                                                <Link href={`/admin/jobs?edit=${job.id}`}>
                                                                    <Button variant="ghost" size="sm" className="text-gray-400 hover:text-blue-600">
                                                                        Edit
                                                                    </Button>
                                                                </Link>
                                                            </td>
                                                        </tr>
                                                    ))
                                                ) : (
                                                    <tr>
                                                        <td colSpan={4} className="px-6 py-10 text-center text-gray-500 italic">
                                                            No open positions currently listed for this campus.
                                                        </td>
                                                    </tr>
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Sidebar (1/4 width) */}
                    <div className="space-y-6">

                        {/* Recent Activity Feed */}
                        <Card className="shadow-md">
                            <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
                                <CardTitle className="text-sm font-bold text-gray-700 flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-blue-500" />
                                    Recent Activity
                                </CardTitle>
                                <Link href="/admin/activity-log">
                                    <Button variant="ghost" size="sm" className="h-7 text-[10px] font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 uppercase tracking-tighter">
                                        View Full History
                                    </Button>
                                </Link>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {activities.slice(0, 5).map((activity) => (
                                    <div key={activity.id} className="flex items-start space-x-3 pb-3 border-b border-gray-100 last:border-0 last:pb-0">
                                        <div className={`p-2 rounded-full ${activity.color} bg-opacity-20 mt-1`}>
                                            {activity.icon === 'UserPlus' && <UserPlus className="w-3 h-3" />}
                                            {activity.icon === 'Briefcase' && <Briefcase className="w-3 h-3" />}
                                            {activity.icon === 'Calendar' && <Calendar className="w-3 h-3" />}
                                            {activity.icon === 'XCircle' && <UserX className="w-3 h-3" />}
                                            {activity.icon === 'UserCheck' && <UserCheck className="w-3 h-3" />}
                                            {activity.icon === 'FileText' && <FileText className="h-3 w-3" />}
                                            {activity.icon === 'Shield' && <Shield className="h-3 w-3" />}
                                            {activity.icon === 'Users' && <Users className="h-3 w-3" />}
                                        </div>
                                        <div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm font-bold text-gray-800">{activity.action}</p>
                                                <p className="text-[10px] text-blue-500 font-semibold">{activity.time}</p>
                                            </div>
                                            <p className="text-xs text-gray-500 line-clamp-2">{activity.details}</p>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* Upcoming Events Card */}
                        <Card className="bg-white border-none shadow-lg overflow-hidden">
                            <div className="bg-[#193153] p-4 text-white">
                                <h3 className="font-bold flex items-center gap-2">
                                    <Calendar className="w-4 h-4 text-[#ffdd59]" />
                                    Upcoming Events
                                </h3>
                            </div>
                            <div className="p-4 bg-gray-50 min-h-[150px] flex flex-col gap-3">
                                {mockEvents.length > 0 ? (
                                    mockEvents.map(event => (
                                        <div key={event.id} className="bg-white p-3 rounded-lg border border-gray-100 flex items-start gap-3 shadow-sm hover:border-[#193153] transition-colors">
                                            <div className="bg-blue-50 text-[#193153] p-2 rounded text-center min-w-[50px]">
                                                <span className="block text-xs font-bold uppercase">{event.date.split(' ')[0]}</span>
                                                <span className="block text-lg font-bold leading-none">{event.date.split(' ')[1].replace(',', '')}</span>
                                            </div>
                                            <div>
                                                <h4 className="text-sm font-bold text-gray-900 leading-tight">{event.title}</h4>
                                                <p className="text-xs text-gray-500 mt-1 flex items-center gap-1">
                                                    <Clock className="w-3 h-3" /> {event.time}
                                                </p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-4">
                                        <p className="text-sm text-gray-500 mb-3">No upcoming events.</p>
                                    </div>
                                )}
                                {/* Upcoming Interviews inside Events Card */}
                                <div className="mt-4 border-t border-gray-100 pt-4">
                                    <h4 className="text-sm font-bold text-gray-700 flex items-center mb-3">
                                        <Calendar className="w-4 h-4 mr-2 text-purple-500" />
                                        Upcoming Interviews
                                    </h4>
                                    <div className="space-y-3">
                                        {mockInterviews.map((interview) => (
                                            <div key={interview.id} className="flex items-center justify-between p-2 hover:bg-white rounded-lg transition-colors border border-transparent hover:border-gray-100 hover:shadow-sm">
                                                <div className="flex-1 min-w-0">
                                                    <p className="text-sm font-medium text-gray-900 truncate">{interview.candidateName}</p>
                                                    <p className="text-xs text-gray-500 truncate">{interview.position}</p>
                                                </div>
                                                <div className="text-right ml-2">
                                                    <p className="text-xs font-bold text-gray-700">{new Date(interview.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                                                    <p className="text-[10px] text-gray-400">{interview.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                        <Link href="/admin/applicants" className="block pt-2">
                                            <Button variant="outline" size="sm" className="w-full text-xs h-8 bg-white border-gray-200 hover:bg-gray-50 border-gray-300">
                                                View All Interviews <ChevronRight className="w-3 h-3 ml-1" />
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                                <Link href="/admin/calendar" className="block pt-4 text-center mt-2 border-t border-gray-100">
                                    <Button variant="outline" size="sm" className="text-xs bg-white w-full border-gray-300">View Full Calendar</Button>
                                </Link>
                            </div>
                        </Card>

                        {/* Quick Actions */}
                        <Card className="shadow-md">
                            <CardHeader>
                                <CardTitle className="text-sm font-bold text-gray-700">Quick Actions</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-3">
                                <Link href="/admin/jobs?create=true" className="block">
                                    <Button variant="outline" className="w-full justify-start border-[#193153] text-[#193153] hover:bg-[#193153] hover:text-[#ffdd59] hover:shadow-lg hover:scale-105 transition-all duration-200">
                                        <Briefcase className="w-4 h-4 mr-2" /> Post New Job
                                    </Button>
                                </Link>
                                <Link href="/admin/applicants" className="block">
                                    <Button variant="outline" className="w-full justify-start border-[#193153] text-[#193153] hover:bg-[#193153] hover:text-[#ffdd59] hover:shadow-lg hover:scale-105 transition-all duration-200">
                                        <UserCheck className="w-4 h-4 mr-2" /> Review Applicants
                                    </Button>
                                </Link>
                                <Link href="/admin/landing-page" className="block">
                                    <Button variant="outline" className="w-full justify-start border-[#193153] text-[#193153] hover:bg-[#193153] hover:text-[#ffdd59] hover:shadow-lg hover:scale-105 transition-all duration-200">
                                        <Layout className="w-4 h-4 mr-2" /> Edit Landing Page
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        {/* Campus Locations */}
                        <Card className="bg-white shadow-md border-0">
                            <CardHeader className="bg-[#193153] text-white rounded-t-xl py-4">
                                <CardTitle className="text-sm font-bold flex items-center">
                                    <MapPin className="h-4 w-4 mr-2 text-[#ffdd59]" />
                                    NAAP Campuses
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="flex flex-col divide-y divide-gray-100">
                                    {campuses.map((campus, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center text-sm text-gray-600 p-3 hover:bg-gray-50 transition-colors cursor-pointer group"
                                            onClick={() => handleCampusClick(campus)}
                                        >
                                            <div className="w-2 h-2 rounded-full bg-blue-400 mr-3 group-hover:scale-125 transition-transform"></div>
                                            <span className="group-hover:text-blue-600 font-medium">{campus}</span>
                                            <ChevronRight className="w-3 h-3 ml-auto text-gray-300 group-hover:text-blue-400" />
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>

                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
