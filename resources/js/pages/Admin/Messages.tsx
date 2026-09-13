import { Link } from '@inertiajs/react';
import axios from 'axios';
import { Search, Send, MessageSquare, Clock, User, Briefcase, ChevronLeft, Eye, Mail, GraduationCap, Building2, ExternalLink, FileText, Trash2, ZoomIn } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import CustomTooltip from '@/components/ui/custom-tooltip';
import AdminLayout from '@/layouts/AdminLayout';

interface Application {
    id: number;
    applicantName: string;
    avatar?: string;
    avatar_url?: string;
    email: string;
    phone?: string;
    address?: string;
    profile_data?: any;
    jobTitle: string;
    status: string;
    campus?: string;
    education?: string;
    experience?: string;
    skills?: string[] | string;
    resume_path?: string;
    pds_document?: string;
    submittedDate?: string;
    hasUnreadMessages: boolean;
    lastMessage: string | null;
    lastMessageTime: string | null;
}

interface Message {
    id: number;
    application_id: number;
    sender_id: number;
    receiver_id: number | null;
    content: string;
    is_read: boolean;
    created_at: string;
    sender?: {
        id: number;
        name: string;
        email: string;
    };
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean; error: any }> {
    constructor(props: any) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: any) {
        return { hasError: true, error };
    }

    componentDidCatch(error: any, errorInfo: any) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div style={{ padding: '20px', background: '#fff0f0', border: '1px solid #ffc0c0', borderRadius: '8px', margin: '20px' }}>
                    <h2 style={{ color: '#c00000', margin: '0 0 10px 0' }}>Something went wrong.</h2>
                    <pre style={{ whiteSpace: 'pre-wrap', color: '#333' }}>
                        {this.state.error ? this.state.error.toString() : 'Unknown Error'}
                    </pre>
                    <pre style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                        {this.state.error && this.state.error.stack}
                    </pre>
                </div>
            );
        }
        return this.props.children;
    }
}

export default function Messages(props: any) {
    return (
        <ErrorBoundary>
            <MessagesContent {...props} />
        </ErrorBoundary>
    );
}

