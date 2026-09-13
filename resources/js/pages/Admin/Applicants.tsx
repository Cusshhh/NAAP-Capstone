import { Link, router } from '@inertiajs/react';
import axios from 'axios';
import { Shield, Users, LogOut, Search, Download, Star, Calendar, Eye, Edit, Trash, Plus, ChevronDown, ChevronUp, Briefcase, Layout, TrendingUp, GraduationCap, Award, BookOpen, FileText, ExternalLink, X, Send, RotateCcw, ArrowLeft } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
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
    const [isReportModalOpen, setIsReportModalOpen] = useState(false);
    const [reportStatus, setReportStatus] = useState('all');
    const [reportPosition, setReportPosition] = useState('all');

    const handleDownloadReport = () => {
        window.location.href = `/admin/reports/export?status=${encodeURIComponent(reportStatus)}&position=${encodeURIComponent(reportPosition)}`;
        setIsReportModalOpen(false);
    };
    const [applications, setApplications] = useState(serverApplications || getApplications()); // Use server data if available

    const [viewedAppIds, setViewedAppIds] = useState<Set<any>>(() => {
        if (typeof window !== 'undefined') {
            try {
                const saved = localStorage.getItem('viewed_applicant_ids');
                return saved ? new Set(JSON.parse(saved)) : new Set();
            } catch (e) {
                return new Set();
            }
        }
        return new Set();
    });

    const markAsViewed = (appId: any) => {
        setViewedAppIds(prev => {
            const next = new Set(prev);
            next.add(String(appId));
            if (typeof window !== 'undefined') {
                localStorage.setItem('viewed_applicant_ids', JSON.stringify(Array.from(next)));
            }
            return next;
        });
    };

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

    // State to hold scheduled interviews
    const [scheduledInterviews, setScheduledInterviews] = useState<any[]>([]);

    useEffect(() => {
        const loadInterviews = async () => {
            try {
                const response = await axios.get('/admin/interviews');
                // Format the backend data to match the UI expectation
                const dbInterviews = response.data.map((int: any) => ({
                    ...int,
                    applicationId: int.application_id,
                    applicantEmail: int.applicant_email,
                    candidateName: int.candidate_name,
                    panelMembers: int.panel_members,
                    resultNotes: int.result_notes,
                }));
                // Merge/fallback with custom localstorage if needed
                const localSaved = JSON.parse(localStorage.getItem('scheduled_interviews_custom') || '[]');
                const combined = [...dbInterviews, ...localSaved].reduce((acc: any[], item: any) => {
                    const idKey = item.applicationId || item.application_id || item.id;
                    if (!acc.some(x => (x.applicationId || x.application_id || x.id) === idKey)) {
                        acc.push(item);
                    }
                    return acc;
                }, []);
                setScheduledInterviews(combined);
            } catch (e) {
                console.error("Failed to fetch interviews", e);
                // Fallback to local storage if API fails
                const localSaved = JSON.parse(localStorage.getItem('scheduled_interviews_custom') || '[]');
                setScheduledInterviews(localSaved);
            }
        };
        loadInterviews();
    }, []);

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

    // Rejection State
    const [isRejectionModalOpen, setIsRejectionModalOpen] = useState(false);
    const [rejectionAppId, setRejectionAppId] = useState<any>(null);
    const [rejectionReason, setRejectionReason] = useState('Minimum educational requirements not met');
    const [customRejectionReason, setCustomRejectionReason] = useState('');

    // Messaging State
    const [messages, setMessages] = useState<any[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);
    const [isChatMinimized, setIsChatMinimized] = useState(false);
    const [activeMessageAppId, setActiveMessageAppId] = useState<number | null>(null);
    const [activeMessageAppName, setActiveMessageAppName] = useState('');

    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    }, [messages, isMessageModalOpen, isChatMinimized]);

    const openMessages = (appId: any, applicantName: string, jobTitle?: string, email?: string) => {
        const matching = (applications || []).find((a: any) => String(a.id) === String(appId));
        const targetEmail = email || (matching ? matching.email : '');
        router.visit(`/admin/messages?appId=${appId}&email=${encodeURIComponent(targetEmail || '')}`);
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

    const getAppAiData = (app: any) => {
        if (!app) return { rawScore: 0, percentage: 0, match: 'Low Match', breakdown: { education: 0, experience: 0, accomplishments: 0, training: 0 } };

        const dyn = app.dynamic_responses || {};
        const edLevel = dyn.educationLevel || app.educationLevel || 'bachelor';
        const yrs = parseFloat(String(dyn.yearsOfExperience || app.yearsOfExperience || '0')) || 0;
        const hrs = parseFloat(String(dyn.trainingHours || app.trainingHours || '0')) || 0;
        const awds = Array.isArray(dyn.awards) ? dyn.awards : (Array.isArray(app.awards) ? app.awards : []);

        // 1. Education score (0 to 5)
        let edScore = 1; // Bachelor's baseline
        if (edLevel === 'doctoral_graduate' || edLevel === 'doctoral_27+') edScore = 5;
        else if (edLevel === 'doctoral_18-24' || edLevel === 'doctoral_15-18') edScore = 4;
        else if (edLevel === 'doctoral_9-15' || edLevel === 'masters') edScore = 3;

        // 2. Experience score (0 to 25, 2 points per year)
        const expScore = Math.min(25, Math.max(0, Math.round(yrs * 2)));

        // 3. Accomplishments / Awards score (0 to 5)
        let awdScore = 0;
        if (awds.includes('national')) awdScore = 5;
        else if (awds.includes('csc')) awdScore = 4;
        else if (awds.includes('president')) awdScore = 3;
        else if (awds.includes('ngo') || awds.length > 0) awdScore = 2;

        // 4. Training hours score (0 to 10)
        let trnScore = 0;
        if (hrs >= 300) trnScore = 10;
        else if (hrs >= 200) trnScore = 8;
        else if (hrs >= 100) trnScore = 6;
        else if (hrs >= 50) trnScore = 4;
        else if (hrs >= 16) trnScore = 2;

        const breakdown = app.aiScoreBreakdown || {
            education: edScore,
            experience: expScore,
            accomplishments: awdScore,
            training: trnScore
        };

        const rawScore = (app.aiScore !== undefined && app.aiScore !== null && app.aiScore > 0)
            ? app.aiScore
            : (edScore + expScore + awdScore + trnScore);

        let percentage = 0;
        if (rawScore <= 45 && rawScore > 0) {
            percentage = Math.min(100, Math.max(0, Math.round((rawScore / 45) * 100)));
        } else {
            percentage = Math.min(100, Math.max(0, Math.round(rawScore)));
        }

        let match = 'Low Match';
        if (percentage >= 80) match = 'High Match';
        else if (percentage >= 50) match = 'Medium Match';

        return {
            rawScore,
            percentage,
            match,
            breakdown
        };
    };

    const scoreToPercentage = (score: number) => {
        if (score <= 45 && score > 0) {
            return Math.min(100, Math.max(0, Math.round((score / 45) * 100)));
        }
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

    const getFormattedStatus = (app: any) => {
        if (!app) return 'Submitted';
        const rawStatus = app.status || 'Submitted';
        const prev = app.previous_status || app.dynamic_responses?.previous_status;

        if (rawStatus === 'Archived') {
            if (prev && prev !== 'Archived') {
                return `${prev} / Archived`;
            }
            return 'Archived';
        }

        return rawStatus;
    };

    const getStatusColor = (status: string) => {
        if (!status) return 'bg-gray-100 text-gray-800';
        if (status.includes('Rejected')) return 'bg-red-100 text-red-800 border border-red-200';
        if (status.includes('Hired')) return 'bg-emerald-100 text-emerald-900 border border-emerald-200';
        if (status.includes('Under Review')) return 'bg-amber-100 text-amber-800 border border-amber-200';
        if (status.includes('Submitted')) return 'bg-blue-100 text-blue-800 border border-blue-200';
        if (status.includes('Archived')) return 'bg-gray-100 text-gray-700 border border-gray-200';
        return 'bg-gray-100 text-gray-800';
    };

    const statuses = ['Submitted', 'Under Review', 'Rejected', 'Hired'];
    const campuses = Array.from(new Set(applications.map(app => app.campus).filter(Boolean)));
    const positions = Array.from(new Set(applications.map(app => app.jobTitle).filter(Boolean))).sort();

    const filteredApplications = applications.filter(app => {
        const matchesSearch = app.applicantName.toLowerCase().includes(searchTerm.toLowerCase()) || app.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());
        const formattedStatus = getFormattedStatus(app);
        const prevStatus = app.previous_status || app.dynamic_responses?.previous_status;

        let matchesStatus = true;
        if (statusFilter === 'all') {
            matchesStatus = app.status !== 'Archived' && !formattedStatus.includes('/ Archived');
        } else if (statusFilter === 'Archived') {
            matchesStatus = app.status === 'Archived' || formattedStatus.includes('/ Archived');
        } else if (statusFilter === 'Pending Review' || statusFilter === 'Pending') {
            matchesStatus = ['Submitted', 'Under Review'].includes(app.status) || ['Submitted', 'Under Review'].includes(prevStatus || '');
        } else {
            matchesStatus = app.status === statusFilter || prevStatus === statusFilter || formattedStatus.startsWith(statusFilter);
        }

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

    // Grouped Applicant Modal & Account Management State
    const [selectedApplicantModal, setSelectedApplicantModal] = useState<any | null>(null);
    const [activeAppIndexInModal, setActiveAppIndexInModal] = useState(0);
    const [viewingAppDetails, setViewingAppDetails] = useState<any | null>(null);
    const [deleteUserModal, setDeleteUserModal] = useState<{ isOpen: boolean; applicant: any | null }>({
        isOpen: false,
        applicant: null,
    });

    const handleDeleteApplicantAccount = (applicant: any) => {
        setDeleteUserModal({ isOpen: true, applicant });
    };

    const confirmDeleteApplicantAccount = () => {
        const applicant = deleteUserModal.applicant;
        setDeleteUserModal({ isOpen: false, applicant: null });
        if (!applicant) return;

        if (applicant.userId) {
            router.delete(`/admin/users/${applicant.userId}`, {
                onSuccess: () => {
                    toast.success(`User account for ${applicant.applicantName} deleted successfully.`);
                    setSelectedApplicantModal(null);
                },
                onError: (err: any) => {
                    toast.error((Object.values(err)[0] as string) || "Failed to delete user account.");
                }
            });
        } else {
            setApplications(prev => prev.filter(a => (a.email || '').toLowerCase() !== (applicant.email || '').toLowerCase()));
            toast.success(`Applicant records for ${applicant.applicantName} removed.`);
            setSelectedApplicantModal(null);
        }
    };

    // Single Job Application Delete Modal State
    const [deleteAppModal, setDeleteAppModal] = useState<{
        isOpen: boolean;
        appId: any;
        jobTitle: string;
        applicantName: string;
    }>({
        isOpen: false,
        appId: null,
        jobTitle: '',
        applicantName: '',
    });

    const handleDeleteSingleApplication = (appId: any, jobTitle: string, applicantName: string) => {
        setDeleteAppModal({
            isOpen: true,
            appId,
            jobTitle,
            applicantName,
        });
    };

    const confirmDeleteApplication = () => {
        const { appId, jobTitle, applicantName } = deleteAppModal;
        setDeleteAppModal({ isOpen: false, appId: null, jobTitle: '', applicantName: '' });
        if (!appId) return;

        const performLocalRemove = () => {
            setApplications(prev => prev.filter(a => String(a.id) !== String(appId)));

            if (typeof window !== 'undefined') {
                const localApps = JSON.parse(localStorage.getItem('mock_applications_custom') || '[]');
                const updatedLocal = localApps.filter((la: any) => String(la.id) !== String(appId));
                localStorage.setItem('mock_applications_custom', JSON.stringify(updatedLocal));
                window.dispatchEvent(new Event('storage'));
            }

            if (selectedApplicantModal) {
                const remaining = selectedApplicantModal.applications.filter((a: any) => String(a.id) !== String(appId));
                if (remaining.length === 0) {
                    setSelectedApplicantModal(null);
                    setViewingAppDetails(null);
                } else {
                    setSelectedApplicantModal((prev: any) => ({
                        ...prev,
                        applications: remaining,
                        totalApplications: remaining.length,
                    }));
                    setViewingAppDetails(null);
                }
            }
            toast.success(`Job application for "${jobTitle}" deleted.`);
        };

        const isDbApp = serverApplications && serverApplications.some((sa: any) => String(sa.id) === String(appId));

        if (isDbApp) {
            router.delete(`/admin/applications/${appId}`, {
                onSuccess: () => {
                    performLocalRemove();
                },
                onError: (err: any) => {
                    toast.error((Object.values(err)[0] as string) || "Failed to delete job application.");
                }
            });
        } else {
            performLocalRemove();
        }
    };

    const groupedApplicants = React.useMemo(() => {
        const map = new Map<string, any>();

        filteredApplications.forEach(app => {
            const emailKey = (app.email || '').toLowerCase().trim() || (app.applicantName || '').toLowerCase().trim();
            const isNew = (app.status === 'Submitted' || app.status === 'Pending Review') && !viewedAppIds.has(String(app.id));
            if (!map.has(emailKey)) {
                map.set(emailKey, {
                    email: app.email,
                    applicantName: app.applicantName,
                    userId: app.userId || null,
                    avatarUrl: app.avatarUrl || app.dynamic_responses?.photo || null,
                    applications: [app],
                    appliedPositions: app.jobTitle ? [app.jobTitle] : [],
                    totalApplications: 1,
                    topScore: app.aiScore || 0,
                    latestSubmittedDate: app.submittedDate,
                    latestStatus: getFormattedStatus(app),
                    hasUnreadMessages: !!app.hasUnreadMessages,
                    hasNewSubmission: isNew,
                });
            } else {
                const existing = map.get(emailKey);
                existing.applications.push(app);
                if (app.jobTitle && !existing.appliedPositions.includes(app.jobTitle)) {
                    existing.appliedPositions.push(app.jobTitle);
                }
                existing.totalApplications = existing.applications.length;
                if ((app.aiScore || 0) > existing.topScore) {
                    existing.topScore = app.aiScore || 0;
                }
                if (new Date(app.submittedDate).getTime() > new Date(existing.latestSubmittedDate).getTime()) {
                    existing.latestSubmittedDate = app.submittedDate;
                    existing.latestStatus = getFormattedStatus(app);
                }
                if (app.userId && !existing.userId) {
                    existing.userId = app.userId;
                }
                if (app.avatarUrl && !existing.avatarUrl) {
                    existing.avatarUrl = app.avatarUrl;
                }
                if (app.hasUnreadMessages) {
                    existing.hasUnreadMessages = true;
                }
                if (isNew) {
                    existing.hasNewSubmission = true;
                }
            }
        });

        return Array.from(map.values()).sort((a, b) => {
            if (sortBy === 'date') {
                return new Date(b.latestSubmittedDate).getTime() - new Date(a.latestSubmittedDate).getTime();
            } else if (sortBy === 'score') {
                return b.topScore - a.topScore;
            }
            return 0;
        });
    }, [filteredApplications, viewedAppIds, sortBy]);

    const handleScheduleInterview = async () => {
        if (!interviewDate || !interviewTime || !venue) {
            toast.error("Please fill in Date, Time, and Venue.");
            return;
        }

        const isMock = typeof selectedAppId === 'string' && selectedAppId.startsWith('mock_');
        let dbInterview: any = null;

        if (!isMock && selectedAppId) {
            try {
                const payload = {
                    application_id: selectedAppId,
                    date: interviewDate,
                    time: interviewTime,
                    panel_members: panelMembers,
                    venue: venue,
                    notify_applicant: notifyApplicant,
                    result_notes: resultNotes,
                    candidate_name: candidateName,
                    position: position,
                    applicant_email: selectedAppEmail
                };

                if (editingInterviewIndex !== null) {
                    const existing = scheduledInterviews[editingInterviewIndex];
                    if (existing && existing.id && !String(existing.id).startsWith('mock_') && typeof existing.id === 'number') {
                        const response = await axios.put(`/admin/interviews/${existing.id}`, payload);
                        dbInterview = {
                            ...response.data,
                            applicationId: response.data.application_id,
                            applicantEmail: response.data.applicant_email,
                            candidateName: response.data.candidate_name,
                            panelMembers: response.data.panel_members,
                            resultNotes: response.data.result_notes,
                        };
                    } else {
                        const response = await axios.post('/admin/interviews', payload);
                        dbInterview = {
                            ...response.data,
                            applicationId: response.data.application_id,
                            applicantEmail: response.data.applicant_email,
                            candidateName: response.data.candidate_name,
                            panelMembers: response.data.panel_members,
                            resultNotes: response.data.result_notes,
                        };
                    }
                } else {
                    const response = await axios.post('/admin/interviews', payload);
                    dbInterview = {
                        ...response.data,
                        applicationId: response.data.application_id,
                        applicantEmail: response.data.applicant_email,
                        candidateName: response.data.candidate_name,
                        panelMembers: response.data.panel_members,
                        resultNotes: response.data.result_notes,
                    };
                }
            } catch (e: any) {
                console.error(e);
                toast.error(e.response?.data?.error || "Failed to save interview in the database.");
                return;
            }
        }

        const interviewData = dbInterview || {
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

        // Automatically update applicant status to 'Interview Scheduled'
        if (selectedAppId) {
            handleStatusUpdate(selectedAppId, 'Interview Scheduled');
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
        let formattedDate = '';
        if (interview.date) {
            try {
                formattedDate = new Date(interview.date).toISOString().split('T')[0];
            } catch (e) {
                formattedDate = interview.date;
            }
        }
        setInterviewDate(formattedDate);
        setInterviewTime(interview.time);
        setPanelMembers(interview.panelMembers || '');
        setVenue(interview.venue);
        setNotifyApplicant(!!interview.notifyApplicant);
        setResultNotes(interview.resultNotes || '');
        setCandidateName(interview.candidateName || '');
        setPosition(interview.position || '');
        setSelectedAppId(interview.applicationId || interview.application_id || null);
        setSelectedAppEmail(interview.applicantEmail || interview.applicant_email || '');
        setEditingInterviewIndex(index);
        setIsInterviewModalOpen(true);
    };

    const [cancelInterviewModal, setCancelInterviewModal] = useState<{
        isOpen: boolean;
        index: number | null;
        candidateName?: string;
        position?: string;
    }>({
        isOpen: false,
        index: null,
        candidateName: '',
        position: '',
    });

    const requestCancelInterview = (index: number) => {
        const interview = scheduledInterviews[index];
        setCancelInterviewModal({
            isOpen: true,
            index,
            candidateName: interview?.candidateName || interview?.candidate_name || '',
            position: interview?.position || interview?.jobTitle || '',
        });
    };

    const confirmCancelInterview = async () => {
        const index = cancelInterviewModal.index;
        setCancelInterviewModal(prev => ({ ...prev, isOpen: false }));
        if (index === null || index === undefined) return;

        const interview = scheduledInterviews[index];
        if (interview && interview.id && !String(interview.id).startsWith('mock_') && typeof interview.id === 'number') {
            try {
                await axios.delete(`/admin/interviews/${interview.id}`);
            } catch (e: any) {
                console.error(e);
                toast.error(e.response?.data?.error || "Failed to cancel interview in the database.");
                return;
            }
        }
        const updatedInterviews = scheduledInterviews.filter((_, i) => i !== index);
        setScheduledInterviews(updatedInterviews);
        toast.success("Interview cancelled.");
    };

    const handleStatusUpdate = (id: any, newStatus: string, reason?: string) => {
        const targetApp = applications.find(a => String(a.id) === String(id));
        const currentStatus = targetApp ? targetApp.status : '';
        const currentPrevStatus = targetApp?.previous_status || targetApp?.dynamic_responses?.previous_status || '';

        let nextStatus = newStatus;
        let nextPrevStatus = currentPrevStatus;

        if (newStatus === 'Archived') {
            if (currentStatus && currentStatus !== 'Archived' && !currentStatus.includes('Archived')) {
                nextPrevStatus = currentStatus;
            }
        } else if (newStatus === 'RESTORE') {
            nextStatus = currentPrevStatus && currentPrevStatus !== 'Archived' ? currentPrevStatus : 'Under Review';
            nextPrevStatus = '';
        } else {
            nextPrevStatus = '';
        }

        // Optimistic update for UI feel
        const updatedApps = applications.map(app =>
            String(app.id) === String(id) ? { 
                ...app, 
                status: nextStatus,
                previous_status: nextPrevStatus,
                dynamic_responses: {
                    ...(app.dynamic_responses || {}),
                    previous_status: nextPrevStatus,
                    rejection_reason: reason
                }
            } : app
        );
        setApplications(updatedApps);

        // Also update local storage if it's a mock/local application
        if (typeof window !== 'undefined') {
            const localApps = JSON.parse(localStorage.getItem('mock_applications_custom') || '[]');
            const appInLocal = localApps.find((la: any) => String(la.id) === String(id));
            
            const originalApp = getApplications().find((a: any) => String(a.id) === String(id));
            if (originalApp) {
                let updatedLocalApps;
                const updatedObj = { 
                    status: nextStatus,
                    dynamic_responses: {
                        ...(appInLocal?.dynamic_responses || originalApp.dynamic_responses || {}),
                        rejection_reason: reason
                    }
                };
                if (appInLocal) {
                    updatedLocalApps = localApps.map((la: any) =>
                        String(la.id) === String(id) ? { ...la, ...updatedObj } : la
                    );
                } else {
                    updatedLocalApps = [...localApps, { ...originalApp, ...updatedObj }];
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
                status: nextStatus,
                rejection_reason: reason
            }, {
                onSuccess: () => {
                    toast.success(`Applicant status restored to: ${nextStatus}`);
                },
                onError: (errors) => {
                    toast.error(`Failed to update status: ${Object.values(errors)[0]}`);
                    // Revert on error
                    setApplications(applications);
                }
            });
        } else {
            toast.success(`Applicant status restored to: ${nextStatus}`);
        }
    };

    const handleViewInterview = (index) => {
        setViewingInterview(scheduledInterviews[index]);
        setIsViewModalOpen(true);
    };

    return (
        <AdminLayout auth={auth}>
            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* User Directory style Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-[#193153]">Applicant Directory</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            View applicant users and inspect job applications submitted across NAAP Careers portal.
                        </p>
                    </div>

                    <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
                        <DialogTrigger asChild>
                            <Button className="bg-[#193153] hover:bg-[#193153]/90 text-white font-semibold flex items-center gap-2 shadow-sm">
                                <Download className="w-4 h-4" /> Export Reports
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md bg-white p-6 rounded-xl border border-gray-200 shadow-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-[#193153] flex items-center gap-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    Export Applicants Report
                                </DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4 my-4">
                                <div className="grid gap-2">
                                    <label htmlFor="applicant-report-status" className="font-semibold text-gray-700 text-xs">Filter by Application Status</label>
                                    <Select value={reportStatus} onValueChange={setReportStatus}>
                                        <SelectTrigger id="applicant-report-status" className="text-xs">
                                            <SelectValue placeholder="All Statuses" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Statuses</SelectItem>
                                            <SelectItem value="Submitted">Submitted</SelectItem>
                                            <SelectItem value="Under Review">Under Review</SelectItem>
                                            <SelectItem value="Interview Scheduled">Interview Scheduled</SelectItem>
                                            <SelectItem value="Hired">Hired</SelectItem>
                                            <SelectItem value="Rejected">Rejected</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="grid gap-2">
                                    <label htmlFor="applicant-report-position" className="font-semibold text-gray-700 text-xs">Filter by Position Applied</label>
                                    <Select value={reportPosition} onValueChange={setReportPosition}>
                                        <SelectTrigger id="applicant-report-position" className="text-xs">
                                            <SelectValue placeholder="All Positions" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">All Positions</SelectItem>
                                            {positions.map((pos: string) => (
                                                <SelectItem key={pos} value={pos}>{pos}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>

                                <p className="text-[11px] text-gray-500 bg-blue-50 p-2.5 rounded-lg border border-blue-100">
                                    <strong>Includes 25 Columns:</strong> Applicant Name, Email, Contact No., Position, Education, Eligibilities, Years Experience, Training Hours, Awards, Skills, Address, IP/PWD, Uploaded & Custom Documents, Status, Rejection Notes, and Submission Dates.
                                </p>
                            </div>
                            <DialogFooter className="gap-2">
                                <Button variant="outline" onClick={() => setIsReportModalOpen(false)}>
                                    Cancel
                                </Button>
                                <Button onClick={handleDownloadReport} className="bg-[#193153] hover:bg-[#193153]/90 text-white font-semibold">
                                    <Download className="w-4 h-4 mr-1.5" /> Download CSV (Excel)
                                </Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* User Directory style Search & Filters bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search applicant users by name or email..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#193153]"
                                />
                            </div>
                        </div>
                        <Select value={positionFilter} onValueChange={setPositionFilter}>
                            <SelectTrigger className="text-xs bg-gray-50"><SelectValue placeholder="All Positions" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Positions</SelectItem>
                                {positions.map(position => <SelectItem key={position} value={position}>{position}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="text-xs bg-gray-50"><SelectValue placeholder="All Status" /></SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Status</SelectItem>
                                <SelectItem value="Pending Review">Pending Review</SelectItem>
                                {statuses.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                <SelectItem value="Archived">Archived</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Applicants Table (User Management Design) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                        <p className="text-sm text-gray-600">
                            Showing <span className="font-bold text-gray-900">{groupedApplicants.length}</span> applicant user{groupedApplicants.length === 1 ? '' : 's'} ({filteredApplications.length} total application{filteredApplications.length === 1 ? '' : 's'})
                        </p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                                    <th className="py-3.5 px-6 text-left">User / Applicant</th>
                                    <th className="py-3.5 px-6 text-center">Applications Submitted</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {groupedApplicants.length === 0 ? (
                                    <tr>
                                        <td colSpan={2} className="py-12 text-center text-gray-400 italic">
                                            No applicant accounts found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    groupedApplicants.map((applicant) => (
                                        <tr
                                            key={applicant.email || applicant.applicantName}
                                            className="hover:bg-blue-50/40 transition-colors cursor-pointer group"
                                            onClick={() => {
                                                setSelectedApplicantModal(applicant);
                                                setViewingAppDetails(null);
                                            }}
                                        >
                                            <td className="py-4 px-6 align-middle">
                                                <div className="flex items-center gap-3">
                                                    {applicant.hasNewSubmission && (
                                                        <span className="relative flex h-2.5 w-2.5 shrink-0" title="New Application Submitted">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border border-white"></span>
                                                        </span>
                                                    )}
                                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-[#193153] flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                                                        {applicant.avatarUrl ? (
                                                            <img src={applicant.avatarUrl} alt={applicant.applicantName} className="w-full h-full object-cover" />
                                                        ) : (
                                                            (applicant.applicantName || 'A').charAt(0).toUpperCase()
                                                        )}
                                                    </div>
                                                    <div>
                                                        <div className="font-semibold text-gray-900 group-hover:text-blue-700 transition-colors flex items-center gap-2">
                                                            {applicant.applicantName}
                                                            {applicant.hasNewSubmission && (
                                                                <Badge className="bg-red-500 hover:bg-red-600 text-white text-[10px] px-1.5 py-0 font-bold animate-pulse shadow-2xs">
                                                                    NEW
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <div className="text-xs text-gray-500">{applicant.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-center align-middle">
                                                {applicant.hasNewSubmission ? (
                                                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200 shadow-2xs">
                                                        <span className="h-2 w-2 rounded-full bg-red-500 animate-pulse"></span>
                                                        {applicant.totalApplications} Job Application{applicant.totalApplications === 1 ? '' : 's'}
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
                                                        {applicant.totalApplications} Job Application{applicant.totalApplications === 1 ? '' : 's'}
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Unified Applicant Details & Applications Modal */}
                {selectedApplicantModal && (
                    <Dialog open={!!selectedApplicantModal} onOpenChange={(open) => {
                        if (!open) {
                            setSelectedApplicantModal(null);
                            setViewingAppDetails(null);
                        }
                    }}>
                        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                            {(() => {
                                if (!selectedApplicantModal) return null;

                                // Level 1: Applied Jobs List view for this specific applicant
                                if (!viewingAppDetails) {
                                    return (
                                        <>
                                            <DialogHeader className="border-b pb-3">
                                                <div className="flex items-center gap-3">
                                                    {selectedApplicantModal.avatarUrl ? (
                                                        <img
                                                            src={selectedApplicantModal.avatarUrl}
                                                            alt={selectedApplicantModal.applicantName}
                                                            className="w-10 h-10 rounded-full object-cover border border-slate-300 shadow-sm shrink-0"
                                                        />
                                                    ) : (
                                                        <div className="w-10 h-10 rounded-full bg-[#193153] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
                                                            {selectedApplicantModal.applicantName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                    <div>
                                                        <DialogTitle className="text-lg font-bold text-gray-900">{selectedApplicantModal.applicantName}</DialogTitle>
                                                        <p className="text-xs text-gray-500 mt-0.5">{selectedApplicantModal.email}</p>
                                                    </div>
                                                </div>
                                            </DialogHeader>

                                            <div className="py-4 space-y-3">
                                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                                                    <div>
                                                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                                            <Briefcase className="w-4.5 h-4.5 text-blue-600" />
                                                            Positions Applied ({selectedApplicantModal.totalApplications})
                                                        </h3>
                                                        <p className="text-xs text-gray-500">
                                                            Click "View Application" on any position below to inspect complete details, qualifications, and manage application status.
                                                        </p>
                                                    </div>
                                                </div>

                                                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs bg-white">
                                                    <Table>
                                                        <TableHeader className="bg-slate-50">
                                                            <TableRow className="border-b border-slate-200">
                                                                <TableHead className="font-bold text-slate-800 text-xs text-left align-middle py-3 px-4">Position Applied</TableHead>
                                                                <TableHead className="font-bold text-slate-800 text-xs text-center align-middle py-3 px-4">Score Percentage</TableHead>
                                                                <TableHead className="font-bold text-slate-800 text-xs text-center align-middle py-3 px-4">Match</TableHead>
                                                                <TableHead className="font-bold text-slate-800 text-xs text-center align-middle py-3 px-4">Status</TableHead>
                                                                <TableHead className="font-bold text-slate-800 text-xs text-right align-middle py-3 px-4">Action</TableHead>
                                                            </TableRow>
                                                        </TableHeader>
                                                        <TableBody>
                                                             {selectedApplicantModal.applications.map((appItem: any) => {
                                                                 const liveApp = applications.find(a => String(a.id) === String(appItem.id)) || appItem;
                                                                 const aiData = getAppAiData(liveApp);
                                                                 const appScore = aiData.percentage;
                                                                 const appMatch = aiData.match;
                                                                 const appStatus = getFormattedStatus(liveApp);

                                                                  const isNewApp = (liveApp.status === 'Submitted' || liveApp.status === 'Pending Review') && !viewedAppIds.has(String(liveApp.id));

                                                                 return (
                                                                     <TableRow
                                                                         key={appItem.id}
                                                                         className={`hover:bg-slate-50/70 transition-colors border-b border-slate-100 ${isNewApp ? 'bg-red-50/20' : ''}`}
                                                                     >
                                                                         <TableCell className="font-bold text-xs text-gray-900 text-left align-middle py-3.5 px-4">
                                                                             <div className="flex items-center gap-2">
                                                                                 {isNewApp && (
                                                                                     <span className="relative flex h-2 w-2 shrink-0" title="New Application Submitted">
                                                                                         <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                                                         <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                                                                                     </span>
                                                                                 )}
                                                                                 <span>{liveApp.jobTitle}</span>
                                                                                 {isNewApp && (
                                                                                     <Badge className="bg-red-500 text-white text-[9px] px-1.5 py-0 font-bold animate-pulse shadow-2xs">
                                                                                         NEW
                                                                                     </Badge>
                                                                                 )}
                                                                             </div>
                                                                             {liveApp.campus && (
                                                                                 <span className="block text-[11px] font-normal text-gray-500 mt-0.5">
                                                                                     {liveApp.campus.replace('NAAP - ', '')}
                                                                                 </span>
                                                                             )}
                                                                         </TableCell>
                                                                        <TableCell className="text-center align-middle py-3.5 px-4">
                                                                            <span className="font-bold text-xs text-blue-700">{appScore}%</span>
                                                                        </TableCell>
                                                                        <TableCell className="text-center align-middle py-3.5 px-4">
                                                                            <Badge variant="secondary" className={`${getMatchColor(appMatch)} text-[10px] py-0.5 px-2.5 font-semibold inline-flex items-center justify-center`}>
                                                                                {appMatch}
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell className="text-center align-middle py-3.5 px-4">
                                                                            <Badge className={`${getStatusColor(appStatus)} text-[10px] px-2.5 py-0.5 font-bold inline-flex items-center justify-center`}>
                                                                                {appStatus}
                                                                            </Badge>
                                                                        </TableCell>
                                                                        <TableCell className="text-right align-middle py-3.5 px-4">
                                                                            <Button
                                                                                size="sm"
                                                                                className="bg-[#193153] hover:bg-[#193153]/90 text-white font-semibold text-xs px-3 py-1 h-8 shadow-2xs inline-flex items-center justify-center gap-1"
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation();
                                                                                    markAsViewed(liveApp.id);
                                                                                    if (liveApp.status === 'Submitted') {
                                                                                        handleStatusUpdate(liveApp.id, 'Under Review');
                                                                                    }
                                                                                    setViewingAppDetails(liveApp);
                                                                                }}
                                                                            >
                                                                                <Eye className="w-3.5 h-3.5" /> View Application
                                                                            </Button>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                );
                                                            })}
                                                        </TableBody>
                                                    </Table>
                                                </div>
                                            </div>
                                        </>
                                    );
                                }

                                // Level 2: Detailed Application View for viewingAppDetails
                                const currentApp = applications.find(a => String(a.id) === String(viewingAppDetails.id)) || viewingAppDetails;
                                const currentStatus = getFormattedStatus(currentApp);

                                return (
                                    <>
                                        <DialogHeader className="border-b pb-3">
                                            <div className="flex items-center justify-between gap-3 mb-2">
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => setViewingAppDetails(null)}
                                                    className="text-xs font-semibold text-blue-700 border-blue-200 bg-blue-50/70 hover:bg-blue-100 flex items-center gap-1.5 h-8 px-2.5"
                                                >
                                                    <ArrowLeft className="w-3.5 h-3.5" />
                                                    Back to Applied Jobs List
                                                </Button>

                                                <div className="flex items-center gap-2 mr-6">
                                                    <Badge className={`${getStatusColor(currentStatus)} px-2.5 py-0.5 text-xs font-bold shrink-0`}>
                                                        {currentStatus}
                                                    </Badge>
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => handleDeleteSingleApplication(currentApp.id, currentApp.jobTitle, selectedApplicantModal.applicantName)}
                                                        className="text-xs font-semibold text-red-600 border-red-200 bg-red-50 hover:bg-red-100 flex items-center gap-1.5 h-8 px-2.5 shadow-2xs"
                                                        title="Delete this job application"
                                                    >
                                                        <Trash className="w-3.5 h-3.5" /> Delete Application
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-3 pt-1">
                                                {selectedApplicantModal.avatarUrl ? (
                                                    <img
                                                        src={selectedApplicantModal.avatarUrl}
                                                        alt={selectedApplicantModal.applicantName}
                                                        className="w-9 h-9 rounded-full object-cover border border-slate-300 shadow-sm shrink-0"
                                                    />
                                                ) : (
                                                    <div className="w-9 h-9 rounded-full bg-[#193153] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">
                                                        {selectedApplicantModal.applicantName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                                    </div>
                                                )}
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                                                    <DialogTitle className="text-base font-bold text-gray-900">{selectedApplicantModal.applicantName}</DialogTitle>
                                                    <span className="hidden sm:inline text-gray-300">•</span>
                                                    <span className="text-xs font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">{currentApp.jobTitle}</span>
                                                    <span className="text-xs text-gray-400">({selectedApplicantModal.email})</span>
                                                </div>
                                            </div>
                                        </DialogHeader>

                                        <div className="space-y-4 text-sm mt-3">
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
                                                            <span className="font-semibold text-gray-950 text-right">{currentApp.jobTitle}</span>
                                                            <span className="text-gray-500">Campus/Location:</span>
                                                            <span className="font-semibold text-gray-950 text-right">{currentApp.campus ? currentApp.campus.replace('NAAP - ', '') : 'N/A'}</span>
                                                            <span className="text-gray-500">Date Applied:</span>
                                                            <span className="font-semibold text-gray-950 text-right">{new Date(currentApp.submittedDate).toLocaleDateString()}</span>
                                                            <span className="text-gray-500">Current Status:</span>
                                                            <span className="font-semibold text-right">
                                                                <Badge className={`${getStatusColor(getFormattedStatus(currentApp))} px-2 py-0.5 text-[10px]`}>{getFormattedStatus(currentApp)}</Badge>
                                                            </span>
                                                        </div>
                                                    </div>
                                                    <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-200 space-y-3">
                                                        {(() => {
                                                            const aiData = getAppAiData(currentApp);
                                                            const breakdown = aiData.breakdown;
                                                            return (
                                                                <>
                                                                    <div className="flex justify-between items-center">
                                                                        <h3 className="font-semibold text-blue-900 text-sm flex items-center gap-1.5">
                                                                            <TrendingUp className="w-4 h-4 text-blue-600" /> Qualification Analysis Results
                                                                        </h3>
                                                                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs px-2.5 py-0.5 font-bold">
                                                                            {aiData.percentage}% Match
                                                                        </Badge>
                                                                    </div>
                                                                    <p className="text-xs text-blue-800 leading-relaxed">
                                                                        <span className="font-semibold">{aiData.match}:</span> This applicant shows {aiData.match.toLowerCase()} alignment based on computed education level, years of experience, and training credentials.
                                                                    </p>
                                                                    <div className="space-y-3 pt-2 border-t border-blue-200/60">
                                                                    <p className="text-[11px] font-semibold text-blue-900 uppercase tracking-wide">PDS Evaluation Breakdown</p>
                                                                    
                                                                    {/* Education */}
                                                                    <div>
                                                                        <div className="flex justify-between text-xs mb-1">
                                                                            <span className="text-gray-700 font-medium">Education Fit (PDS Sec II)</span>
                                                                            <span className="font-bold text-gray-900">{Math.round((breakdown.education / 5) * 100)}%</span>
                                                                        </div>
                                                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                            <div className="bg-purple-600 h-1.5 rounded-full" style={{ width: `${(breakdown.education / 5) * 100}%` }} />
                                                                        </div>
                                                                        {currentApp.educationLevel && (
                                                                            <p className="text-[11px] text-gray-500 mt-1">
                                                                                <span className="font-medium">Level:</span> {
                                                                                    currentApp.educationLevel === 'bachelor' ? "Bachelor's Degree" :
                                                                                    currentApp.educationLevel === 'masters' ? "Master's Degree" :
                                                                                    currentApp.educationLevel === 'doctoral_9-15' ? "Doctoral (9-15 units)" :
                                                                                    currentApp.educationLevel === 'doctoral_15-18' ? "Doctoral (15-18 units)" :
                                                                                    currentApp.educationLevel === 'doctoral_18-24' ? "Doctoral (18-24 units)" :
                                                                                    currentApp.educationLevel === 'doctoral_27+' ? "Doctoral (27+ units)" :
                                                                                    currentApp.educationLevel === 'doctoral_graduate' ? "Doctoral Graduate" :
                                                                                    currentApp.educationLevel
                                                                                }
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    {/* Work Experience */}
                                                                    <div>
                                                                        <div className="flex justify-between text-xs mb-1">
                                                                            <span className="text-gray-700 font-medium">Work Experience Fit (PDS Sec IV)</span>
                                                                            <span className="font-bold text-gray-900">{Math.round((breakdown.experience / 25) * 100)}%</span>
                                                                        </div>
                                                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                            <div className="bg-blue-600 h-1.5 rounded-full" style={{ width: `${(breakdown.experience / 25) * 100}%` }} />
                                                                        </div>
                                                                        {currentApp.yearsOfExperience !== undefined && (
                                                                            <p className="text-[11px] text-gray-500 mt-1">
                                                                                <span className="font-medium">Years:</span> {currentApp.yearsOfExperience} years
                                                                            </p>
                                                                        )}
                                                                    </div>

                                                                    {/* Awards & Recognition */}
                                                                    <div>
                                                                        <div className="flex justify-between text-xs mb-1">
                                                                            <span className="text-gray-700 font-medium">Eligibility & Awards Fit (PDS Sec III & VII)</span>
                                                                            <span className="font-bold text-gray-900">{Math.round((breakdown.accomplishments / 5) * 100)}%</span>
                                                                        </div>
                                                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                            <div className="bg-yellow-500 h-1.5 rounded-full" style={{ width: `${(breakdown.accomplishments / 5) * 100}%` }} />
                                                                        </div>
                                                                        {currentApp.awards && currentApp.awards.length > 0 ? (
                                                                            <p className="text-[11px] text-gray-500 mt-1">
                                                                                <span className="font-medium">Received:</span> {currentApp.awards.map((award: string) =>
                                                                                    award === 'national' ? 'National Award' :
                                                                                    award === 'csc' ? 'CSC Award' :
                                                                                    award === 'president' ? "President's Award" :
                                                                                    award === 'ngo' ? 'NGO Award' : award
                                                                                ).join(', ')}
                                                                            </p>
                                                                        ) : (
                                                                            <p className="text-[11px] text-gray-400 mt-1 italic">No awards listed</p>
                                                                        )}
                                                                    </div>

                                                                    {/* Training & L&D */}
                                                                    <div>
                                                                        <div className="flex justify-between text-xs mb-1">
                                                                            <span className="text-gray-700 font-medium">Training & L&D Fit (PDS Sec VI)</span>
                                                                            <span className="font-bold text-gray-900">{Math.round((breakdown.training / 10) * 100)}%</span>
                                                                        </div>
                                                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                                                            <div className="bg-green-600 h-1.5 rounded-full" style={{ width: `${(breakdown.training / 10) * 100}%` }} />
                                                                        </div>
                                                                        {currentApp.trainingHours !== undefined && (
                                                                            <p className="text-[11px] text-gray-500 mt-1">
                                                                                <span className="font-medium">Hours:</span> {currentApp.trainingHours} hours
                                                                            </p>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </>
                                                            );
                                                        })()}
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="personal" className="space-y-4">
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 text-sm border-b pb-1.5 mb-3">Identity & Personal Information</h3>
                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                                                <div className="flex flex-col"><span className="text-gray-500">First Name</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.firstName || currentApp.applicantName.split(' ')[0]}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Middle Name</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.middleName || 'N/A'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Last Name</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.lastName || currentApp.applicantName.split(' ').pop()}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Extension Name</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.extensionName || 'N/A'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Age</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.age || 'N/A'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Sex / Gender</span><span className="font-semibold text-gray-900 mt-0.5 capitalize">{currentApp.dynamic_responses?.sex || 'N/A'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Civil Status</span><span className="font-semibold text-gray-900 mt-0.5 capitalize">{currentApp.dynamic_responses?.civilStatus || 'N/A'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Religion</span><span className="font-semibold text-gray-900 mt-0.5 capitalize">{currentApp.dynamic_responses?.religion || 'N/A'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 text-sm border-b pb-1.5 mb-3">Demographics & Government Issued IDs (PDS Sec I)</h3>
                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                                                <div className="flex flex-col"><span className="text-gray-500">Indigenous Group Member</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.isIP || 'No'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Person with Disability (PWD)</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.isPWD || 'No'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">GSIS ID No.</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.gsisNo || 'N/A'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">SSS No.</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.sssNo || 'N/A'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">TIN No.</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.tinNo || 'N/A'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">PAG-IBIG ID No.</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.pagibigNo || 'N/A'}</span></div>
                                                                <div className="flex flex-col col-span-2"><span className="text-gray-500">PhilHealth No.</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.philhealthNo || 'N/A'}</span></div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 text-sm border-b pb-1.5 mb-3">Contact Information</h3>
                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                                                <div className="flex flex-col"><span className="text-gray-500">Email Address</span><span className="font-semibold text-gray-900 mt-0.5 truncate" title={currentApp.email}>{currentApp.email}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Primary Phone Number</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.phone_number || currentApp.phone_number || 'N/A'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Alternate Phone Number</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.alternateContact || 'N/A'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Source Referral</span><span className="font-semibold text-gray-900 mt-0.5 capitalize">{currentApp.dynamic_responses?.source ? currentApp.dynamic_responses.source.replace('_', ' ') : 'N/A'}</span></div>
                                                                <div className="flex flex-col col-span-2"><span className="text-gray-500">Residential Address</span><span className="font-semibold text-gray-900 mt-0.5 leading-relaxed">{currentApp.dynamic_responses?.address || 'N/A'}</span></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </TabsContent>
                                                <TabsContent value="qualifications" className="space-y-4">
                                                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 space-y-4">
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 text-sm border-b pb-1.5 mb-3">Professional Credentials & PDS Background</h3>
                                                            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                                                                <div className="flex flex-col"><span className="text-gray-500">Highest Education Attained</span><span className="font-semibold text-gray-900 mt-0.5">{(() => {
                                                                    const rawEd = currentApp.educationLevel || currentApp.dynamic_responses?.educationLevel || currentApp.education || '';
                                                                    if (rawEd === 'bachelor') return "Bachelor's Degree";
                                                                    if (rawEd === 'masters') return "Master's Degree";
                                                                    if (rawEd === 'doctoral_9-15') return "Doctoral (9-15 units)";
                                                                    if (rawEd === 'doctoral_15-18') return "Doctoral (15-18 units)";
                                                                    if (rawEd === 'doctoral_18-24') return "Doctoral (18-24 units)";
                                                                    if (rawEd === 'doctoral_27+') return "Doctoral (27+ units)";
                                                                    if (rawEd === 'doctoral_graduate') return "Doctoral Graduate";
                                                                    if (rawEd.includes('doctoral')) return "Doctoral / Ph.D. Degree";
                                                                    if (rawEd.includes('master')) return "Master's Degree";
                                                                    if (rawEd.includes('bachelor')) return "Bachelor's Degree";
                                                                    if (rawEd.includes('vocational')) return "Vocational / Technical Diploma";
                                                                    if (rawEd.includes('highschool')) return "High School Graduate";
                                                                    return rawEd || 'N/A';
                                                                })()}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">School / University (Sec II)</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.schoolName || 'N/A'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Degree / Course Title (Sec II)</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.degreeCourse || 'N/A'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Year Graduated (Sec II)</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.yearGraduated || 'N/A'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">License / Registration No. (Sec III)</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.licenseNo || 'N/A'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Years of Experience (Sec IV)</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.yearsOfExperience || (currentApp.aiScoreBreakdown?.experience ? Math.max(1, currentApp.aiScoreBreakdown.experience) : 'N/A')} years</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Recent Position Title (Sec IV)</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.recentPositionTitle || 'N/A'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Recent Employer / Agency (Sec IV)</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.recentEmployer || 'N/A'}</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Training Hours (Sec VI)</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.trainingHours || 'N/A'} hours</span></div>
                                                                <div className="flex flex-col"><span className="text-gray-500">Recent Seminar / Training (Sec VI)</span><span className="font-semibold text-gray-900 mt-0.5">{currentApp.dynamic_responses?.recentTrainingTitle || 'N/A'}</span></div>
                                                                <div className="flex flex-col col-span-2"><span className="text-gray-500">Open to other positions?</span><span className="font-semibold text-gray-900 mt-0.5 capitalize">{currentApp.dynamic_responses?.openToOthers || 'Yes'}</span></div>
                                                                <div className="flex flex-col col-span-2"><span className="text-gray-500">Detailed Experience Summary</span><span className="font-semibold text-gray-900 mt-0.5 leading-relaxed">{currentApp.experience}</span></div>
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 text-sm border-b pb-1.5 mb-2">Awards & Recognition</h3>
                                                            {currentApp.dynamic_responses?.awards && currentApp.dynamic_responses.awards.length > 0 ? (
                                                                <div className="flex flex-wrap gap-1.5 mt-1">
                                                                    {currentApp.dynamic_responses.awards.map((award: string, i: number) => (
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
                                                                {currentApp.skills && currentApp.skills.length > 0 ? (
                                                                    currentApp.skills.map((skill: string, i: number) => (
                                                                        <Badge key={i} variant="secondary" className="text-xs px-1.5 py-0.5">{skill}</Badge>
                                                                    ))
                                                                ) : (
                                                                    <span className="text-xs text-gray-500 italic">No skills listed</span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div>
                                                            <h3 className="font-semibold text-gray-900 text-sm border-b pb-1.5 mb-2">Civil Service & Board Eligibilities</h3>
                                                            {currentApp.dynamic_responses?.eligibilities && currentApp.dynamic_responses.eligibilities.length > 0 ? (
                                                                <ul className="list-disc pl-4 text-xs text-gray-700 space-y-1 mt-1">
                                                                    {currentApp.dynamic_responses.eligibilities.map((eligibility: string, i: number) => (
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
                                                                {currentApp.documents && currentApp.documents.length > 0 ? (
                                                                    currentApp.documents.map((doc: any, i: number) => (
                                                                        <div key={i} className="flex items-center justify-between p-2 bg-white rounded border border-gray-100 shadow-sm animate-fade-in">
                                                                            <div className="flex items-center overflow-hidden mr-2">
                                                                                <FileText className="shrink-0 h-4 w-4 text-blue-500 mr-2" />
                                                                                <span className="text-sm text-gray-700 font-medium truncate">{doc.name}</span>
                                                                                {doc.fileName && (
                                                                                    <span className="text-xs text-gray-500 ml-2 italic truncate max-w-37.5">({doc.fileName})</span>
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
                                                                                title="View Document"
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
                                                        {currentApp.toFollowDocs && currentApp.toFollowDocs.length > 0 && (
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2 border-b pb-1.5 mb-2">
                                                                    <h3 className="font-semibold text-orange-700 text-sm">Pending Requirements</h3>
                                                                    <Badge variant="outline" className="text-[10px] bg-orange-50 text-orange-700 border-orange-200">To Follow</Badge>
                                                                </div>
                                                                <div className="grid grid-cols-1 gap-2">
                                                                    {currentApp.toFollowDocs.map((docName: string, i: number) => (
                                                                        <div key={i} className="flex items-center p-2 bg-orange-50/20 rounded border border-orange-100">
                                                                            <FileText className="shrink-0 h-4 w-4 text-orange-400 mr-2" />
                                                                            <span className="text-sm text-gray-700 font-medium truncate">{docName}</span>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        )}
                                                        {currentApp.custom_file_responses && Object.keys(currentApp.custom_file_responses).length > 0 && (
                                                            <div className="space-y-2">
                                                                <h3 className="font-semibold text-blue-900 text-sm border-b pb-1.5 mb-2">Custom File Requirements</h3>
                                                                <div className="grid grid-cols-1 gap-2">
                                                                    {Object.entries(currentApp.custom_file_responses).map(([label, path]: [string, any]) => (
                                                                        <div key={label} className="flex items-center justify-between p-2 bg-white rounded border border-blue-100 shadow-sm">
                                                                            <div className="flex items-center overflow-hidden mr-2">
                                                                                <FileText className="shrink-0 h-4 w-4 text-blue-500 mr-2" />
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
                                                                                title="View Document"
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
                                            {(() => {
                                                const isHired = currentApp.status === 'Hired';
                                                const isRejected = currentApp.status === 'Rejected';
                                                const isArchived = currentApp.status === 'Archived';
                                                const isTerminal = isHired || isRejected || isArchived;

                                                return (
                                                    <>
                                                        {isHired && (
                                                            <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-2.5 text-center text-xs font-semibold text-emerald-800 flex items-center justify-center gap-1.5 mt-2">
                                                                <span>🎉</span> Applicant has been Hired for this position! Status actions locked.
                                                            </div>
                                                        )}
                                                        {isRejected && (
                                                            <div className="bg-red-50 border border-red-200 rounded-lg p-2.5 text-center text-xs font-semibold text-red-800 flex items-center justify-center gap-1.5 mt-2">
                                                                <span>🚫</span> Application is Rejected for this position. Status actions locked.
                                                            </div>
                                                        )}
                                                        {isArchived && (
                                                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-2.5 text-center text-xs font-semibold text-amber-800 flex items-center justify-center gap-1.5 mt-2">
                                                                <span>📦</span> Application is currently Archived. Unarchive to enable status actions.
                                                            </div>
                                                        )}
                                                        <div className="flex gap-2 pt-2 border-t mt-2">
                                                            <Button
                                                                size="sm"
                                                                disabled={isTerminal}
                                                                className={`flex-1 font-bold ${
                                                                    isTerminal
                                                                        ? 'bg-gray-200 text-gray-400 hover:bg-gray-200 cursor-not-allowed border-none shadow-none'
                                                                        : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                                                }`}
                                                                onClick={() => handleStatusUpdate(currentApp.id, 'Hired')}
                                                            >
                                                                {isHired ? 'Hired' : 'Hire Applicant'}
                                                            </Button>
                                                            <Button
                                                                size="sm"
                                                                variant="destructive"
                                                                disabled={isTerminal}
                                                                className={`flex-1 ${
                                                                    isTerminal
                                                                        ? 'bg-gray-200 text-gray-400 hover:bg-gray-200 cursor-not-allowed border-none shadow-none'
                                                                        : ''
                                                                }`}
                                                                onClick={() => {
                                                                    setRejectionAppId(currentApp.id);
                                                                    setRejectionReason('Minimum educational requirements not met');
                                                                    setCustomRejectionReason('');
                                                                    setIsRejectionModalOpen(true);
                                                                }}
                                                            >
                                                                Reject Applicant
                                                            </Button>
                                                        </div>
                                                        <div className="pt-2 border-t flex flex-col gap-2">
                                                            <div className="flex gap-2">
                                                                {isArchived ? (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        className="flex-1 border-amber-300 bg-amber-50 text-amber-800 hover:bg-amber-100 font-bold"
                                                                        onClick={() => handleStatusUpdate(currentApp.id, 'RESTORE')}
                                                                    >
                                                                        <RotateCcw className="mr-2 h-3.5 w-3.5" />
                                                                        Unarchive Application
                                                                    </Button>
                                                                ) : (
                                                                    <Button
                                                                        variant="outline"
                                                                        size="sm"
                                                                        disabled={isTerminal}
                                                                        className={`flex-1 ${
                                                                            isTerminal
                                                                                ? 'bg-gray-100 text-gray-400 hover:bg-gray-100 cursor-not-allowed border-gray-200'
                                                                                : 'border-gray-300 text-gray-600 hover:bg-gray-100'
                                                                        }`}
                                                                        onClick={() => handleStatusUpdate(currentApp.id, 'Archived')}
                                                                    >
                                                                        <Trash className="mr-2 h-3.5 w-3.5" />
                                                                        Archive
                                                                    </Button>
                                                                )}
                                                                <Button
                                                                    disabled={isTerminal}
                                                                    className={`flex-1 font-bold ${
                                                                        isTerminal
                                                                            ? 'bg-gray-200 text-gray-400 hover:bg-gray-200 cursor-not-allowed border-none shadow-none'
                                                                            : 'bg-purple-600 hover:bg-purple-700 text-white'
                                                                    }`}
                                                                    onClick={() => {
                                                                        setCandidateName(currentApp.applicantName);
                                                                        setPosition(currentApp.jobTitle);
                                                                        setSelectedAppId(currentApp.id);
                                                                        setSelectedAppEmail(currentApp.email || currentApp.applicantEmail || '');
                                                                        setIsInterviewModalOpen(true);
                                                                    }}
                                                                >
                                                                    <Calendar className="mr-2 h-4 w-4" />
                                                                    Schedule Interview
                                                                </Button>
                                                                <Button
                                                                    className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-4"
                                                                    size="sm"
                                                                    onClick={() => openMessages(currentApp.id, currentApp.applicantName, currentApp.jobTitle, currentApp.email)}
                                                                >
                                                                    <Send className="mr-1.5 h-3.5 w-3.5" />
                                                                    Message
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </>
                                                );
                                            })()}
                                        </div>
                                    </>
                                );
                            })()}
                        </DialogContent>
                    </Dialog>
                )}

                {/* Delete User Account Confirmation Dialog */}
                <Dialog open={deleteUserModal.isOpen} onOpenChange={(open) => !open && setDeleteUserModal(prev => ({ ...prev, isOpen: false }))}>
                    <DialogContent className="sm:max-w-md bg-white border-red-100 shadow-2xl rounded-2xl p-6">
                        <DialogHeader className="flex flex-col items-center text-center space-y-3 pt-2">
                            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 border border-red-200 flex items-center justify-center">
                                <Trash className="w-7 h-7" />
                            </div>
                            <DialogTitle className="text-xl font-bold text-gray-900 tracking-wide">
                                Delete Applicant Account?
                            </DialogTitle>
                        </DialogHeader>

                        <div className="text-center text-gray-600 text-sm py-3 space-y-2">
                            <p>
                                Are you sure you want to delete the user account for{' '}
                                <strong className="text-gray-900 font-semibold">{deleteUserModal.applicant?.applicantName}</strong>{' '}
                                (<span className="text-blue-600">{deleteUserModal.applicant?.email}</span>)?
                            </p>
                            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 font-medium">
                                ⚠️ This action will permanently remove this user account from the system database.
                            </p>
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end border-t pt-4 mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDeleteUserModal(prev => ({ ...prev, isOpen: false }))}
                                className="w-full sm:w-auto"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={confirmDeleteApplicantAccount}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md shadow-red-900/20 w-full sm:w-auto"
                            >
                                Yes, Delete Account
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Single Job Application Confirmation Dialog */}
                <Dialog open={deleteAppModal.isOpen} onOpenChange={(open) => !open && setDeleteAppModal(prev => ({ ...prev, isOpen: false }))}>
                    <DialogContent className="sm:max-w-md bg-white border-red-100 shadow-2xl rounded-2xl p-6">
                        <DialogHeader className="flex flex-col items-center text-center space-y-3 pt-2">
                            <div className="w-14 h-14 rounded-full bg-red-100 text-red-600 border border-red-200 flex items-center justify-center">
                                <Trash className="w-7 h-7" />
                            </div>
                            <DialogTitle className="text-xl font-bold text-gray-900 tracking-wide">
                                Delete Job Application?
                            </DialogTitle>
                        </DialogHeader>

                        <div className="text-center text-gray-600 text-sm py-3 space-y-2">
                            <p>
                                Are you sure you want to delete the job application for{' '}
                                <strong className="text-gray-900 font-semibold">{deleteAppModal.jobTitle}</strong>{' '}
                                submitted by <strong className="text-blue-700">{deleteAppModal.applicantName}</strong>?
                            </p>
                            <p className="text-xs text-red-600 bg-red-50 p-2.5 rounded-lg border border-red-200 font-medium">
                                ⚠️ This action will permanently remove this application record from the system database.
                            </p>
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end border-t pt-4 mt-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setDeleteAppModal(prev => ({ ...prev, isOpen: false }))}
                                className="w-full sm:w-auto text-xs border-gray-300 font-semibold"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="button"
                                onClick={confirmDeleteApplication}
                                className="bg-red-600 hover:bg-red-700 text-white font-bold shadow-md shadow-red-900/20 w-full sm:w-auto text-xs"
                            >
                                Yes, Delete Job Application
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

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
                                                    onClick={() => requestCancelInterview(index)}
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
                    <DialogHeader className="px-6 py-4 border-b shrink-0">
                        <DialogTitle className="flex items-center gap-2">
                            <FileText className="h-5 w-5 text-blue-600" />
                            {viewingDocument?.name || 'Document Viewer'}
                            {viewingDocument?.fileName && <span className="text-sm font-normal text-gray-500 ml-2">({viewingDocument.fileName})</span>}
                        </DialogTitle>
                    </DialogHeader>

                    {/* Dedicated Document Toolbar */}
                    {viewingDocument?.url && (
                        <div className="bg-white border-b px-6 py-2 flex items-center justify-between shrink-0 shadow-sm">
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

            {/* --- FLOATING CHAT BOX (FACEBOOK-STYLE) --- */}
            {isMessageModalOpen && (
                <div className="fixed bottom-0 right-4 md:right-10 z-[100] flex flex-col w-[340px] h-[420px] bg-white border border-gray-200 shadow-2xl rounded-t-2xl overflow-hidden transition-all duration-300 animate-in slide-in-from-bottom-5 duration-200">
                    {/* Header */}
                    <div className="bg-[#193153] text-white px-4 py-2.5 flex items-center justify-between select-none shrink-0 border-b border-white/10">
                        <div className="flex items-center gap-2.5 max-w-[75%]">
                            <span className="bg-blue-600 text-[#ffdd59] p-1.5 rounded-full shrink-0 shadow-xs">
                                <Users className="h-4 w-4" />
                            </span>
                            <div className="truncate">
                                <h4 className="font-bold text-xs leading-tight text-white">{activeMessageAppName || 'Applicant'}</h4>
                                {activeMessageJobTitle && (
                                    <p className="text-[10px] text-blue-200 truncate flex items-center gap-1 font-medium mt-0.5" title={`Re: ${activeMessageJobTitle}`}>
                                        <span className="text-[#ffdd59]">📌</span> Re: {activeMessageJobTitle}
                                    </p>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            {/* Open Full Messages Page */}
                            <button 
                                className="text-gray-300 hover:text-white transition-colors p-1"
                                onClick={() => router.visit('/admin/messages')}
                                title="Open Full Messages Page"
                            >
                                <ExternalLink className="h-3.5 w-3.5" />
                            </button>
                            {/* Close Button */}
                            <button 
                                className="text-gray-300 hover:text-white transition-colors p-1"
                                onClick={() => setIsMessageModalOpen(false)}
                                title="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages Body */}
                    <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 bg-gray-50">
                        {messages.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-gray-400 gap-2">
                                <div className="p-3 bg-gray-100 rounded-full">
                                    <FileText className="h-6 w-6" />
                                </div>
                                <p className="text-xs">No messages yet. Send the first message!</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => {
                                const isSenderAdmin = msg.sender?.email === admin.email || ['admin@naap.edu.ph', 'admin@admin.com'].includes(msg.sender?.email);
                                const msgJobTitle = msg.application?.job_title || msg.jobTitle || (idx === 0 ? activeMessageJobTitle : null);
                                const prevMsgJobTitle = idx > 0 ? (messages[idx - 1].application?.job_title || messages[idx - 1].jobTitle) : null;
                                const showTopicDivider = msgJobTitle && msgJobTitle !== prevMsgJobTitle;

                                const formatTime = (timeStr?: string) => {
                                    if (!timeStr) return '';
                                    try {
                                        const date = new Date(timeStr);
                                        return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' }) + ' • ' + date.toLocaleDateString([], { month: 'short', day: 'numeric' });
                                    } catch {
                                        return '';
                                    }
                                };
                                return (
                                    <React.Fragment key={idx}>
                                        {showTopicDivider && (
                                            <div className="my-1.5 flex items-center justify-center">
                                                <span className="text-[9px] font-bold text-[#193153] bg-blue-100/70 px-2.5 py-0.5 rounded-full border border-blue-200/60 shadow-2xs">
                                                    📌 Topic: {msgJobTitle}
                                                </span>
                                            </div>
                                        )}
                                        <div className={`flex flex-col max-w-[85%] ${isSenderAdmin ? 'ml-auto items-end' : 'mr-auto items-start'}`}>
                                            <div className={`p-2.5 rounded-2xl ${isSenderAdmin
                                                ? 'bg-blue-600 text-white rounded-tr-sm'
                                                : 'bg-white border text-gray-800 rounded-tl-sm shadow-sm'
                                                }`}>
                                                <div className="flex items-center gap-2 mb-0.5">
                                                    <span className={`text-[9px] font-bold uppercase tracking-wider ${isSenderAdmin ? 'text-blue-200' : 'text-gray-500'}`}>
                                                        {isSenderAdmin ? 'You' : msg.sender?.name}
                                                    </span>
                                                </div>
                                                <p className="text-xs leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                                            </div>
                                            <span className="text-[8px] text-gray-400 mt-0.5 px-1">
                                                {formatTime(msg.created_at || new Date().toISOString())}
                                            </span>
                                        </div>
                                    </React.Fragment>
                                );
                            })
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Message Input Footer */}
                    <div className="p-3 bg-white border-t shrink-0">
                        <form
                            onSubmit={(e) => { e.preventDefault(); sendMessage(); }}
                            className="flex gap-2"
                        >
                            <Input
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 h-9 text-xs"
                            />
                            <Button
                                type="submit"
                                disabled={!newMessage.trim()}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 h-9 text-xs"
                            >
                                <Send className="h-3.5 w-3.5" />
                            </Button>
                        </form>
                    </div>
                </div>
            )}

            {/* Rejection Reason Modal */}
            <Dialog open={isRejectionModalOpen} onOpenChange={setIsRejectionModalOpen}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-red-600 flex items-center gap-2">
                            ❌ Reason for Rejection
                        </DialogTitle>
                        <DialogDescription>
                            Please select or input the reason why this applicant is being rejected. This reason will be visible to the applicant.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="space-y-4 py-2">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Select a standard reason</label>
                            <Select value={rejectionReason} onValueChange={setRejectionReason}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select reason" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="Minimum educational requirements not met">Minimum educational requirements not met</SelectItem>
                                    <SelectItem value="Lacks sufficient professional experience in the field">Lacks sufficient professional experience in the field</SelectItem>
                                    <SelectItem value="Incomplete application documents/credentials">Incomplete application documents/credentials</SelectItem>
                                    <SelectItem value="Unsatisfactory technical assessment or interview performance">Unsatisfactory technical assessment or interview performance</SelectItem>
                                    <SelectItem value="Position filled by another candidate">Position filled by another candidate</SelectItem>
                                    <SelectItem value="Other">Other (Type custom reason below)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {rejectionReason === 'Other' && (
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-gray-700">Custom Rejection Reason</label>
                                <textarea
                                    className="w-full min-h-[80px] p-2 border border-gray-300 rounded-md text-sm focus:ring-[#193153] focus:border-[#193153]"
                                    placeholder="Type specific details for the rejection..."
                                    value={customRejectionReason}
                                    onChange={(e) => setCustomRejectionReason(e.target.value)}
                                />
                            </div>
                        )}
                    </div>

                    <DialogFooter className="mt-4 border-t pt-4 flex gap-2">
                        <Button variant="outline" onClick={() => setIsRejectionModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white font-bold"
                            onClick={() => {
                                const finalReason = rejectionReason === 'Other' ? customRejectionReason.trim() : rejectionReason;
                                if (!finalReason) {
                                    toast.error("Please provide a rejection reason.");
                                    return;
                                }
                                handleStatusUpdate(rejectionAppId, 'Rejected', finalReason);
                                setIsRejectionModalOpen(false);
                            }}
                        >
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* --- CANCEL INTERVIEW CONFIRMATION MODAL --- */}
            <Dialog open={cancelInterviewModal.isOpen} onOpenChange={(open) => !open && setCancelInterviewModal(prev => ({ ...prev, isOpen: false }))}>
                <DialogContent className="sm:max-w-md bg-[#193153] text-white border-slate-700 shadow-2xl rounded-2xl p-6">
                    <DialogHeader className="flex flex-col items-center text-center space-y-3 pt-2">
                        <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                            <Trash className="w-7 h-7" />
                        </div>
                        <DialogTitle className="text-xl font-bold text-white tracking-wide">
                            Cancel Scheduled Interview?
                        </DialogTitle>
                    </DialogHeader>

                    <div className="text-center text-slate-300 text-sm py-3 space-y-2">
                        <p>
                            Are you sure you want to cancel the interview for{' '}
                            <strong className="text-white font-semibold">{cancelInterviewModal.candidateName || 'this candidate'}</strong>
                            {cancelInterviewModal.position ? <> (<span className="text-amber-400">{cancelInterviewModal.position}</span>)</> : ''}?
                        </p>
                        <p className="text-xs text-red-400 font-medium">
                            This will remove the interview schedule from both the Admin portal and the Applicant's account.
                        </p>
                    </div>

                    <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end border-t border-slate-700/60 pt-4 mt-2">
                        <button
                            type="button"
                            onClick={() => setCancelInterviewModal(prev => ({ ...prev, isOpen: false }))}
                            className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto"
                        >
                            Keep Interview
                        </button>
                        <button
                            type="button"
                            onClick={confirmCancelInterview}
                            className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-sm font-semibold transition-all shadow-md shadow-red-900/30 cursor-pointer w-full sm:w-auto"
                        >
                            Yes, Cancel Interview
                        </button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
