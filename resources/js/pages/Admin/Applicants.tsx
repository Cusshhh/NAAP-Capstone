import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Shield, Users, LogOut, Search, Download, Star, Calendar, Eye, Edit, Trash, Plus, ChevronDown, ChevronUp, Briefcase, Layout, TrendingUp, GraduationCap, Award, BookOpen, FileText } from 'lucide-react';
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

    // State to hold scheduled interviews - Initialize with Mock Data
    const [scheduledInterviews, setScheduledInterviews] = useState<any[]>(mockInterviews.map(m => ({
        ...m,
        venue: m.type,
        panelMembers: 'HR Panel',
        notifyApplicant: true
    })));
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

    const handleViewDocument = (name: string, url: string, fileName?: string) => {
        setViewingDocument({ name, url, fileName });
        setIsDocViewerOpen(true);
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
            date: interviewDate,
            time: interviewTime,
            panelMembers,
            venue,
            notifyApplicant,
            resultNotes,
            candidateName,
            position
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
        setEditingInterviewIndex(index);
        setIsInterviewModalOpen(true);
    };

    const handleStatusUpdate = (id: number, newStatus: string) => {
        // Optimistic update for UI feel
        const updatedApps = applications.map(app =>
            app.id === id ? { ...app, status: newStatus } : app
        );
        setApplications(updatedApps);

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
                                                    <Dialog>
                                                        <DialogTrigger asChild>
                                                            <Button variant="outline" size="sm">View</Button>
                                                        </DialogTrigger>
                                                        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                                                            <DialogHeader>
                                                                <DialogTitle>Applicant Details</DialogTitle>
                                                            </DialogHeader>
                                                            <div className="space-y-4 text-sm">
                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-1">
                                                                        <h4 className="font-semibold text-gray-900">Application</h4>
                                                                        <p className="flex justify-between"><span className="text-gray-500">Position:</span> <span>{app.jobTitle}</span></p>
                                                                        <p className="flex justify-between"><span className="text-gray-500">Campus:</span> <span>{app.campus ? app.campus.replace('NAAP - ', '') : 'N/A'}</span></p>
                                                                        <p className="flex justify-between"><span className="text-gray-500">Applied:</span> <span>{new Date(app.submittedDate).toLocaleDateString()}</span></p>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <h4 className="font-semibold text-gray-900">Personal Info</h4>
                                                                        <p className="flex justify-between"><span className="text-gray-500">Name:</span> <span className="font-medium">{app.applicantName}</span></p>
                                                                        <p className="flex justify-between"><span className="text-gray-500">Email:</span> <span className="truncate w-32 text-right" title={app.email}>{app.email}</span></p>

                                                                    </div>
                                                                </div>

                                                                <div className="grid grid-cols-2 gap-4">
                                                                    <div className="space-y-1">
                                                                        <h4 className="font-semibold text-gray-900">Education</h4>
                                                                        <p className="text-gray-700 leading-tight">{app.education}</p>
                                                                    </div>
                                                                    <div className="space-y-1">
                                                                        <h4 className="font-semibold text-gray-900">Experience</h4>
                                                                        <p className="text-gray-700 leading-tight">{app.experience}</p>
                                                                    </div>
                                                                </div>

                                                                <div>
                                                                    <h4 className="font-semibold text-gray-900 mb-1">Skills</h4>
                                                                    <div className="flex flex-wrap gap-1.5">
                                                                        {app.skills.map((skill: string, i: number) => (
                                                                            <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0">{skill}</Badge>
                                                                        ))}
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-2">
                                                                    <h4 className="font-semibold text-gray-900">Uploaded Documents</h4>
                                                                    <div className="grid grid-cols-1 gap-2">
                                                                        {app.documents && app.documents.length > 0 ? (
                                                                            app.documents.map((doc: any, i: number) => (
                                                                                <div key={i} className="flex items-center justify-between p-2 bg-gray-50 rounded border border-gray-100">
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
                                                                        <div className="flex items-center gap-2">
                                                                            <h4 className="font-semibold text-orange-700">Pending Requirements</h4>
                                                                            <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-200">To Follow</Badge>
                                                                        </div>
                                                                        <div className="grid grid-cols-1 gap-2">
                                                                            {app.toFollowDocs.map((docName: string, i: number) => (
                                                                                <div key={i} className="flex items-center p-2 bg-orange-50/50 rounded border border-orange-100">
                                                                                    <FileText className="flex-shrink-0 h-4 w-4 text-orange-400 mr-2" />
                                                                                    <span className="text-sm text-gray-700 font-medium truncate">{docName}</span>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}

                                                                {app.custom_file_responses && Object.keys(app.custom_file_responses).length > 0 && (
                                                                    <div className="space-y-2">
                                                                        <h4 className="font-semibold text-blue-900 border-t pt-2 mt-2">Custom File Requirements</h4>
                                                                        <div className="grid grid-cols-1 gap-2">
                                                                            {Object.entries(app.custom_file_responses).map(([label, path]: [string, any]) => (
                                                                                <div key={label} className="flex items-center justify-between p-2 bg-blue-50/30 rounded border border-blue-100">
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

                                                                <div className="bg-blue-50 p-3 rounded-md">
                                                                    <div className="flex justify-between items-center mb-1">
                                                                        <h4 className="font-semibold text-blue-900 text-xs uppercase tracking-wide">AI Analysis</h4>
                                                                        <Badge variant="outline" className="bg-white text-blue-700 border-blue-200">{app.aiScore}% Match</Badge>
                                                                    </div>
                                                                    <p className="text-xs text-blue-800 leading-relaxed">
                                                                        <span className="font-medium">{getAiMatch(app.aiScore)}:</span> Evaluation based on skills alignment and experience.
                                                                    </p>
                                                                </div>

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
                                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
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
                <Card className="mt-6">
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
                    <div className="flex-1 bg-gray-100 p-4 overflow-hidden flex items-center justify-center relative">
                        {/* Real File Viewer */}
                        {viewingDocument?.url && viewingDocument.url.startsWith('data:') ? (
                            viewingDocument.url.startsWith('data:image') ? (
                                <img
                                    src={viewingDocument.url}
                                    alt={viewingDocument.name}
                                    className="max-w-full max-h-full object-contain shadow-lg border border-gray-300 rounded-md bg-white"
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
                                    <Button className="bg-blue-600 text-white hover:bg-blue-700">
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