function MessagesContent({ auth, applications: initialApplications }: { auth: any; applications: Application[] }) {
    const admin = auth?.user || { name: 'Admin', id: 0 };
    const appsArray = Array.isArray(initialApplications)
        ? initialApplications
        : (initialApplications ? Object.values(initialApplications) as Application[] : []);
    const [applications, setApplications] = useState<Application[]>(appsArray);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [isSending, setIsSending] = useState(false);
    const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
    const [isClearModalOpen, setIsClearModalOpen] = useState(false);
    const [isPhotoPreviewOpen, setIsPhotoPreviewOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement | null>(null);

    const handleClearConversation = async () => {
        if (!selectedApp) return;
        try {
            await axios.delete(`/messages/${selectedApp.id}`);
            setMessages([]);
            setApplications(prev =>
                prev.map(a =>
                    a.email === selectedApp.email || a.id === selectedApp.id
                        ? { ...a, lastMessage: null, lastMessageTime: null, hasUnreadMessages: false }
                        : a
                )
            );
            toast.success("Conversation cleared.");
            setIsClearModalOpen(false);
        } catch (e: any) {
            console.error("Failed to clear conversation", e);
            toast.error(e.response?.data?.error || "Failed to clear conversation.");
        }
    };

    const filteredApps = React.useMemo(() => {
        const list = (applications || []).filter(app => {
            const name = app.applicantName || 'Applicant';
            const title = app.jobTitle || '';
            const email = app.email || '';
            return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                   email.toLowerCase().includes(searchTerm.toLowerCase());
        });

        // Group by applicant email so each applicant has 1 continuous thread
        const map = new Map<string, Application>();
        list.forEach(app => {
            const key = app.email?.toLowerCase().trim() || String(app.id);
            if (!map.has(key)) {
                map.set(key, app);
            } else {
                const existing = map.get(key)!;
                if (app.hasUnreadMessages) existing.hasUnreadMessages = true;
                if (app.lastMessageTime && (!existing.lastMessageTime || new Date(app.lastMessageTime) > new Date(existing.lastMessageTime))) {
                    existing.lastMessage = app.lastMessage;
                    existing.lastMessageTime = app.lastMessageTime;
                }
            }
        });
        return Array.from(map.values());
    }, [applications, searchTerm]);

    // Scroll to the bottom of the chat area
    const scrollToBottom = () => {
        if (messagesEndRef.current) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const loadMessages = async (appId: number, quiet = false) => {
        try {
            const response = await axios.get(`/messages/${appId}`);
            setMessages(Array.isArray(response.data) ? response.data : []);
            if (!quiet) {
                setTimeout(scrollToBottom, 50);
            }
        } catch (e) {
            console.error("Failed to load messages", e);
        }
    };

    // Auto-select applicant from URL query param or default to first applicant
    useEffect(() => {
        if (filteredApps.length > 0 && !selectedApp) {
            const params = new URLSearchParams(window.location.search);
            const targetId = params.get('appId') || params.get('applicantId');
            const targetEmail = params.get('email');

            let target = null;
            if (targetId || targetEmail) {
                target = filteredApps.find(a => 
                    (targetId && String(a.id) === String(targetId)) ||
                    (targetEmail && a.email?.toLowerCase() === targetEmail.toLowerCase())
                );
            }

            if (target) {
                handleSelectApp(target);
            } else {
                handleSelectApp(filteredApps[0]);
            }
        }
    }, [filteredApps]);

    // Auto-poll messages for the active conversation every 5 seconds
    useEffect(() => {
        if (!selectedApp) return;

        loadMessages(selectedApp.id, true);

        const interval = setInterval(() => {
            loadMessages(selectedApp.id, true);
        }, 5000);

        return () => clearInterval(interval);
    }, [selectedApp]);

    // Update unread status in the sidebar when clicking a chat
    const handleSelectApp = (app: Application) => {
        setSelectedApp(app);
        
        // Instantly mark as read in sidebar state
        setApplications(prev =>
            prev.map(a =>
                a.id === app.id ? { ...a, hasUnreadMessages: false } : a
            )
        );
        loadMessages(app.id);
    };

    // Send a message
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !selectedApp || isSending) return;

        const messageContent = newMessage;
        setNewMessage('');
        setIsSending(true);

        try {
            const response = await axios.post(`/messages/${selectedApp.id}`, {
                content: messageContent
            });

            // Append to messages list
            setMessages(prev => [...prev, response.data]);
            setTimeout(scrollToBottom, 50);

            // Update last message details in sidebar state
            setApplications(prev =>
                prev.map(a =>
                    a.id === selectedApp.id
                        ? {
                              ...a,
                              lastMessage: messageContent,
                              lastMessageTime: new Date().toISOString()
                          }
                        : a
                )
            );
        } catch (e: any) {
            console.error(e);
            toast.error(e.response?.data?.error || "Failed to send message.");
            setNewMessage(messageContent); // Restore text in case of failure
        } finally {
            setIsSending(false);
        }
    };

    // Format message time
    // Format message time
    const formatTime = (timeStr: string | null) => {
        if (!timeStr) return '';
        try {
            const d = new Date(timeStr);
            if (isNaN(d.getTime())) return '';
            return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        } catch {
            return '';
        }
    };

    // Format snippet date
    const formatDateSnippet = (timeStr: string | null) => {
        if (!timeStr) return '';
        try {
            const d = new Date(timeStr);
            if (isNaN(d.getTime())) return '';
            const now = new Date();
            if (d.toDateString() === now.toDateString()) {
                return formatTime(timeStr);
            }
            return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        } catch {
            return '';
        }
    };

    // Color indicators for status
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Submitted': return 'bg-blue-100 text-blue-800';
            case 'Under Review': return 'bg-yellow-100 text-yellow-800';
            case 'Rejected': return 'bg-red-100 text-red-800';
            case 'Hired': return 'bg-green-200 text-green-900';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AdminLayout auth={auth}>
            <div className="container mx-auto px-4 py-4 h-[calc(100vh-140px)] flex flex-col">
                <Card className="flex-1 shadow-xl border-none overflow-hidden bg-white flex flex-col">
                    <div className="flex flex-1 overflow-hidden">
                        
                        {/* LEFT CHATS LIST PANEL (1/3 width) */}
                        <div className={`w-full md:w-80 lg:w-96 border-r border-gray-100 flex flex-col bg-gray-50/50 ${selectedApp ? 'hidden md:flex' : 'flex'}`}>
                            {/* Search Header */}
                            <div className="p-4 border-b border-gray-100 bg-white">
                                <h2 className="text-xl font-bold text-[#193153] mb-3 flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-[#193153]" />
                                    Conversations
                                </h2>
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search applicants..."
                                        value={searchTerm}
                                        onChange={e => setSearchTerm(e.target.value)}
                                        className="pl-9 bg-gray-50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-[#193153]"
                                    />
                                </div>
                            </div>

                            {/* Scrollable Chats list */}
                            <div className="flex-1 overflow-y-auto p-2 space-y-1">
                                {filteredApps.length === 0 ? (
                                    <div className="text-center py-12 text-gray-400">
                                        <p className="text-sm">No conversations found.</p>
                                    </div>
                                ) : (
                                    filteredApps.map(app => {
                                        const isSelected = selectedApp?.id === app.id;
                                        return (
                                            <div
                                                key={app.id}
                                                onClick={() => handleSelectApp(app)}
                                                className={`flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all ${
                                                    isSelected
                                                        ? 'bg-[#193153] text-white shadow-md'
                                                        : 'hover:bg-gray-100 bg-white'
                                                }`}
                                            >
                                                {/* Avatar */}
                                                <div className="relative flex-shrink-0">
                                                    <div className={`w-11 h-11 rounded-full overflow-hidden flex items-center justify-center font-bold text-sm shadow-xs ${
                                                        isSelected ? 'bg-[#ffdd59] text-[#193153]' : 'bg-blue-100 text-blue-800'
                                                    }`}>
                                                        {app.avatar || app.avatar_url ? (
                                                            <img 
                                                                src={app.avatar || app.avatar_url} 
                                                                alt={app.applicantName} 
                                                                className="w-full h-full object-cover" 
                                                                onError={(e) => {
                                                                    const target = e.currentTarget;
                                                                    target.style.display = 'none';
                                                                    const fallback = target.nextElementSibling as HTMLElement;
                                                                    if (fallback) fallback.style.display = 'flex';
                                                                }}
                                                            />
                                                        ) : null}
                                                        <span style={{ display: app.avatar || app.avatar_url ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">
                                                            {(app.applicantName || 'A').charAt(0)}
                                                        </span>
                                                    </div>
                                                    {app.hasUnreadMessages && (
                                                        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5 z-20">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-red-600 border-2 border-white"></span>
                                                        </span>
                                                    )}
                                                </div>

                                                {/* Chat Details */}
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-1">
                                                        <h3 className={`text-sm font-semibold truncate ${
                                                            isSelected ? 'text-white' : 'text-gray-900'
                                                        }`}>
                                                            {app.applicantName}
                                                        </h3>
                                                        <span className={`text-[10px] ${
                                                            isSelected ? 'text-blue-200' : 'text-gray-400'
                                                        }`}>
                                                            {formatDateSnippet(app.lastMessageTime)}
                                                        </span>
                                                    </div>
                                                    <p className={`text-xs truncate ${
                                                        isSelected ? 'text-blue-100' : 'text-gray-500'
                                                    }`}>
                                                        {app.email}
                                                    </p>
                                                    {app.lastMessage && (
                                                        <p className={`text-[11px] truncate mt-0.5 ${
                                                            isSelected ? 'text-yellow-200' : 'text-gray-600'
                                                        } ${app.hasUnreadMessages && !isSelected ? 'font-bold text-[#193153]' : ''}`}>
                                                            {app.lastMessage}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </div>
                        </div>

                        {/* RIGHT CHAT AREA PANEL */}
                        <div className={`flex-1 flex flex-col bg-white ${selectedApp ? 'flex' : 'hidden md:flex'}`}>
                            {selectedApp ? (
                                <>
                                     {/* Chat Header */}
                                     <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white shadow-sm">
                                          <CustomTooltip content="Applicant Profile" side="bottom">
                                              <div 
                                                  className="flex items-center gap-3 cursor-pointer group hover:opacity-95 transition-opacity"
                                                  onClick={() => setIsProfileModalOpen(true)}
                                              >
                                                  {/* Back Button on Mobile */}
                                                  <Button 
                                                      variant="ghost" 
                                                      size="icon" 
                                                      className="md:hidden text-gray-500 hover:text-gray-700 -ml-2 mr-1"
                                                      onClick={(e) => { e.stopPropagation(); setSelectedApp(null); }}
                                                  >
                                                      <ChevronLeft className="w-6 h-6" />
                                                  </Button>

                                                  <div className="w-10 h-10 rounded-full overflow-hidden bg-[#193153] flex items-center justify-center text-[#ffdd59] font-bold text-sm group-hover:ring-2 group-hover:ring-[#ffdd59] transition-all shadow-xs flex-shrink-0">
                                                      {selectedApp.avatar || selectedApp.avatar_url ? (
                                                          <img 
                                                              src={selectedApp.avatar || selectedApp.avatar_url} 
                                                              alt={selectedApp.applicantName} 
                                                              className="w-full h-full object-cover" 
                                                              onError={(e) => {
                                                                  const target = e.currentTarget;
                                                                  target.style.display = 'none';
                                                                  const fallback = target.nextElementSibling as HTMLElement;
                                                                  if (fallback) fallback.style.display = 'flex';
                                                              }}
                                                          />
                                                      ) : null}
                                                      <span style={{ display: selectedApp.avatar || selectedApp.avatar_url ? 'none' : 'flex' }} className="w-full h-full items-center justify-center">
                                                          {(selectedApp.applicantName || 'A').charAt(0)}
                                                      </span>
                                                  </div>
                                                  <div>
                                                      <h3 className="font-bold text-[#193153] text-sm leading-tight flex items-center gap-1.5 group-hover:text-blue-600 transition-colors">
                                                          {selectedApp.applicantName}
                                                          <Eye className="w-3.5 h-3.5 text-blue-600 inline-block opacity-0 group-hover:opacity-100 transition-opacity" />
                                                      </h3>
                                                      <p className="text-xs text-gray-500 font-medium mt-0.5">
                                                          {selectedApp.email}
                                                      </p>
                                                  </div>
                                              </div>
                                          </CustomTooltip>

                                          <div className="flex items-center gap-2">
                                              <CustomTooltip content="Clear Chat" side="bottom">
                                                  <Button
                                                      variant="ghost"
                                                      size="sm"
                                                      className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2.5 py-1 h-8 text-xs flex items-center gap-1.5 rounded-lg border border-red-200 transition-colors cursor-pointer"
                                                      onClick={() => setIsClearModalOpen(true)}
                                                  >
                                                      <Trash2 className="w-3.5 h-3.5" />
                                                      <span className="hidden sm:inline font-medium">Clear Chat</span>
                                                  </Button>
                                              </CustomTooltip>
                                          </div>
                                     </div>

                                    {/* Scrollable Messages Area */}
                                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                                        {messages.length === 0 ? (
                                            <div className="flex flex-col items-center justify-center h-full text-gray-400">
                                                <MessageSquare className="w-12 h-12 mb-2 text-gray-300" />
                                                <p className="text-sm">No messages yet. Send a greeting to begin the chat!</p>
                                            </div>
                                        ) : (
                                            messages.map((msg, idx) => {
                                                const isMe = msg.sender_id === admin.id;
                                                const msgJobTitle = msg.application?.job_title || msg.jobTitle || (idx === 0 ? selectedApp.jobTitle : null);
                                                const prevMsgJobTitle = idx > 0 ? (messages[idx - 1].application?.job_title || messages[idx - 1].jobTitle) : null;
                                                const showTopicDivider = msgJobTitle && msgJobTitle !== prevMsgJobTitle;

                                                return (
                                                    <React.Fragment key={msg.id || idx}>
                                                        {showTopicDivider && (
                                                            <div className="my-2 flex items-center justify-center">
                                                                <span className="text-[10px] font-bold text-[#193153] bg-blue-100/70 px-3 py-1 rounded-full border border-blue-200/60 shadow-2xs">
                                                                    📌 Topic: {msgJobTitle}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div
                                                            className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
                                                        >
                                                            <div className={`max-w-[70%] rounded-2xl px-4 py-2.5 shadow-sm text-sm ${
                                                                isMe
                                                                    ? 'bg-[#193153] text-white rounded-tr-none'
                                                                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                                                            }`}>
                                                                <p className="leading-relaxed whitespace-pre-line">{msg.content}</p>
                                                                <div className={`text-[9px] mt-1 text-right ${
                                                                    isMe ? 'text-blue-200' : 'text-gray-400'
                                                                }`}>
                                                                    {formatTime(msg.created_at)}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </React.Fragment>
                                                );
                                            })
                                        )}
                                        <div ref={messagesEndRef} />
                                    </div>

                                    {/* Input Footer Area */}
                                    <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-100 bg-white">
                                        <div className="flex gap-2">
                                            <Input
                                                placeholder="Type your message here..."
                                                value={newMessage}
                                                onChange={e => setNewMessage(e.target.value)}
                                                disabled={isSending}
                                                className="flex-grow bg-gray-50 border-none shadow-none focus-visible:ring-1 focus-visible:ring-[#193153]"
                                            />
                                            <Button
                                                type="submit"
                                                disabled={!newMessage.trim() || isSending}
                                                className="bg-[#193153] hover:bg-[#ffdd59] hover:text-[#193153] text-white transition-colors"
                                            >
                                                <Send className="w-4 h-4 mr-2" />
                                                Send
                                            </Button>
                                        </div>
                                    </form>
                                </>
                            ) : (
                                /* Empty state when no chat selected */
                                <div className="flex-grow flex flex-col items-center justify-center text-gray-400 p-8">
                                    <div className="bg-blue-50 p-6 rounded-full mb-4">
                                        <MessageSquare className="w-12 h-12 text-[#193153]" />
                                    </div>
                                    <h3 className="font-bold text-gray-700 text-lg mb-1">Select a Conversation</h3>
                                    <p className="text-sm text-center max-w-xs leading-relaxed">
                                        Choose an applicant from the left menu to view, reply, or send notifications directly.
                                    </p>
                                </div>
                            )}
                        </div>

                    </div>
                </Card>

                {/* APPLICANT PROFILE QUICK VIEW MODAL */}
                {selectedApp && (
                    <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
                        <DialogContent className="max-w-md p-6 rounded-2xl">
                            <DialogHeader>
                                <DialogTitle className="text-xl font-bold text-[#193153] flex items-center gap-2">
                                    <User className="w-5 h-5 text-[#ffdd59]" />
                                    Applicant Profile
                                </DialogTitle>
                            </DialogHeader>

                            <div className="space-y-5 pt-2">
                                {/* User Header Card */}
                                <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
                                    <CustomTooltip content="View Full Photo" side="top">
                                        <div 
                                            className="w-14 h-14 rounded-full overflow-hidden bg-[#193153] text-[#ffdd59] flex items-center justify-center font-bold text-xl ring-4 ring-blue-50 flex-shrink-0 cursor-pointer hover:ring-[#ffdd59] transition-all group relative"
                                            onClick={() => {
                                                if (selectedApp.avatar || selectedApp.avatar_url) {
                                                    setIsPhotoPreviewOpen(true);
                                                }
                                            }}
                                        >
                                            {selectedApp.avatar || selectedApp.avatar_url ? (
                                                <>
                                                    <img 
                                                        src={selectedApp.avatar || selectedApp.avatar_url} 
                                                        alt={selectedApp.applicantName} 
                                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-200" 
                                                        onError={(e) => {
                                                            const target = e.currentTarget;
                                                            target.style.display = 'none';
                                                            const fallback = target.parentElement?.nextElementSibling as HTMLElement;
                                                            if (fallback) fallback.style.display = 'flex';
                                                        }}
                                                    />
                                                    <div className="absolute inset-0 bg-black/25 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                                                        <ZoomIn className="w-4 h-4 text-white drop-shadow-md" />
                                                    </div>
                                                </>
                                            ) : null}
                                            <span style={{ display: selectedApp.avatar || selectedApp.avatar_url ? 'none' : 'flex' }} className="w-full h-full items-center justify-center font-bold text-xl">
                                                {(selectedApp.applicantName || 'A').charAt(0)}
                                            </span>
                                        </div>
                                    </CustomTooltip>
                                    <div>
                                        <h3 className="font-bold text-[#193153] text-lg leading-tight">{selectedApp.applicantName}</h3>
                                        <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                                            <Mail className="w-3.5 h-3.5 text-blue-600" />
                                            {selectedApp.email}
                                        </p>
                                        {selectedApp.phone && selectedApp.phone !== 'N/A' && (
                                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5 mt-0.5">
                                                <User className="w-3.5 h-3.5 text-blue-600" />
                                                {selectedApp.phone}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                {/* Account Profile - Personal Info Section */}
                                <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-2xs space-y-3 text-xs">
                                    <h4 className="font-bold text-[#193153] flex items-center gap-1.5 border-b pb-2 text-xs uppercase tracking-wider">
                                        <User className="w-3.5 h-3.5 text-blue-600" />
                                        Personal Information
                                    </h4>

                                    {(() => {
                                        const prof = selectedApp.profile_data || {};
                                        const nameParts = (selectedApp.applicantName || '').split(' ');
                                        const firstName = prof.firstName || nameParts[0] || '-';
                                        const lastName = prof.lastName || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : '-') || '-';
                                        const middleName = prof.middleName || '-';
                                        const extensionName = prof.extensionName || '-';
                                        const age = prof.age || '-';
                                        const sex = prof.sex || '-';
                                        const civilStatus = prof.civilStatus || '-';
                                        const religion = prof.religion || '-';
                                        const phone = prof.phone || selectedApp.phone || '-';
                                        const address = prof.address || selectedApp.address || '-';
                                        const isIP = prof.isIP || 'No';
                                        const isPWD = prof.isPWD || 'No';

                                        return (
                                            <div className="space-y-3">
                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Last Name</span>
                                                        <p className="font-semibold text-gray-800 mt-0.5">{lastName}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">First Name</span>
                                                        <p className="font-semibold text-gray-800 mt-0.5">{firstName}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Middle Name</span>
                                                        <p className="font-semibold text-gray-800 mt-0.5">{middleName}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Extension Name</span>
                                                        <p className="font-semibold text-gray-800 mt-0.5">{extensionName}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Age</span>
                                                        <p className="font-semibold text-gray-800 mt-0.5">{age}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Sex</span>
                                                        <p className="font-semibold text-gray-800 mt-0.5">{sex}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-3">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Civil Status</span>
                                                        <p className="font-semibold text-gray-800 mt-0.5">{civilStatus}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Religion</span>
                                                        <p className="font-semibold text-gray-800 mt-0.5">{religion}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">Phone</span>
                                                        <p className="font-semibold text-gray-800 mt-0.5 truncate">{phone}</p>
                                                    </div>
                                                </div>

                                                <div>
                                                    <span className="text-[10px] font-bold text-gray-400 uppercase">Residential Address</span>
                                                    <p className="font-semibold text-gray-800 mt-0.5 leading-relaxed">{address}</p>
                                                </div>

                                                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100">
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">IP Group?</span>
                                                        <p className="font-semibold text-gray-800 mt-0.5">{isIP}</p>
                                                    </div>
                                                    <div>
                                                        <span className="text-[10px] font-bold text-gray-400 uppercase">PWD?</span>
                                                        <p className="font-semibold text-gray-800 mt-0.5">{isPWD}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })()}
                                </div>

                                {/* Modal Actions */}
                                <div className="pt-2 flex gap-3">
                                    <Button
                                        variant="outline"
                                        className="flex-1"
                                        onClick={() => setIsProfileModalOpen(false)}
                                    >
                                        Close
                                    </Button>
                                    <a 
                                        href={`/admin/applicants?search=${encodeURIComponent(selectedApp.applicantName)}`}
                                        className="flex-1"
                                    >
                                        <Button className="w-full bg-[#193153] hover:bg-[#ffdd59] hover:text-[#193153] text-white font-semibold text-xs gap-1.5">
                                            Full Applicant Evaluation
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </Button>
                                    </a>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {/* --- FULL PROFILE PHOTO PREVIEW MODAL --- */}
                {selectedApp && (selectedApp.avatar || selectedApp.avatar_url) && (
                    <Dialog open={isPhotoPreviewOpen} onOpenChange={setIsPhotoPreviewOpen}>
                        <DialogContent className="max-w-md bg-[#193153] border border-slate-700 p-3 shadow-2xl rounded-2xl">
                            <div className="flex flex-col items-center">
                                <div className="w-full overflow-hidden rounded-xl bg-slate-900 border border-slate-700/80 flex items-center justify-center p-1">
                                    <img 
                                        src={selectedApp.avatar || selectedApp.avatar_url} 
                                        alt={selectedApp.applicantName} 
                                        className="max-h-[75vh] w-auto object-contain rounded-lg shadow-md"
                                    />
                                </div>
                                <div className="pt-3 pb-1 text-center">
                                    <h3 className="font-bold text-white text-base">{selectedApp.applicantName}</h3>
                                    <p className="text-xs text-amber-400 font-medium mt-0.5">{selectedApp.email}</p>
                                </div>
                            </div>
                        </DialogContent>
                    </Dialog>
                )}

                {/* --- CLEAR CONVERSATION CONFIRMATION MODAL --- */}
                <Dialog open={isClearModalOpen} onOpenChange={setIsClearModalOpen}>
                    <DialogContent className="sm:max-w-md bg-[#193153] text-white border-slate-700 shadow-2xl rounded-2xl p-6">
                        <DialogHeader className="flex flex-col items-center text-center space-y-3 pt-2">
                            <div className="w-14 h-14 rounded-full bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                                <Trash2 className="w-7 h-7" />
                            </div>
                            <DialogTitle className="text-xl font-bold text-white tracking-wide">
                                Clear Conversation History?
                            </DialogTitle>
                        </DialogHeader>

                        <div className="text-center text-slate-300 text-sm py-3 space-y-2">
                            <p>
                                Are you sure you want to delete all chat messages with{' '}
                                <strong className="text-white font-semibold">{selectedApp?.applicantName || 'this applicant'}</strong>
                                {selectedApp?.jobTitle ? <> for <span className="text-amber-400 font-medium">{selectedApp.jobTitle}</span></> : ''}?
                            </p>
                            <p className="text-xs text-red-400 font-medium">
                                This will permanently delete the conversation history for both Admin and the Applicant.
                            </p>
                        </div>

                        <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end border-t border-slate-700/60 pt-4 mt-2">
                            <button
                                type="button"
                                onClick={() => setIsClearModalOpen(false)}
                                className="px-4 py-2 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors cursor-pointer w-full sm:w-auto"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleClearConversation}
                                className="px-5 py-2 rounded-xl bg-red-600 hover:bg-red-500 active:bg-red-700 text-white text-sm font-semibold transition-all shadow-md shadow-red-900/30 cursor-pointer w-full sm:w-auto"
                            >
                                Yes, Clear Chat
                            </button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AdminLayout>
    );
}
