import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Shield, Users, LogOut, Search, Download, Star, Calendar, Eye, Edit, Trash, Plus, ChevronDown, ChevronUp, Briefcase, Layout, TrendingUp, GraduationCap, Award, BookOpen, FileText, ExternalLink } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { mockApplications, mockInterviews, getApplications } from '@/data/mockData';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import AdminLayout from '@/layouts/AdminLayout';

export default function Applicants({ auth, applications: serverApplications }: { auth: any, applications: any[] }) {
    const admin = auth?.user || { name: 'Admin' };
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [aiMatchFilter, setAiMatchFilter] = useState('all');
    const [campusFilter, setCampusFilter] = useState('all');
    const [positionFilter, setPositionFilter] = useState('all');
    const [sortBy, setSortBy] = useState('date');
    const [applications, setApplications] = useState(serverApplications || getApplications()); // Use server data if available

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const statusParam = params.get('status');
        if (statusParam) {
            setStatusFilter(statusParam);
        }

        const campusParam = params.get('campus');
        if (campusParam) {
            setCampusFilter(campusParam);
        }

        return () => { };
    }, []);

    // Interview Booking State
    const [interviewDate, setInterviewDate] = useState('');
    const [interviewTime, setInterviewTime] = useState('');
    const [panelMembers, setPanelMembers] = useState('');
    const [venue, setVenue] = useState('');
    const [notifyApplicant, setNotifyApplicant] = useState(false);
    const [resultNotes, setResultNotes] = useState('');
    const [candidateName, setCandidateName] = useState('');
    const [position, setPosition] = useState('');
    const [selectedAppId, setSelectedAppId] = useState<number | null>(null);
    const [selectedAppEmail, setSelectedAppEmail] = useState<string>('');

    // State to hold scheduled interviews - Initialize from LocalStorage
    const [scheduledInterviews, setScheduledInterviews] = useState<any[]>(() => {
        if (typeof window === 'undefined') return [];
        try {
            const saved = localStorage.getItem('scheduled_interviews_custom');
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem('scheduled_interviews_custom', JSON.stringify(scheduledInterviews));
        // Dispatch storage event so other tabs/components sync instantly
        window.dispatchEvent(new StorageEvent('storage', { key: 'scheduled_interviews_custom' }));
    }, [scheduledInterviews]);

    useEffect(() => {
        if (typeof window !== 'undefined' && window.location.hash === '#scheduled-interviews') {
            setTimeout(() => {
                const el = document.getElementById('scheduled-interviews');
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            }, 300);
        }
    }, []);

    const [editingInterviewIndex, setEditingInterviewIndex] = useState<number | null>(null);
    const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);

    // View Interview State
    const [viewingInterview, setViewingInterview] = useState<any>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    // Messaging State
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [activeMessageAppId, setActiveMessageAppId] = useState<number | null>(null);
    const [activeMessageAppName, setActiveMessageAppName] = useState('');

    const openMessages = async (appId: number, applicantName: string) => {
        setActiveMessageAppId(appId);
        setActiveMessageAppName(applicantName);
        setIsMessageModalOpen(true);
        setMessages([]); // clear old
        try {
            const response = await axios.get(`/messages/${appId}`);
            setMessages(response.data);

            // Mark as read in local state immediately
            setApplications(prev => prev.map(app => {
                if (app.id === appId) {
                    return { ...app, hasUnreadMessages: false };
                }
                return app;
            }));
        } catch (e: any) {
            console.error(e);
            toast.error("Failed to load messages.");
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeMessageAppId) return;

        try {
            const response = await axios.post(`/messages/${activeMessageAppId}`, {
                content: newMessage
            });

            setMessages([...messages, response.data]);
            setNewMessage('');
        } catch (e: any) {
            console.error(e);
            const errorMsg = e.response?.data?.error || e.message || "Failed to send message.";
            toast.error(errorMsg);
        }
    };

    // Collapsible State
    const [showInterviews, setShowInterviews] = useState(true);

    // Document Viewer State
    const [viewingDocument, setViewingDocument] = useState<{ name: string; url: string; fileName?: string } | null>(null);
    const [isDocViewerOpen, setIsDocViewerOpen] = useState(false);
    const [isZoomed, setIsZoomed] = useState(false);

    const handleViewDocument = (name: string, url: string, fileName?: string) => {
        setViewingDocument({ name, url, fileName });
        setIsDocViewerOpen(true);
        setIsZoomed(false);
    };

    const handleDownload = () => {
        if (!viewingDocument) return;
        const link = document.createElement('a');
        link.href = viewingDocument.url || '#';
        link.download = viewingDocument.fileName || viewingDocument.name || 'document';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleOpenInNewTab = () => {
        if (!viewingDocument) return;
        if (viewingDocument.url.startsWith('data:image')) {
            const newTab = window.open();
            if (newTab) {
                newTab.document.write(
                    `<html><head><title>${viewingDocument.name}</title></head>` +
                    `<body style="margin:0;display:flex;justify-content:center;align-items:center;background:#1e1e24;color:white;font-family:sans-serif;">` +
                    `<img src="${viewingDocument.url}" style="max-width:100%;box-shadow:0 10px 25px rgba(0,0,0,0.5);border-radius:4px;" />` +
                    `</body></html>`
                );
                newTab.document.close();
            } else {
                toast.error("Popup blocked! Please allow popups to view this image in a new tab.");
            }
        } else {
            window.open(viewingDocument.url, '_blank');
        }
    };

    const scoreToPercentage = (score: number) => {
        return Math.min(100, Math.max(0, Math.round(score)));
    };

    const getScoreRating = (score: number) => {
        const percentage = scoreToPercentage(score);
        if (percentage >= 90) return { label: 'Excellent', color: 'green' };
        if (percentage >= 80) return { label: 'Very Good', color: 'blue' };
        if (percentage >= 70) return { label: 'Good', color: 'cyan' };
        if (percentage >= 60) return { label: 'Satisfactory', color: 'yellow' };
        return { label: 'Needs Improvement', color: 'red' };
    };

    const getAiMatch = (score: number) => {
        const percentage = scoreToPercentage(score);
        if (percentage >= 80) return 'High Match';
        if (percentage >= 50) return 'Medium Match';
        return 'Low Match';
    };

    const getMatchIcon = (match: string) => {
        if (match === 'High Match') return <span className="text-green-600">↑</span>;
        if (match === 'Medium Match') return <span className="text-yellow-600">→</span>;
        return <span className="text-red-600">↓</span>;
    };

    const getMatchColor = (match: string) => {
        if (match === 'High Match') return 'bg-green-100 text-green-800';
        if (match === 'Medium Match') return 'bg-yellow-100 text-yellow-800';
        return 'bg-red-100 text-red-800';
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Submitted': return 'bg-blue-100 text-blue-800';
            case 'Under Review': return 'bg-yellow-100 text-yellow-800';
            case 'Shortlisted': return 'bg-green-100 text-green-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            case 'Hired': return 'bg-green-200 text-green-900';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const statuses = ['Submitted', 'Under Review', 'Shortlisted', 'Rejected', 'Hired'];
    const campuses = Array.from(new Set(applications.map(app => app.campus).filter(Boolean)));
    const positions = Array.from(new Set(applications.map(app => app.jobTitle).filter(Boolean))).sort();

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all'
            ? app.status !== 'Archived'
            : app.status === statusFilter;
        const matchesAiMatch = aiMatchFilter === 'all' || getAiMatch(app.aiScore) === aiMatchFilter;
        const matchesCampus = campusFilter === 'all' || app.campus === campusFilter;
        const matchesPosition = positionFilter === 'all' || app.jobTitle === positionFilter;

        return matchesSearch && matchesStatus && matchesAiMatch && matchesCampus && matchesPosition;
    }).sort((a, b) => {
        if (sortBy === 'date') {
            return new Date(b.submittedDate).getTime() - new Date(a.submittedDate).getTime();
        } else if (sortBy === 'score') {
            return b.aiScore - a.aiScore; // Keeps sorting by the raw score as it maps to percentage
        }
        return 0;
    });

    const handleScheduleInterview = () => {
        if (!interviewDate || !interviewTime || !venue) {
            toast.error("Please fill in Date, Time, and Venue.");
            return;
        }

        const interviewData = {
            id: selectedAppId || Date.now(),
            date: interviewDate,
            time: interviewTime,
            panelMembers,
            venue,
            notifyApplicant,
            resultNotes,
            candidateName,
            position,
            applicationId: selectedAppId,
            applicantEmail: selectedAppEmail
        };

        if (editingInterviewIndex !== null) {
            // Update existing
            const updated = [...scheduledInterviews];
            updated[editingInterviewIndex] = interviewData;
            setScheduledInterviews(updated);
            toast.success("Interview updated!");
        } else {
            // Create new
            setScheduledInterviews([...scheduledInterviews, interviewData]);
            toast.success("Interview scheduled successfully!");
        }

        // Automatically update applicant status to 'Shortlisted'
        if (selectedAppId) {
            handleStatusUpdate(selectedAppId, 'Shortlisted');
        }

        // Reset and Close
        resetInterviewForm();
        setIsInterviewModalOpen(false);
    };

    const resetInterviewForm = () => {
        setInterviewDate('');
        setInterviewTime('');
        setPanelMembers('');
        setVenue('');
        setNotifyApplicant(false);
        setResultNotes('');
        setEditingInterviewIndex(null);
        setCandidateName('');
        setPosition('');
        setSelectedAppId(null);
        setSelectedAppEmail('');
    };

    const handleEditInterview = (index: number) => {
        const interview = scheduledInterviews[index];
        setInterviewDate(interview.date);
        setInterviewTime(interview.time);
        setPanelMembers(interview.panelMembers);
        setVenue(interview.venue);
        setNotifyApplicant(interview.notifyApplicant);
        setResultNotes(interview.resultNotes);
        setCandidateName(interview.candidateName || '');
        setPosition(interview.position || '');
        setSelectedAppId(interview.applicationId || null);
        setSelectedAppEmail(interview.applicantEmail || '');
        setEditingInterviewIndex(index);
        setIsInterviewModalOpen(true);
    };

    const handleStatusUpdate = (id: any, newStatus: string) => {
        // Optimistic update for UI feel
        const updatedApps = applications.map(app =>
            String(app.id) === String(id) ? { ...app, status: newStatus } : app
        );
        setApplications(updatedApps);

        // Also update local storage if it's a mock/local application
        if (typeof window !== 'undefined') {
            const localApps = JSON.parse(localStorage.getItem('mock_applications_custom') || '[]');
            const appInLocal = localApps.find((la: any) => String(la.id) === String(id));
            
            const originalApp = getApplications().find((a: any) => String(a.id) === String(id));
            if (originalApp) {
                let updatedLocalApps;
                if (appInLocal) {
                    updatedLocalApps = localApps.map((la: any) =>
                        String(la.id) === String(id) ? { ...la, status: newStatus } : la
                    );
                } else {
                    updatedLocalApps = [...localApps, { ...originalApp, status: newStatus }];
                }
                localStorage.setItem('mock_applications_custom', JSON.stringify(updatedLocalApps));
                // Dispatch storage event
                window.dispatchEvent(new Event('storage'));
            }
        }

        // Only hit backend router for real DB applications
        const isDbApp = serverApplications && serverApplications.some((sa: any) => String(sa.id) === String(id));

        if (isDbApp) {
            // Actual backend call
            router.post(`/admin/applications/${id}/status`, {
                status: newStatus
            }, {
                onSuccess: () => {
                    toast.success(`Applicant status updated to: ${newStatus}`);
                },
                onError: (errors) => {
                    toast.error(`Failed to update status: ${Object.values(errors)[0]}`);
                    // Revert on error
                    setApplications(applications);
                }
            });
        } else {
            toast.success(`Applicant status updated to: ${newStatus} (Mock Local)`);
        }
    };

    const handleDeleteInterview = (index: number) => {
        const updatedInterviews = scheduledInterviews.filter((_, i) => i !== index);
        setScheduledInterviews(updatedInterviews);
    };

    const handleViewInterview = (index) => {
        setViewingInterview(scheduledInterviews[index]);
        setIsViewModalOpen(true);
    };

    return (
        <AdminLayout auth={auth}>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Applicants Overview</h1>
                    <p className="text-gray-600">Reviewing applicants as <span className="text-[#193153] font-bold">{admin.name}</span></p>
                </div>
                {/* Filters */}
                <Card className="mb-6">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input placeholder="Search by name or position..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10" />
                                </div>
                            </div>
                            <Select value={positionFilter} onValueChange={setPositionFilter}>
                                <SelectTrigger><SelectValue placeholder="All Positions" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Positions</SelectItem>
                                    {positions.map(position => <SelectItem key={position} value={position}>{position}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger><SelectValue placeholder="All Status" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Status</SelectItem>
                                    {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                    <SelectItem value="Archived">Archived</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={campusFilter} onValueChange={setCampusFilter}>
                                <SelectTrigger><SelectValue placeholder="All Campuses" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Campuses</SelectItem>
                                    {campuses.map(campus => <SelectItem key={campus} value={campus}>{campus}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <Select value={aiMatchFilter} onValueChange={setAiMatchFilter}>
                                <SelectTrigger><SelectValue placeholder="AI Match" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Matches</SelectItem>
                                    <SelectItem value="High Match">High Match</SelectItem>
                                    <SelectItem value="Medium Match">Medium Match</SelectItem>
                                    <SelectItem value="Low Match">Low Match</SelectItem>
                                </SelectContent>
                            </Select>
                            <Select value={sortBy} onValueChange={setSortBy}>
                                <SelectTrigger><SelectValue placeholder="Sort By" /></SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="date">Latest First</SelectItem>
                                    <SelectItem value="score">Highest Match</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* AI Insights */}
                <Card className="mb-6 bg-blue-50 border-blue-200">
                    <CardContent className="p-6">
                        <div className="flex items-center mb-2">
                            <Star className="h-5 w-5 text-blue-600 mr-2" />
                            <h3 className="font-semibold text-blue-900">Qualification Match Insights</h3>
                        </div>
                        <p className="text-sm text-blue-800 mb-4">Applications are automatically ranked based on job requirements, skills match, and experience.</p>
                        <div className="grid grid-cols-3 gap-4 text-center">
                            <div>
                                <p className="text-2xl font-bold text-green-600">{filteredApplications.filter(a => getAiMatch(a.aiScore) === 'High Match').length}</p>
                                <p className="text-sm text-gray-600">High Match</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-yellow-600">{filteredApplications.filter(a => getAiMatch(a.aiScore) === 'Medium Match').length}</p>
                                <p className="text-sm text-gray-600">Medium Match</p>
                            </div>
                            <div>
                                <p className="text-2xl font-bold text-red-600">{filteredApplications.filter(a => getAiMatch(a.aiScore) === 'Low Match').length}</p>
                                <p className="text-sm text-gray-600">Low Match</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Applicants Table */}
                <Card>
                    <CardContent className="p-6">
                        <div className="flex justify-between items-center mb-4">
                            <p className="text-sm text-gray-600"><span className="font-semibold">{filteredApplications.length}</span> applicants found</p>
                        </div>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Applicant</TableHead>
                                        <TableHead>Position</TableHead>
                                        <TableHead>Campus</TableHead>
                                        <TableHead>Score Percentage</TableHead>
                                        <TableHead>Breakdown</TableHead>
                                        <TableHead>Match</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {filteredApplications.map((app) => (
                                        <TableRow key={app.id}>
                                            <TableCell>
                                                <div>
                                                    <p className="font-medium">{app.applicantName}</p>
                                                    <p className="text-sm text-gray-500">{app.email}</p>
                                                </div>
                                            </TableCell>
                                            <TableCell>{app.jobTitle}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="text-[10px] font-semibold bg-gray-50 border-gray-200">{app.campus ? app.campus.replace('NAAP - ', '') : 'N/A'}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center gap-2">
                                                    <div className="w-24 bg-gray-200 rounded-full h-2">
                                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(scoreToPercentage(app.aiScore || 0), 100)}%` }} />
                                                    </div>
                                                    <span className="text-sm font-semibold">{scoreToPercentage(app.aiScore || 0)}%</span>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Dialog>
                                                    <DialogTrigger asChild>
                                                        <Button variant="ghost" size="sm" className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"><TrendingUp className="w-4 h-4 mr-1" /> View</Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                                                        <DialogHeader><DialogTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-blue-600" /> Score Breakdown - {app.applicantName}</DialogTitle></DialogHeader>
                                                        <div className="space-y-4 pb-4">
                                                            {(() => {
                                                                const breakdown = app.aiScoreBreakdown || { education: 0, experience: 0, accomplishments: 0, training: 0 };
                                                                const totalScore = app.aiScore || 0;
                                                                return (
                                                                    <>
                                                                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
                                                                            <div className="flex items-center justify-between mb-2">
                                                                                <span className="text-sm font-medium text-gray-700">Overall Score</span>
                                                                                <span className="text-2xl font-bold text-[#193153]">{scoreToPercentage(totalScore)}% <span className="text-sm text-gray-500">Match Score</span></span>
                                                                            </div>
                                                                            <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                                                                                <div className={`h-3 rounded-full ${scoreToPercentage(totalScore) >= 90 ? 'bg-green-500' : scoreToPercentage(totalScore) >= 80 ? 'bg-blue-500' : scoreToPercentage(totalScore) >= 70 ? 'bg-cyan-500' : scoreToPercentage(totalScore) >= 60 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{ width: `${Math.min(scoreToPercentage(totalScore), 100)}%` }} />
                                                                            </div>
                                                                        </div>
                                                                        <div className="space-y-3">
                                                                            <p className="text-xs font-semibold text-gray-600 uppercase tracking-wide">Score Breakdown</p>

                                                                            {/* Education */}
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                                                    <GraduationCap className="w-4 h-4 text-purple-600" />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center justify-between mb-1">
                                                                                        <span className="text-sm font-medium">Education</span>
                                                                                        <span className="text-sm font-bold">{Math.round((breakdown.education / 5) * 100)}%</span>
                                                                                    </div>
                                                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                                                                        <div className="bg-purple-500 h-1.5 rounded-full" style={{ width: `${(breakdown.education / 5) * 100}%` }} />
                                                                                    </div>
                                                                                    {app.educationLevel ? (
                                                                                        <p className="text-xs text-gray-600 mt-1">
                                                                                            <span className="font-medium">Level:</span> {
                                                                                                app.educationLevel === 'bachelor' ? "Bachelor's Degree" :
                                                                                                    app.educationLevel === 'masters' ? "Master's Degree" :
                                                                                                        app.educationLevel === 'doctoral_9-15' ? "Doctoral (9-15 units)" :
                                                                                                            app.educationLevel === 'doctoral_15-18' ? "Doctoral (15-18 units)" :
                                                                                                                app.educationLevel === 'doctoral_18-24' ? "Doctoral (18-24 units)" :
                                                                                                                    app.educationLevel === 'doctoral_27+' ? "Doctoral (27+ units)" :
                                                                                                                        app.educationLevel === 'doctoral_graduate' ? "Doctoral Graduate" :
                                                                                                                            app.educationLevel
                                                                                            }
                                                                                        </p>
                                                                                    ) : (
                                                                                        <p className="text-xs text-gray-400 italic mt-1">Data not available</p>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Experience */}
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                                                    <Briefcase className="w-4 h-4 text-blue-600" />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center justify-between mb-1">
                                                                                        <span className="text-sm font-medium">Work Experience</span>
                                                                                        <span className="text-sm font-bold">{Math.round((breakdown.experience / 25) * 100)}%</span>
                                                                                    </div>
                                                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                                                                        <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${(breakdown.experience / 25) * 100}%` }} />
                                                                                    </div>
                                                                                    {app.yearsOfExperience !== undefined ? (
                                                                                        <p className="text-xs text-gray-600 mt-1">
                                                                                            <span className="font-medium">Years:</span> {app.yearsOfExperience} years
                                                                                        </p>
                                                                                    ) : (
                                                                                        <p className="text-xs text-gray-400 italic mt-1">Data not available</p>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Awards */}
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                                                                                    <Award className="w-4 h-4 text-yellow-600" />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center justify-between mb-1">
                                                                                        <span className="text-sm font-medium">Awards & Recognition</span>
                                                                                        <span className="text-sm font-bold">{Math.round((breakdown.accomplishments / 5) * 100)}%</span>
                                                                                    </div>
                                                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                                                                        <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${(breakdown.accomplishments / 5) * 100}%` }} />
                                                                                    </div>
                                                                                    {app.awards && app.awards.length > 0 ? (
                                                                                        <p className="text-xs text-gray-600 mt-1">
                                                                                            <span className="font-medium">Received:</span> {app.awards.map((award: string) =>
                                                                                                award === 'national' ? 'National Award' :
                                                                                                    award === 'csc' ? 'CSC Award' :
                                                                                                        award === 'president' ? "President's Award" :
                                                                                                            award === 'ngo' ? 'NGO Award' : award
                                                                                            ).join(', ')}
                                                                                        </p>
                                                                                    ) : (
                                                                                        <p className="text-xs text-gray-500 mt-1">No awards listed</p>
                                                                                    )}
                                                                                </div>
                                                                            </div>

                                                                            {/* Training */}
                                                                            <div className="flex items-center gap-3">
                                                                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                                                                                    <BookOpen className="w-4 h-4 text-green-600" />
                                                                                </div>
                                                                                <div className="flex-1">
                                                                                    <div className="flex items-center justify-between mb-1">
                                                                                        <span className="text-sm font-medium">Training Hours</span>
                                                                                        <span className="text-sm font-bold">{Math.round((breakdown.training / 10) * 100)}%</span>
                                                                                    </div>
                                                                                    <div className="w-full bg-gray-200 rounded-full h-1.5 mb-1">
                                                                                        <div className="bg-green-500 h-1.5 rounded-full" style={{ width: `${(breakdown.training / 10) * 100}%` }} />
                                                                                    </div>
                                                                                    {app.trainingHours !== undefined ? (
                                                                                        <p className="text-xs text-gray-600 mt-1">
                                                                                            <span className="font-medium">Hours:</span> {app.trainingHours} hours
                                                                                        </p>
                                                                                    ) : (
                                                                                        <p className="text-xs text-gray-400 italic mt-1">Data not available</p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </>
                                                                );
                                                            })()}
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="secondary" className={getMatchColor(getAiMatch(app.aiScore))}>
                                                    <span className="flex items-center">
                                                        {getMatchIcon(getAiMatch(app.aiScore))}
                                                        <span className="ml-1">{getAiMatch(app.aiScore)}</span>
                                                    </span>
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(app.status)}>
                                                    {app.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="text-sm">
                                                {new Date(app.submittedDate).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Dialog onOpenChange={(open) => {
                                                         if (open && app.status === 'Submitted') {
                                                             handleStatusUpdate(app.id, 'Under Review');
                                                         }
                                                     }}>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">View</Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle>Applicant Details</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4 text-sm">
                                                                <Tabs defaultValue="application" className="w-full">
                                                                    <TabsList className="grid w-full grid-cols-4 h-9 bg-gray-100/80 rounded-lg p-1 mb-4 border">
                                                                        <TabsTrigger value="application" className="text-xs">Application</TabsTrigger>
                                                                        <TabsTrigger value="personal" className="text-xs">Personal Info</TabsTrigger>
                                                                        <TabsTrigger value="qualifications" className="text-xs">Qualifications</TabsTrigger>
                                                                        <TabsTrigger value="documents" className="text-xs">Documents</TabsTrigger>
                                                                    </TabsList>
                                                                    <TabsContent value="application" className="space-y-4">
                                                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                                                            <h3 className="font-semibold text-gray-900 mb-3 text-sm">Position Details</h3>
                                                                            <div className="grid grid-cols-2 gap-y-2 text-xs">
                                                                                <span className="text-gray-500">Position Applied:</span>
                                                                                <span className="font-semibold text-gray-950 text-right">{app.jobTitle}</span>
                                                                                <span className="text-gray-500">Campus/Location:</span>
                                                                                <span className="font-semibold text-gray-950 text-right">{app.campus ? app.campus.replace('NAAP - ', '') : 'N/A'}</span>
                                                                                <span className="text-gray-500">Date Applied:</span>
                                                                                <span className="font-semibold text-gray-950 text-right">{new Date(app.submittedDate).toLocaleDateString()}</span>
                                                                                <span className="text-gray-500">Current Status:</span>
                                                                                <span className="font-semibold text-right">
                                                                                    <Badge className={`${getStatusColor(app.status)} px-2 py-0.5 text-[10px]`}>{app.status}</Badge>
                                                                                </span>
                                                                            </div>
                                                                        </div>
                                                                        <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200">
                                                                            <div className="flex justify-between items-center mb-3">
                                                                                <h3 className="font-semibold text-blue-900 text-sm">AI Qualification Analysis</h3>
                                                                                <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-2 py-0.5">{app.aiScore}% Match</Badge>
                                                                            </div>
                                                                            <p className="text-xs text-blue-800 leading-relaxed mb-4">
                                                                                <span className="font-semibold">{getAiMatch(app.aiScore)}:</span> This applicant shows {getAiMatch(app.aiScore).toLowerCase()} alignment based on computed education level, years of experience, and training credentials.
                                                                            </p>
                                                                            {(() => {
                                                                                const breakdown = app.aiScoreBreakdown || { education: 0, experience: 0, accomplishments: 0, training: 0 };
                                                                                return (
                                                                                    <div className="space-y-3">
                                                                                        <div>
                                                                                            <div className="flex justify-between text-[11px] mb-1">
                                                                                                <span className="text-gray-600">Education Fit</span>
                                                                                                <span className="font-semibold text-gray-900">{Math.round((breakdown.education / 5) * 100)}%</span>
                                                                                            </div>
                                                                                            <div className="w-full bg-gray-200 rounded-full h-1">
                                                                                                <div className="bg-purple-600 h-1 rounded-full" style={{ width: `${(breakdown.education / 5) * 100}%` }} />
                                                                                            </div>
                                                                                        </div>
                                                                                        <div>
                                                                                            <div className="flex justify-between text-[11px] mb-1">
                                                                                                <span className="text-gray-600">Work Experience Fit</span>
                                                                                                <span className="font-semibold text-gray-900">{Math.round((breakdown.experience / 25) * 100)}%</span>
                                                                                            </div>
                                                                                            <div className="w-full bg-gray-200 rounded-full h-1">
                                                                                                <div className="bg-blue-600 h-1 rounded-full" style={{ width: `${(breakdown.experience / 25) * 100}%` }} />
                                                                                            </div>
                                                                                        </div>
                                                                                        <div>
                                                                                            <div className="flex justify-between text-[11px] mb-1">
                                                                                                <span className="text-gray-600">Awards & Recognition Fit</span>
                                                                                                <span className="font-semibold text-gray-900">{Math.round((breakdown.accomplishments / 5) * 100)}%</span>
                                                                                            </div>
                                                                                            <div className="w-full bg-gray-200 rounded-full h-1">
                                                                                                <div className="bg-yellow-600 h-1 rounded-full" style={{ width: `${(breakdown.accomplishments / 5) * 100}%` }} />
                                                                                            </div>
                                                                                        </div>
                                                                                    </div>
                                                                                );
                                                                            })()}
                                                                        </div>
                                                                    </TabsContent>
                                                                    <TabsContent value="personal" className="space-y-4">
                                                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                                            <div>
                                                                                <h3 className="font-semibold text-gray-900 text-sm border-b pb-1.5 mb-3">Identity & Personal Information</h3>
                                                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                                                                    <div className="flex flex-col"><span className="text-gray-500">First Name</span><span className="font-semibold text-gray-900 mt-0.5">{app.dynamic_responses?.firstName || app.applicantName.split(' ')[0]}</span></div>
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Middle Name</span><span className="font-semibold text-gray-900 mt-0.5">{app.dynamic_responses?.middleName || 'N/A'}</span></div>
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Last Name</span><span className="font-semibold text-gray-900 mt-0.5">{app.dynamic_responses?.lastName || app.applicantName.split(' ').pop()}</span></div>
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Extension Name</span><span className="font-semibold text-gray-900 mt-0.5">{app.dynamic_responses?.extensionName || 'N/A'}</span></div>
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Age</span><span className="font-semibold text-gray-900 mt-0.5">{app.dynamic_responses?.age || 'N/A'}</span></div>
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Sex / Gender</span><span className="font-semibold text-gray-900 mt-0.5 capitalize">{app.dynamic_responses?.sex || 'N/A'}</span></div>
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Civil Status</span><span className="font-semibold text-gray-900 mt-0.5 capitalize">{app.dynamic_responses?.civilStatus || 'N/A'}</span></div>
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Religion</span><span className="font-semibold text-gray-900 mt-0.5 capitalize">{app.dynamic_responses?.religion || 'N/A'}</span></div>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <h3 className="font-semibold text-gray-900 text-sm border-b pb-1.5 mb-3">Demographics</h3>
                                                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Indigenous Group Member</span><span className="font-semibold text-gray-900 mt-0.5">{app.dynamic_responses?.isIP || 'No'}</span></div>
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Person with Disability (PWD)</span><span className="font-semibold text-gray-900 mt-0.5">{app.dynamic_responses?.isPWD || 'No'}</span></div>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <h3 className="font-semibold text-gray-900 text-sm border-b pb-1.5 mb-3">Contact Information</h3>
                                                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Email Address</span><span className="font-semibold text-gray-900 mt-0.5 truncate" title={app.email}>{app.email}</span></div>
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Primary Phone Number</span><span className="font-semibold text-gray-900 mt-0.5">{app.dynamic_responses?.phone_number || app.phone_number || 'N/A'}</span></div>
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Alternate Phone Number</span><span className="font-semibold text-gray-900 mt-0.5">{app.dynamic_responses?.alternateContact || 'N/A'}</span></div>
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Source Referral</span><span className="font-semibold text-gray-900 mt-0.5 capitalize">{app.dynamic_responses?.source ? app.dynamic_responses.source.replace('_', ' ') : 'N/A'}</span></div>
                                                                                    <div className="flex flex-col col-span-2"><span className="text-gray-500">Residential Address</span><span className="font-semibold text-gray-900 mt-0.5 leading-relaxed">{app.dynamic_responses?.address || 'N/A'}</span></div>
                                                                                </div>
                                                                            </div>
                                                                        </div>
                                                                    </TabsContent>
                                                                    <TabsContent value="qualifications" className="space-y-4">
                                                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                                            <div>
                                                                                <h3 className="font-semibold text-gray-900 text-sm border-b pb-1.5 mb-3">Professional Credentials</h3>
                                                                                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Highest Education Attained</span><span className="font-semibold text-gray-900 mt-0.5">{app.education || 'N/A'}</span></div>
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Years of Experience</span><span className="font-semibold text-gray-900 mt-0.5">{app.dynamic_responses?.yearsOfExperience || (app.aiScoreBreakdown?.experience ? Math.max(1, app.aiScoreBreakdown.experience) : 'N/A')} years</span></div>
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Training hours</span><span className="font-semibold text-gray-900 mt-0.5">{app.dynamic_responses?.trainingHours || 'N/A'} hours</span></div>
                                                                                    <div className="flex flex-col"><span className="text-gray-500">Open to other positions?</span><span className="font-semibold text-gray-900 mt-0.5 capitalize">{app.dynamic_responses?.openToOthers || 'Yes'}</span></div>
                                                                                    <div className="flex flex-col col-span-2"><span className="text-gray-500">Detailed Experience Summary</span><span className="font-semibold text-gray-900 mt-0.5 leading-relaxed">{app.experience}</span></div>
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <h3 className="font-semibold text-gray-900 text-sm border-b pb-1.5 mb-2">Awards & Recognition</h3>
                                                                                {app.dynamic_responses?.awards && app.dynamic_responses.awards.length > 0 ? (
                                                                                    <div className="flex flex-wrap gap-1.5 mt-1">
                                                                                        {app.dynamic_responses.awards.map((award: string, i: number) => (
                                                                                            <Badge key={i} variant="outline" className="text-xs bg-amber-50 text-amber-700 border-amber-200 capitalize">
                                                                                                {award.replace('_', ' ')}
                                                                                            </Badge>
                                                                                        ))}
                                                                                    </div>
                                                                                ) : (
                                                                                    <p className="text-xs text-gray-500 italic">No awards listed</p>
                                                                                )}
                                                                            </div>
                                                                            <div>
                                                                                <h3 className="font-semibold text-gray-900 text-sm border-b pb-1.5 mb-2">Verified Skills</h3>
                                                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                                                    {app.skills && app.skills.length > 0 ? (
                                                                                        app.skills.map((skill: string, i: number) => (
                                                                                            <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0.5">{skill}</Badge>
                                                                                        ))
                                                                                    ) : (
                                                                                        <span className="text-xs text-gray-500 italic">No skills listed</span>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            <div>
                                                                                <h3 className="font-semibold text-gray-900 text-sm border-b pb-1.5 mb-2">Civil Service & Board Eligibilities</h3>
                                                                                {app.dynamic_responses?.eligibilities && app.dynamic_responses.eligibilities.length > 0 ? (
                                                                                    <ul className="list-disc pl-4 text-xs text-gray-700 space-y-1 mt-1">
                                                                                        {app.dynamic_responses.eligibilities.map((eligibility: string, i: number) => (
                                                                                            <li key={i} className="font-semibold">{eligibility}</li>
                                                                                        ))}
                                                                                    </ul>
                                                                                ) : (
                                                                                    <p className="text-xs text-gray-500 italic">No CS/Board eligibilities declared</p>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    </TabsContent>
                                                                    <TabsContent value="documents" className="space-y-4">
                                                                        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                                            <div className="space-y-2">
                                                                                <h3 className="font-semibold text-gray-900 text-sm border-b pb-1.5 mb-2">Uploaded Documents</h3>
                                                                                <div className="grid grid-cols-1 gap-2">
                                                                                    {app.documents && app.documents.length > 0 ? (
                                                                                        app.documents.map((doc: any, i: number) => (
                                                                                            <div key={i} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100 shadow-sm animate-fade-in">
                                                                                                <div className="flex items-center overflow-hidden mr-2">
                                                                                                    <FileText className="flex-shrink-0 h-4 w-4 text-blue-500 mr-2" />
                                                                                                    <span className="text-sm text-gray-700 font-medium truncate">{doc.name}</span>
                                                                                                    {doc.fileName && (
                                                                                                        <span className="text-xs text-gray-500 ml-2 italic truncate max-w-[150px]">({doc.fileName})</span>
                                                                                                    )}
                                                                                                </div>
                                                                                                <Button
                                                                                                    variant="ghost"
                                                                                                    size="sm"
                                                                                                    className="h-6 w-6 p-0 hover:bg-blue-100"
                                                                                                    type="button"
                                                                                                    onClick={(e) => {
                                                                                                        e.preventDefault();
                                                                                                        e.stopPropagation();
                                                                                                        handleViewDocument(doc.name, doc.url || '#', doc.fileName);
                                                                                                    }}
                                                                                                >
                                                                                                    <Eye className="h-3 w-3 text-blue-600" />
                                                                                                </Button>
                                                                                            </div>
                                                                                        ))
                                                                                    ) : (
                                                                                        <p className="text-xs text-gray-500 italic">No documents uploaded.</p>
                                                                                    )}
                                                                                </div>
                                                                            </div>
                                                                            {app.toFollowDocs && app.toFollowDocs.length > 0 && (
                                                                                <div className="space-y-2">
                                                                                    <div className="flex items-center gap-2 border-b pb-1.5 mb-2">
                                                                                        <h3 className="font-semibold text-orange-700 text-sm">Pending Requirements</h3>
                                                                                        <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-200">To Follow</Badge>
                                                                                    </div>
                                                                                    <div className="grid grid-cols-1 gap-2">
                                                                                        {app.toFollowDocs.map((docName: string, i: number) => (
                                                                                            <div key={i} className="flex items-center p-2 bg-orange-50/20 rounded border border-orange-100">
                                                                                                <FileText className="flex-shrink-0 h-4 w-4 text-orange-400 mr-2" />
                                                                                                <span className="text-sm text-gray-700 font-medium truncate">{docName}</span>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                            {app.custom_file_responses && Object.keys(app.custom_file_responses).length > 0 && (
                                                                                <div className="space-y-2">
                                                                                    <h3 className="font-semibold text-blue-900 text-sm border-b pb-1.5 mb-2">Custom File Requirements</h3>
                                                                                    <div className="grid grid-cols-1 gap-2">
                                                                                        {Object.entries(app.custom_file_responses).map(([label, path]: [string, any]) => (
                                                                                            <div key={label} className="flex items-center justify-between p-2 bg-white rounded border border-blue-100 shadow-sm">
                                                                                                <div className="flex items-center overflow-hidden mr-2">
                                                                                                    <FileText className="flex-shrink-0 h-4 w-4 text-blue-500 mr-2" />
                                                                                                    <span className="text-sm text-gray-700 font-medium truncate">{label}</span>
                                                                                                </div>
                                                                                                <Button
                                                                                                    variant="ghost"
                                                                                                    size="sm"
                                                                                                    className="h-6 w-6 p-0 hover:bg-blue-100"
                                                                                                    type="button"
                                                                                                    onClick={(e) => {
                                                                                                        e.preventDefault();
                                                                                                        e.stopPropagation();
                                                                                                        window.open(`/storage/${path}`, '_blank');
                                                                                                    }}
                                                                                                >
                                                                                                    <Eye className="h-3 w-3 text-blue-600" />
                                                                                                </Button>
                                                                                            </div>
                                                                                        ))}
                                                                                    </div>
                                                                                </div>
                                                                            )}
                                                                        </div>
                                                                    </TabsContent>
                                                                </Tabs>
                                                                <div className="flex gap-2 pt-2 border-t mt-2">
                                                                    <Button
                                                                        size="sm"
                                                                        className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white"
                                                                        onClick={() => {
                                                                            handleStatusUpdate(app.id, 'Shortlisted');
                                                                        }}
                                                                    >
                                                                        Shortlist
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
                                                                        onClick={() => handleStatusUpdate(app.id, 'Hired')}
                                                                    >
                                                                        Hire
                                                                    </Button>
                                                                    <Button
                                                                        size="sm"
                                                                        variant="destructive"
                                                                        className="flex-1"
                                                                        onClick={() => handleStatusUpdate(app.id, 'Rejected')}
                                                                    >
                                                                        Reject
                                                                    </Button>
                                                                </div>
                                                                <div className="pt-2 border-t flex flex-col gap-2">
                                                                    <div className="flex gap-2">
                                                                        <Button
                                                                            variant="outline"
                                                                            size="sm"
                                                                            className="flex-1 border-gray-300 text-gray-500 hover:bg-gray-100"
                                                                            onClick={() => handleStatusUpdate(app.id, 'Archived')}
                                                                        >
                                                                            <Trash className="mr-2 h-3.5 w-3.5" />
                                                                            Archive
                                                                        </Button>
                                                                        <Button
                                                                            className="flex-[2] bg-purple-600 hover:bg-purple-700 text-white font-bold"
                                                                            onClick={() => {
                                                                                setCandidateName(app.applicantName);
                                                                                setPosition(app.jobTitle);
                                                                                setSelectedAppId(app.id);
                                                                                setSelectedAppEmail(app.email || app.applicantEmail || '');
                                                                                setIsInterviewModalOpen(true);
                                                                            }}
                                                                        >
                                                                            <Calendar className="mr-2 h-4 w-4" />
                                                                            Schedule Interview
                                                                        </Button>
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </DialogContent>
                                                    </Dialog>
                                                    <div className="relative inline-block">
                                                        <Button variant="outline" size="sm" onClick={() => openMessages(app.id, app.applicantName)}>Message</Button>
                                                        {app.hasUnreadMessages && (
                                                            <span className="absolute -top-1 -right-1 flex h-3 w-3">
                                                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500 border border-white"></span>
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>

                {/* Interview Scheduling Module */}
                <Dialog open={isInterviewModalOpen} onOpenChange={setIsInterviewModalOpen}>
                    <DialogTrigger asChild>
                        <Button variant="outline" className="mt-4" onClick={() => resetInterviewForm()}>
                            <Calendar className="h-4 w-4 mr-2" />
                            Schedule Interview
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-lg">
                        <DialogHeader>
                            <DialogTitle>{editingInterviewIndex !== null ? "Edit Interview" : "Schedule Interview"}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <Input
                                    placeholder="Candidate Name"
                                    value={candidateName}
                                    onChange={(e) => setCandidateName(e.target.value)}
                                />
                                <Input
                                    placeholder="Position"
                                    value={position}
                                    onChange={(e) => setPosition(e.target.value)}
                                />
                            </div>
                            <Input
                                type="date"
                                placeholder="Interview Date"
                                value={interviewDate}
                                onChange={(e) => setInterviewDate(e.target.value)}
                            />
                            <Input
                                type="time"
                                placeholder="Interview Time"
                                value={interviewTime}
                                onChange={(e) => setInterviewTime(e.target.value)}
                            />
                            <Input
                                placeholder="Panel Members"
                                value={panelMembers}
                                onChange={(e) => setPanelMembers(e.target.value)}
                            />
                            <Input
                                placeholder="Venue / Online Link"
                                value={venue}
                                onChange={(e) => setVenue(e.target.value)}
                            />
                            <div>
                                <label className="flex items-center">
                                    <input
                                        type="checkbox"
                                        checked={notifyApplicant}
                                        onChange={() => setNotifyApplicant(!notifyApplicant)}
                                        className="mr-2"
                                    />
                                    Notify Applicant
                                </label>
                            </div>
                            <Input
                                placeholder="Interview Result Notes"
                                value={resultNotes}
                                onChange={(e) => setResultNotes(e.target.value)}
                            />

                            <div className="flex justify-end">
                                <Button
                                    className="bg-blue-600 hover:bg-blue-700"
                                    onClick={handleScheduleInterview}
                                >
                                    {editingInterviewIndex !== null ? "Update Schedule" : "Schedule"}
                                </Button>
                            </div>
                        </div>
                    </DialogContent>

                </Dialog>

                {/* View Interview Details Dialog */}
                <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Interview Details</DialogTitle>
                        </DialogHeader>
                        {viewingInterview && (
                            <div className="space-y-4">
                                <div className="border-b pb-3">
                                    <p className="text-sm text-gray-500 uppercase tracking-wide">Candidate</p>
                                    <p className="text-lg font-bold text-[#193153]">{viewingInterview.candidateName || 'N/A'}</p>
                                    <p className="text-sm text-gray-600">{viewingInterview.position || 'N/A'}</p>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-sm text-gray-500">Date</p>
                                        <p className="font-medium">{new Date(viewingInterview.date).toLocaleDateString()}</p>
                                    </div>
                                    <div>
                                        <p className="text-sm text-gray-500">Time</p>
                                        <p className="font-medium">{viewingInterview.time}</p>
                                    </div>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Venue / Platform</p>
                                    <p className="font-medium">{viewingInterview.venue}</p>
                                </div>
                                <div>
                                    <p className="text-sm text-gray-500">Panel Members</p>
                                    <p className="font-medium">{viewingInterview.panelMembers || 'Not assigned'}</p>
                                </div>
                                {viewingInterview.resultNotes && (
                                    <div className="bg-gray-50 p-3 rounded-md">
                                        <p className="text-sm text-gray-500 mb-1">Notes</p>
                                        <p className="text-sm text-gray-700">{viewingInterview.resultNotes}</p>
                                    </div>
                                )}
                                <div className="flex justify-end pt-2">
                                    <Button onClick={() => setIsViewModalOpen(false)}>Close</Button>
                                </div>
                            </div>
                        )}
                    </DialogContent>
                </Dialog>
                {/* Scheduled Interviews Section */}
                <Card id="scheduled-interviews" className="mt-6">
                    <CardContent className="pt-6">
                        <div className="flex justify-between items-center mb-4 cursor-pointer" onClick={() => setShowInterviews(!showInterviews)}>
                            <h2 className="text-xl font-bold">Scheduled Interviews</h2>
                            <Button variant="ghost" size="sm">
                                {showInterviews ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                            </Button>
                        </div>

                        {showInterviews && (
                            <ul className="divide-y divide-gray-200">
                                {scheduledInterviews.length === 0 ? (
                                    <li className="py-4 text-gray-500 text-center italic">No scheduled interviews.</li>
                                ) : (
                                    scheduledInterviews.map((interview, index) => (
                                        <li key={index} className="py-4 flex justify-between items-start">
                                            <div>
                                                {interview.candidateName && (
                                                    <p className="text-lg font-semibold text-[#193153]">{interview.candidateName}</p>
                                                )}
                                                {interview.position && (
                                                    <p className="text-sm text-gray-600 mb-2">{interview.position}</p>
                                                )}
                                                <div className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
                                                    <p><strong className="font-medium">Date:</strong> {new Date(interview.date).toLocaleDateString()}</p>
                                                    <p><strong className="font-medium">Time:</strong> {interview.time}</p>
                                                    <p><strong className="font-medium">Panel:</strong> {interview.panelMembers}</p>
                                                    <p><strong className="font-medium">Venue:</strong> {interview.venue}</p>
                                                </div>
                                                {interview.notifyApplicant && <span className="text-green-600 text-xs font-bold mt-1 block">✓ Applicant notified</span>}
                                                {interview.resultNotes && <p className="mt-2 text-sm bg-gray-50 p-2 rounded"><strong>Notes:</strong> {interview.resultNotes}</p>}
                                            </div>
                                            <div className="flex items-center space-x-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleEditInterview(index)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => handleDeleteInterview(index)}
                                                >
                                                    <Trash className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewInterview(index)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </li>
                                    ))
                                )}
                            </ul>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Document Viewer Modal */}
            <Dialog open={isDocViewerOpen} onOpenChange={setIsDocViewerOpen}>
                <DialogContent className="max-w-4xl h-[80vh] flex flex-col p-0">
                    <DialogHeader className="px-6 py-4 border-b flex-shrink-0">
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            {viewingDocument?.name || 'Document Viewer'}
                            {viewingDocument?.fileName && <span className="text-sm font-normal text-gray-500 ml-2">({viewingDocument.fileName})</span>}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Dedicated Document Toolbar */}
                    {viewingDocument?.url && (
                        <div className="bg-white border-b px-6 py-2 flex items-center justify-between flex-shrink-0 shadow-sm">
                            <span className="text-xs text-gray-500 font-medium">
                                {viewingDocument.url.startsWith('data:image') ? '💡 Click the document image below to zoom in/out' : '📄 Document preview'}
                            </span>
                            <div className="flex gap-2">
                                <Button variant="outline" size="sm" onClick={handleOpenInNewTab} className="h-8 text-xs border-gray-300 text-gray-700 hover:bg-gray-100 py-1 px-3">
                                    <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                                    Open in New Tab
                                </Button>
                                <Button variant="outline" size="sm" onClick={handleDownload} className="h-8 text-xs border-gray-300 text-gray-700 hover:bg-gray-100 py-1 px-3">
                                    <Download className="h-3.5 w-3.5 mr-1.5" />
                                    Download
                                </Button>
                            </div>
                        </div>
                    )}

                    <div className={`flex-1 bg-gray-100 p-6 overflow-auto relative ${isZoomed ? 'block text-center' : 'flex items-center justify-center'}`}>
                        {/* Real File Viewer */}
                        {viewingDocument?.url && viewingDocument.url.startsWith('data:') ? (
                            viewingDocument.url.startsWith('data:image') ? (
                                <img
                                    src={viewingDocument.url}
                                    alt={viewingDocument.name}
                                    onClick={() => setIsZoomed(!isZoomed)}
                                    className={`${isZoomed ? 'w-[150%] max-w-none mx-auto cursor-zoom-out' : 'max-w-full max-h-full object-contain cursor-zoom-in'} shadow-lg border border-gray-300 rounded-md bg-white transition-all duration-200`}
                                    title="Click to zoom in/out"
                                />
                            ) : (
                                <iframe
                                    src={viewingDocument.url}
                                    className="w-full h-full shadow-lg border border-gray-300 rounded-md bg-white"
                                    title={viewingDocument.name}
                                />
                            )
                        ) : (
                            /* Mock PDF Viewer / Placeholder */
                            <div className="bg-white shadow-lg w-full h-full p-8 flex flex-col items-center justify-center border border-gray-300 rounded-md">
                                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                                    <FileText className="h-12 w-12 text-gray-400" />
                                </div>
                                <h3 className="text-xl font-semibold text-gray-800 mb-2">{viewingDocument?.name}</h3>
                                <p className="text-gray-500 mb-8 max-w-md text-center">
                                    This is a simulation of the uploaded document content within the secure admin portal.
                                </p>
                                <div className="flex gap-4">
                                    <Button variant="outline" onClick={() => setIsDocViewerOpen(false)}>
                                        Close Preview
                                    </Button>
                                    <Button className="bg-blue-600 text-white hover:bg-blue-700" onClick={handleDownload}>
                                        <Download className="h-4 w-4 mr-2" />
                                        Download File
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Applicant Messaging Modal */}
            <Dialog open={isMessageModalOpen} onOpenChange={setIsMessageModalOpen}>
                <DialogContent className="max-w-xl h-[80vh] flex flex-col p-0 overflow-hidden bg-gray-50">
                    <DialogHeader className="px-6 py-4 border-b bg-white flex-shrink-0">
                        <DialogTitle className="flex items-center gap-2 text-lg">
                            <span className="bg-blue-100 text-blue-700 p-1.5 rounded-full">
                                <Users className="h-4 w-4" />
                            </span>
                            Messages with {activeMessageAppName}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                <div className="p-4 bg-gray-100 rounded-full">
                                    <FileText className="h-8 w-8" />
                                </div>
                                <p>No messages yet. Send the first message!</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isSenderAdmin = msg.sender?.email === admin.email || ['admin@naap.edu.ph', 'admin@admin.com'].includes(msg.sender?.email);
                                return (
                                    <div key={idx} className={`flex max-w-[80%] ${isSenderAdmin ? 'ml-auto' : 'mr-auto'}`}>
                                        <div className={`p-3 rounded-2xl ${isSenderAdmin
                                            ? 'bg-blue-600 text-white rounded-tr-sm'
                                            : 'bg-white border text-gray-800 rounded-tl-sm shadow-sm'
                                            }`}>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-[10px] font-bold uppercase tracking-wider ${isSenderAdmin ? 'text-blue-200' : 'text-gray-500'}`}>
                                                    {isSenderAdmin ? 'You' : msg.sender?.name}
                                                </span>
                                            </div>
                                            <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    <div className="p-4 bg-white border-t flex-shrink-0">
                        <form
                            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                            className="flex gap-2"
                        >
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type your message to the applicant..."
                                className="flex-1"
                            />
                            <Button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-6"
                            >
                                Send
                            </Button>
                        </form>
                    </div>
                </DialogContent>
            </Dialog>

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
        </AdminLayout>
    );
}
