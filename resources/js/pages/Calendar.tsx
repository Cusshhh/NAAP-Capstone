import { Head, Link, usePage } from '@inertiajs/react';
import { Calendar as CalendarIcon, ChevronLeft, Clock, MapPin, MoreHorizontal, Plus, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockEvents, getJobs } from '@/data/mockData';

interface CalendarProps {
    applications?: any[];
    jobs?: any[];
}

export default function Calendar({ applications = [], jobs = [] }: CalendarProps) {
    const { auth } = usePage().props as any;
    const user = auth.user;

    const [dbCustomEvents, setDbCustomEvents] = useState<any[]>([]);
    const [dbInterviews, setDbInterviews] = useState<any[]>([]);

    // Helper to build dynamic and custom user events
    const buildEvents = (customEventsList: any[] = [], interviewsList: any[] = []) => {
        const eventsList: any[] = [];
        
        // 1. General Events (webinars, school events)
        eventsList.push({
            id: 'gen_1',
            title: 'NAAP Career Fair Webinar',
            date: 'Feb 20, 2026',
            time: '2:00 PM',
            type: 'Meeting'
        });



        // Load real Scheduled Interviews from admin
        const localSavedInterviews = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('scheduled_interviews_custom') || '[]') : [];
        const allInterviews = [...interviewsList, ...localSavedInterviews].reduce((acc: any[], item: any) => {
            const idKey = item.applicationId || item.application_id || item.id;
            if (!acc.some(x => (x.applicationId || x.application_id || x.id) === idKey)) {
                acc.push(item);
            }
            return acc;
        }, []);

        allInterviews.forEach((interview: any) => {
            if (!interview) return;
            const candidateName = (interview.candidateName || interview.candidate_name || '').toLowerCase();
            const applicantEmail = (interview.applicantEmail || interview.applicant_email || '').toLowerCase();
            const userName = (user?.name || '').toLowerCase();
            const userEmail = (user?.email || '').toLowerCase();
            const userId = String(user?.id || '').toLowerCase();

            const nameMatches = candidateName && (
                candidateName.includes(userName) ||
                userName.includes(candidateName)
            );
            const emailMatches = applicantEmail && (
                applicantEmail === userEmail ||
                applicantEmail === userId
            );

            if (nameMatches || emailMatches) {
                let formattedDate = interview.date;
                try {
                    const dateObj = new Date(interview.date);
                    formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                } catch (e) {}

                // Find matching application to get jobId
                const matchingApp = applications.find((a: any) => (a.jobTitle || '').toLowerCase() === (interview.position || '').toLowerCase());

                eventsList.push({
                    id: `real_interview_${interview.id || interview.date + '_' + interview.time}`,
                    title: `Interview: ${interview.position || 'School Nurse'}`,
                    date: formattedDate,
                    time: interview.time,
                    venue: interview.venue,
                    panelMembers: interview.panelMembers || interview.panel_members,
                    type: 'Interview',
                    jobId: matchingApp ? matchingApp.jobId : null
                });
            }
        });

        // Load custom events from database & applicant LocalStorage
        const localCustom = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(`applicant_custom_events_${user?.id || 'guest'}`) || '[]') : [];
        const formattedDbEvents = customEventsList.map((e: any) => {
            let formattedDate = e.date;
            try {
                const dateObj = new Date(e.date);
                formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            } catch (err) {}
            return {
                id: e.id,
                title: e.title,
                date: formattedDate,
                time: e.time,
                type: e.type,
                venue: e.venue,
            };
        });

        const allCustomEvents = [...formattedDbEvents, ...localCustom].reduce((acc: any[], item: any) => {
            if (!acc.some(x => String(x.id) === String(item.id))) {
                acc.push(item);
            }
            return acc;
        }, []);
        
        // Sort events by date descending (newest/most recent first)
        return [...eventsList, ...allCustomEvents].sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        });
    };

    // Local state for interactive events
    const [events, setEvents] = useState<any[]>([]);

    // Fetch DB calendar events and interviews on mount
    React.useEffect(() => {
        const fetchDbData = async () => {
            try {
                const [eventsRes, interviewsRes] = await Promise.all([
                    axios.get('/calendar/events'),
                    axios.get('/admin/interviews')
                ]);
                setDbCustomEvents(eventsRes.data);
                setDbInterviews(interviewsRes.data);
            } catch (e) {
                console.error("Failed to load DB calendar events/interviews", e);
            }
        };
        fetchDbData();
    }, []);

    // Sync state if applications, jobs, or database events change
    React.useEffect(() => {
        setEvents(buildEvents(dbCustomEvents, dbInterviews));

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'custom_calendar_events' || e.key === 'scheduled_interviews_custom') {
                setEvents(buildEvents(dbCustomEvents, dbInterviews));
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [dbCustomEvents, dbInterviews, applications, jobs]);

    // Form state
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: '',
        time: '',
        type: 'Personal'
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddEvent = async () => {
        if (!newEvent.title || !newEvent.date || !newEvent.time) {
            toast.error("Please fill in all fields.");
            return;
        }

        let dateObj = new Date(newEvent.date);
        if (isNaN(dateObj.getTime()) && newEvent.date.includes('-')) {
            const parts = newEvent.date.split('-').map(Number);
            if (parts[0] > 1000) {
                dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
            } else {
                dateObj = new Date(parts[2], parts[0] - 1, parts[1]);
            }
        } else if (isNaN(dateObj.getTime()) && newEvent.date.includes('/')) {
            const parts = newEvent.date.split('/').map(Number);
            if (parts[2] > 1000) {
                dateObj = new Date(parts[2], parts[0] - 1, parts[1]);
            } else {
                dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
            }
        }

        if (isNaN(dateObj.getTime())) {
            dateObj = new Date();
        }

        const yyyy = dateObj.getFullYear();
        const mm = String(dateObj.getMonth() + 1).padStart(2, '0');
        const dd = String(dateObj.getDate()).padStart(2, '0');
        const isoDate = `${yyyy}-${mm}-${dd}`;
        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        let dbEvent: any = null;
        try {
            const response = await axios.post('/calendar/events', {
                title: newEvent.title,
                date: isoDate,
                time: newEvent.time,
                type: newEvent.type
            });
            dbEvent = response.data;
        } catch (e: any) {
            console.warn("Saving event with local fallback", e);
        }

        const eventToAdd = dbEvent ? {
            id: dbEvent.id,
            title: dbEvent.title,
            date: formattedDate,
            time: dbEvent.time,
            type: dbEvent.type
        } : {
            id: `local_${Date.now()}`,
            title: newEvent.title,
            date: formattedDate,
            time: newEvent.time,
            type: newEvent.type
        };

        const storageKey = `applicant_custom_events_${user?.id || 'guest'}`;
        if (dbEvent) {
            setDbCustomEvents([dbEvent, ...dbCustomEvents]);
        } else {
            const localCustom = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem(storageKey) || '[]') : [];
            const updated = [eventToAdd, ...localCustom];
            if (typeof window !== 'undefined') {
                localStorage.setItem(storageKey, JSON.stringify(updated));
            }
            setEvents(prev => [eventToAdd, ...prev]);
        }

        setNewEvent({ title: '', date: '', time: '', type: 'Personal' });
        setIsDialogOpen(false);
        toast.success("Event added successfully!");
    };

    const handleDeleteEvent = async (id: any) => {
        const storageKey = `applicant_custom_events_${user?.id || 'guest'}`;
        const isDbEvent = dbCustomEvents.some(e => String(e.id) === String(id));
        if (isDbEvent) {
            try {
                await axios.delete(`/calendar/events/${id}`);
                setDbCustomEvents(dbCustomEvents.filter(e => String(e.id) !== String(id)));
            } catch (e: any) {
                console.error(e);
                toast.error(e.response?.data?.error || "Failed to delete event from database.");
                return;
            }
        } else {
            const localCustom = JSON.parse(localStorage.getItem(storageKey) || '[]');
            const updated = localCustom.filter((e: any) => String(e.id) !== String(id));
            localStorage.setItem(storageKey, JSON.stringify(updated));
            setEvents(buildEvents(dbCustomEvents, dbInterviews));
        }

        toast.success("Event removed.");
    };

    // State for current view (Month/Year)
    // Default to current Date() or URL date query parameter if present
    const [currentDate, setCurrentDate] = useState(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const dateParam = params.get('date');
            if (dateParam) {
                const parsed = new Date(dateParam);
                if (!isNaN(parsed.getTime())) {
                    return parsed;
                }
            }
        }
        return new Date();
    });

    React.useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            const dateParam = params.get('date');
            if (dateParam) {
                const parsed = new Date(dateParam);
                if (!isNaN(parsed.getTime())) {
                    setCurrentDate(parsed);
                }
            }
        }
    }, []);

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        // Format for input value: YYYY-MM-DD
        // Note: Manual formatting to avoid timezone offsets causing "previous day" bugs
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;

        setNewEvent({ ...newEvent, date: dateStr });
        setIsDialogOpen(true);
    };

    // Helper to generate dynamic calendar days
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth(); // 0-indexed

    // Get number of days in current month
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    // Get day of week for the 1st of the month (0 = Sunday)
    const startDay = new Date(year, month, 1).getDay();

    // Total slots needed (blank slots + days)
    const totalSlots = startDay + daysInMonth;
    // Round up to nearest row (7 days) for clean grid, usually 35 or 42
    // We'll use a dynamic array size to fit content
    const calendarGridSize = totalSlots <= 35 ? 35 : 42;

    const calendarDays = Array.from({ length: calendarGridSize }, (_, i) => {
        const day = i - startDay + 1;
        if (day <= 0 || day > daysInMonth) return null;

        // Generate the exact date string for this specific day cell
        // We use the same formatting as the event data ("Feb 12, 2026")
        const currentDayDate = new Date(year, month, day);
        const dateString = currentDayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        // Find events that match this exact date string
        const eventsForDay = events.filter(e => e.date === dateString);

        return { day, events: eventsForDay };
    });

    return (
        <div className="min-h-screen bg-gray-50">
            <Head title="My Calendar" />

            {/* Top Header Banner */}
            <div className="bg-[#193153] text-white py-12 mb-8 rounded-b-3xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CalendarIcon className="w-32 h-32" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-blue-200">
                                <a href="/dashboard" className="hover:text-white transition-colors flex items-center gap-1">
                                    <ChevronLeft className="w-4 h-4" />
                                    Dashboard
                                </a>
                                <span>/</span>
                                <span className="text-white font-medium">Calendar</span>
                            </div>
                            <h1 className="text-4xl font-extrabold mb-2 tracking-tight">NAAP Schedule</h1>
                            <p className="text-blue-100 max-w-xl text-lg">Manage interviews, deadlines, and upcoming events with ease.</p>
                        </div>
                        <div className="text-left md:text-right bg-white/10 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                            <p className="text-xl font-bold">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</p>
                            <p className="text-blue-200 text-sm mt-1">{new Date().getFullYear()}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Calendar Grid */}
                    <div className="lg:col-span-2">
                        <Card className="h-full border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="flex flex-row items-center justify-between p-6 bg-gray-50/50 border-b">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <CalendarIcon className="w-5 h-5 text-blue-600" />
                                        </div>

                                        {/* Month Selector */}
                                        <Select
                                            value={currentDate.getMonth().toString()}
                                            onValueChange={(val) => {
                                                const newDate = new Date(currentDate);
                                                newDate.setMonth(parseInt(val));
                                                setCurrentDate(newDate);
                                            }}
                                        >
                                            <SelectTrigger className="w-auto border-none shadow-none font-bold text-2xl h-auto p-0 focus:ring-0 gap-2 bg-transparent text-[#193153]">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Array.from({ length: 12 }, (_, i) => (
                                                    <SelectItem key={i} value={i.toString()}>
                                                        {new Date(0, i).toLocaleString('default', { month: 'long' })}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        {/* Year Selector */}
                                        <Select
                                            value={currentDate.getFullYear().toString()}
                                            onValueChange={(val) => {
                                                const newDate = new Date(currentDate);
                                                newDate.setFullYear(parseInt(val));
                                                setCurrentDate(newDate);
                                            }}
                                        >
                                            <SelectTrigger className="w-auto border-none shadow-none font-bold text-2xl h-auto p-0 focus:ring-0 text-gray-400 gap-2 bg-transparent">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px]">
                                                {Array.from({ length: 20 }, (_, i) => (
                                                    <SelectItem key={i} value={(2020 + i).toString()}>
                                                        {2020 + i}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex gap-2 items-center">
                                    <div className="flex bg-white rounded-xl border p-1 shadow-sm mr-2">
                                        <Button variant="ghost" size="icon" onClick={handlePrevMonth} className="h-8 w-8 rounded-lg">
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="ghost" size="icon" onClick={handleNextMonth} className="h-8 w-8 rounded-lg">
                                            <ChevronLeft className="h-4 w-4 rotate-180" />
                                        </Button>
                                    </div>

                                    {/* Add Event Dialog */}
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogContent className="sm:max-w-[425px]">
                                            <DialogHeader>
                                                <DialogTitle className="text-2xl font-bold text-[#193153]">Add Calendar Event</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-6 py-6">
                                                <div className="space-y-2">
                                                    <Label htmlFor="title">Event Title</Label>
                                                    <Input
                                                        id="title"
                                                        value={newEvent.title}
                                                        onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                                        placeholder="e.g., Document Submission"
                                                        className="h-12 border-gray-200 focus:ring-[#193153]"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2">
                                                        <Label htmlFor="date">Date</Label>
                                                        <Input
                                                            id="date"
                                                            type="date"
                                                            value={newEvent.date}
                                                            onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                                            className="h-12 border-gray-200 focus:ring-[#193153]"
                                                        />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor="time">Time</Label>
                                                        <Input
                                                            id="time"
                                                            type="time"
                                                            value={newEvent.time}
                                                            onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                                                            className="h-12 border-gray-200 focus:ring-[#193153]"
                                                        />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label htmlFor="type">Event Category</Label>
                                                    <Select
                                                        value={newEvent.type}
                                                        onValueChange={val => setNewEvent({ ...newEvent, type: val })}
                                                    >
                                                        <SelectTrigger className="h-12 border-gray-200 focus:ring-[#193153]">
                                                            <SelectValue placeholder="Select type" />
                                                        </SelectTrigger>
                                                        <SelectContent>
                                                            <SelectItem value="Personal">Personal</SelectItem>
                                                            <SelectItem value="Interview">Interview</SelectItem>
                                                            <SelectItem value="Deadline">Deadline</SelectItem>
                                                            <SelectItem value="Meeting">Meeting</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </div>
                                            </div>
                                            <DialogFooter className="gap-2 sm:gap-0">
                                                <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-12 rounded-xl">Cancel</Button>
                                                <Button onClick={handleAddEvent} className="h-12 rounded-xl bg-[#193153] hover:bg-[#2a4a75]">Create Event</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent className="p-0">
                                {/* Weekday Headers */}
                                <div className="grid grid-cols-7 text-center border-b bg-gray-50/30">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-[10px] font-bold text-gray-400 uppercase tracking-widest py-4">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Days */}
                                <div className="grid grid-cols-7 auto-rows-fr h-[600px]">
                                    {calendarDays.map((date, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => date && handleDateClick(date.day)}
                                            className={`
                                                relative p-3 border-r border-b last:border-r-0 transition-all overflow-hidden group
                                                ${!date ? 'bg-gray-50/50' : 'bg-white hover:bg-blue-50/30 cursor-pointer'}
                                            `}
                                        >
                                            {date && (
                                                <>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className={`
                                                            text-sm font-bold w-7 h-7 flex items-center justify-center rounded-lg
                                                            ${(date.day === new Date().getDate() &&
                                                                month === new Date().getMonth() &&
                                                                year === new Date().getFullYear())
                                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'text-gray-400 group-hover:text-blue-600'}
                                                        `}>
                                                            {date.day}
                                                        </span>
                                                        <div className="bg-blue-50 p-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Plus className="w-3 h-3 text-blue-600" />
                                                        </div>
                                                    </div>

                                                    <div className="space-y-1.5 max-h-[100px] overflow-hidden">
                                                        {date.events.map((event, i) => {
                                                            const tag = (
                                                                <div className={`
                                                                    text-[10px] px-2 py-1 rounded-md truncate font-semibold shadow-sm
                                                                    ${event.type === 'Deadline' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                                        event.type === 'Interview' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                                            'bg-gray-50 text-gray-700 border border-gray-100'}
                                                                `}>
                                                                    {event.title}
                                                                </div>
                                                            );
                                                            return event.jobId ? (
                                                                <Link key={i} href={`/jobs/${event.jobId}`} className="block">
                                                                    {tag}
                                                                </Link>
                                                            ) : (
                                                                <div key={i}>{tag}</div>
                                                            );
                                                        })}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar Events List */}
                    <div className="space-y-6">
                        <Card className="border-none shadow-xl rounded-3xl overflow-hidden bg-white">
                            <CardHeader className="bg-[#193153] p-6">
                                <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-blue-300" />
                                    Schedules
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0 max-h-[700px] overflow-y-auto">
                                {events.length === 0 ? (
                                    <div className="p-12 text-center text-gray-400">
                                        <CalendarIcon className="w-12 h-12 mx-auto mb-4 opacity-20" />
                                        <p className="font-medium">No events scheduled yet.</p>
                                        <p className="text-xs mt-1">Click on a date to add one.</p>
                                    </div>
                                ) : (
                                    events.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((event, index) => (
                                        <div 
                                            key={index} 
                                            onClick={() => {
                                                if (event.jobId) {
                                                    window.location.href = `/jobs/${event.jobId}`;
                                                } else {
                                                    const d = new Date(event.date);
                                                    if (!isNaN(d.getTime())) {
                                                        setCurrentDate(d);
                                                    }
                                                }
                                            }}
                                            className="px-6 py-5 border-b last:border-0 hover:bg-gray-50 transition-all group relative cursor-pointer"
                                        >
                                            <div className="flex items-start gap-5">
                                                <div className={`flex-shrink-0 w-14 text-center rounded-2xl py-3 shadow-md ${
                                                    event.type === 'Deadline' ? 'bg-red-600 text-white' :
                                                    event.type === 'Interview' ? 'bg-blue-600 text-white' :
                                                        'bg-gray-800 text-white'
                                                }`}>
                                                    <span className="block text-[10px] font-black uppercase tracking-tighter opacity-80">{event.date.split(' ')[0] || ''}</span>
                                                    <span className="block text-2xl font-black leading-none">{event.date.split(' ')[1]?.replace(',', '') || ''}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <h4 className="text-sm font-black text-gray-900 leading-none truncate pr-6">{event.title}</h4>
                                                    </div>
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        <span className="text-[10px] flex items-center gap-1 text-gray-500 font-bold bg-gray-100 px-2 py-0.5 rounded-full">
                                                            <Clock className="w-3 h-3" />
                                                            {event.time}
                                                        </span>
                                                        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-tighter
                                                            ${event.type === 'Deadline' ? 'bg-red-100 text-red-700' :
                                                              event.type === 'Interview' ? 'bg-blue-100 text-blue-700' :
                                                              'bg-gray-200 text-gray-700'}`}>
                                                            {event.type}
                                                        </span>
                                                    </div>
                                                    {event.venue && (
                                                        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-medium">
                                                            <MapPin className="w-3 h-3" />
                                                            {event.venue}
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                            {(!event.id.toString().startsWith('real_interview_') && event.id !== 'gen_1') && (
                                                <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="icon"
                                                        variant="secondary"
                                                        className="h-8 w-8 rounded-full text-red-500 hover:bg-red-50 hover:text-red-600 shadow-sm"
                                                        onClick={(e) => { e.stopPropagation(); handleDeleteEvent(event.id); }}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
