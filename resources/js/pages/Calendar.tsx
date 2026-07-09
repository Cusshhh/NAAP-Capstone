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

    // Helper to build dynamic and custom user events
    const buildEvents = () => {
        const eventsList: any[] = [];
        
        // 1. General Events (webinars, school events)
        eventsList.push({
            id: 'gen_1',
            title: 'NAAP Career Fair Webinar',
            date: 'Feb 20, 2026',
            time: '2:00 PM',
            type: 'Meeting'
        });

        // 2. Deadlines for applications
        applications.forEach((app: any) => {
            const job = jobs.find((j: any) => String(j.id) === String(app.jobId)) || getJobs().find((j: any) => String(j.id) === String(app.jobId));
            if (job && job.deadline) {
                const dateObj = new Date(job.deadline);
                const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                eventsList.push({
                    id: `dl_${app.id}`,
                    jobId: job.id,
                    title: `Application Deadline: ${app.jobTitle}`,
                    date: formattedDate,
                    time: '11:59 PM',
                    type: 'Deadline'
                });
            }

            // 3. Interview events if application is in "Interview" or "Under Review" status
            if (app.status === 'Interview' || app.status === 'Under Review') {
                const baseDate = app.submittedDate ? new Date(app.submittedDate) : new Date();
                const eventDate = new Date(baseDate);
                eventDate.setDate(baseDate.getDate() + 5);
                const formattedDate = eventDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                
                eventsList.push({
                    id: `interview_${app.id}`,
                    jobId: app.jobId,
                    title: app.status === 'Interview' ? `Initial Interview - ${app.jobTitle}` : `Technical Assessment - ${app.jobTitle}`,
                    date: formattedDate,
                    time: '10:00 AM',
                    type: app.status === 'Interview' ? 'Interview' : 'Deadline'
                });
            }
        });

        // Load real Scheduled Interviews from admin
        try {
            const savedInterviews = JSON.parse(localStorage.getItem('scheduled_interviews_custom') || '[]');
            savedInterviews.forEach((interview: any) => {
                if (!interview) return;
                const candidateName = (interview.candidateName || '').toLowerCase();
                const applicantEmail = (interview.applicantEmail || '').toLowerCase();
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

                    eventsList.push({
                        id: `real_interview_${interview.date}_${interview.time}`,
                        title: `Interview: ${interview.position || 'School Nurse'}`,
                        date: formattedDate,
                        time: interview.time,
                        venue: interview.venue,
                        panelMembers: interview.panelMembers,
                        type: 'Interview'
                    });
                }
            });
        } catch (e) {}

        // Load custom events from LocalStorage
        const localCustom = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('custom_calendar_events') || '[]') : [];
        
        // Sort events by date descending (newest/most recent first)
        return [...eventsList, ...localCustom].sort((a, b) => {
            const dateA = a.date ? new Date(a.date).getTime() : 0;
            const dateB = b.date ? new Date(b.date).getTime() : 0;
            return dateB - dateA;
        });
    };

    // Local state for interactive events
    const [events, setEvents] = useState(() => buildEvents());

    // Sync state if applications or jobs update, or storage changes
    React.useEffect(() => {
        setEvents(buildEvents());

        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'custom_calendar_events' || e.key === 'scheduled_interviews_custom') {
                setEvents(buildEvents());
            }
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [applications, jobs]);

    // Form state
    const [newEvent, setNewEvent] = useState({
        title: '',
        date: '',
        time: '',
        type: 'Personal'
    });
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddEvent = () => {
        if (!newEvent.title || !newEvent.date || !newEvent.time) {
            toast.error("Please fill in all fields.");
            return;
        }

        // Fix: Parse input YYYY-MM-DD directly to local components to avoid UTC timezone shifts
        const [y, m, d] = newEvent.date.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);

        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const eventToAdd = {
            id: Date.now().toString(), // simple unique ID
            title: newEvent.title,
            date: formattedDate,
            time: newEvent.time,
            type: newEvent.type
        };

        const updated = [...events, eventToAdd];
        setEvents(updated);

        // Save only numeric ID events as user custom-added ones
        const customOnly = updated.filter(e => String(e.id).match(/^\d+$/));
        localStorage.setItem('custom_calendar_events', JSON.stringify(customOnly));

        setNewEvent({ title: '', date: '', time: '', type: 'Personal' });
        setIsDialogOpen(false);
        toast.success("Event added successfully!");
    };

    const handleDeleteEvent = (id: any) => {
        const updated = events.filter(e => String(e.id) !== String(id));
        setEvents(updated);

        const customOnly = updated.filter(e => String(e.id).match(/^\d+$/));
        localStorage.setItem('custom_calendar_events', JSON.stringify(customOnly));

        toast.success("Event removed.");
    };

    // State for current view (Month/Year)
    // Default to current Date()
    const [currentDate, setCurrentDate] = useState(new Date());

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

            {/* Header */}
            <div className="bg-[#193153] text-white py-8">
                <div className="container mx-auto px-4">
                    <div className="flex items-center gap-4 mb-6">
                        <Link href="/dashboard">
                            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-[#ffdd59]">
                                <ChevronLeft className="mr-2 h-4 w-4" />
                                Back to Dashboard
                            </Button>
                        </Link>
                    </div>
                    <div className="flex justify-between items-end">
                        <div>
                            <h1 className="text-3xl font-bold mb-2">My Schedule</h1>
                            <p className="text-blue-200">Manage your interviews, deadlines, and upcoming events.</p>
                        </div>
                        <div className="hidden md:block text-right">
                            <p className="text-lg font-semibold">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Main Calendar Grid */}
                    <div className="lg:col-span-2">
                        <Card className="h-full border-none shadow-md">
                            <CardHeader className="flex flex-row items-center justify-between pb-4 border-b">
                                <div className="flex items-center gap-4">
                                    <div className="flex items-center gap-2">
                                        <CalendarIcon className="w-5 h-5 text-blue-600" />

                                        {/* Month Selector */}
                                        <Select
                                            value={currentDate.getMonth().toString()}
                                            onValueChange={(val) => {
                                                const newDate = new Date(currentDate);
                                                newDate.setMonth(parseInt(val));
                                                setCurrentDate(newDate);
                                            }}
                                        >
                                            <SelectTrigger className="w-[130px] border-none shadow-none font-bold text-xl h-auto p-0 focus:ring-0">
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
                                            <SelectTrigger className="w-[80px] border-none shadow-none font-bold text-xl h-auto p-0 focus:ring-0 text-gray-500">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="max-h-[300px]">
                                                {Array.from({ length: 100 }, (_, i) => (
                                                    <SelectItem key={i} value={(2026 + i).toString()}>
                                                        {2026 + i}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                <div className="flex gap-2 items-center">
                                    <div className="flex mr-2">
                                        <Button variant="outline" size="sm" onClick={handlePrevMonth} className="rounded-r-none px-2">
                                            <ChevronLeft className="h-4 w-4" />
                                        </Button>
                                        <Button variant="outline" size="sm" onClick={handleNextMonth} className="rounded-l-none px-2 border-l-0">
                                            <ChevronLeft className="h-4 w-4 rotate-180" />
                                        </Button>
                                    </div>

                                    {/* Controlled Dialog without Trigger Button */}
                                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                                        <DialogContent>
                                            <DialogHeader>
                                                <DialogTitle>Add New Event</DialogTitle>
                                            </DialogHeader>
                                            <div className="grid gap-4 py-4">
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="title" className="text-right">Event Title</Label>
                                                    <Input
                                                        id="title"
                                                        value={newEvent.title}
                                                        onChange={e => setNewEvent({ ...newEvent, title: e.target.value })}
                                                        className="col-span-3"
                                                        placeholder="e.g., Technical Interview at NAAP"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="date" className="text-right">Date</Label>
                                                    <Input
                                                        id="date"
                                                        type="date"
                                                        value={newEvent.date}
                                                        onChange={e => setNewEvent({ ...newEvent, date: e.target.value })}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="time" className="text-right">Time</Label>
                                                    <Input
                                                        id="time"
                                                        type="time"
                                                        value={newEvent.time}
                                                        onChange={e => setNewEvent({ ...newEvent, time: e.target.value })}
                                                        className="col-span-3"
                                                    />
                                                </div>
                                                <div className="grid grid-cols-4 items-center gap-4">
                                                    <Label htmlFor="type" className="text-right">Type</Label>
                                                    <div className="col-span-3">
                                                        <Select
                                                            value={newEvent.type}
                                                            onValueChange={val => setNewEvent({ ...newEvent, type: val })}
                                                        >
                                                            <SelectTrigger>
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
                                            </div>
                                            <DialogFooter>
                                                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                                                <Button onClick={handleAddEvent}>Save Event</Button>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                {/* Weekday Headers */}
                                <div className="grid grid-cols-7 text-center mb-4">
                                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                        <div key={day} className="text-xs font-bold text-gray-500 uppercase tracking-wider py-2">
                                            {day}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Days */}
                                <div className="grid grid-cols-7 auto-rows-fr gap-2 h-[500px]">
                                    {calendarDays.map((date, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => date && handleDateClick(date.day)}
                                            className={`
                                                relative p-2 rounded-lg border transition-all overflow-hidden
                                                ${!date ? 'bg-gray-50 border-transparent' : 'bg-white border-gray-100 hover:border-blue-400 hover:shadow-md cursor-pointer group'}
                                            `}
                                        >
                                            {date && (
                                                <>
                                                    <div className="flex justify-between items-start">
                                                        <span className={`
                                                            text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full
                                                            ${(date.day === new Date().getDate() &&
                                                                month === new Date().getMonth() &&
                                                                year === new Date().getFullYear())
                                                                ? 'bg-blue-100 text-blue-700' : 'text-gray-700'}
                                                        `}>
                                                            {date.day}
                                                        </span>
                                                        <Plus className="w-0 h-0 group-hover:w-4 group-hover:h-4 text-blue-400 transition-all opacity-0 group-hover:opacity-100" />
                                                    </div>

                                                    <div className="mt-2 space-y-1">
                                                        {date.events.map((event, i) => {
                                                            const content = (
                                                                <div className={`
                                                                    text-[10px] px-1 py-0.5 rounded truncate font-medium
                                                                    ${event.type === 'Deadline' ? 'bg-red-100 text-red-800' :
                                                                        event.type === 'Interview' ? 'bg-blue-100 text-blue-800' :
                                                                            'bg-gray-100 text-gray-800'}
                                                                `}>
                                                                    {event.title}
                                                                </div>
                                                            );
                                                            return event.jobId ? (
                                                                <Link key={i} href={`/jobs/${event.jobId}`} className="block">
                                                                    {content}
                                                                </Link>
                                                            ) : (
                                                                <div key={i}>{content}</div>
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
                        <Card className="border-none shadow-md">
                            <CardHeader className="bg-gray-50 border-b pb-3">
                                <CardTitle className="text-lg font-bold text-[#193153]">Upcoming Agenda</CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {events.length === 0 ? (
                                    <div className="p-8 text-center text-gray-500">
                                        <p>No events scheduled.</p>
                                    </div>
                                ) : (
                                    events.map((event, index) => {
                                        const innerContent = (
                                            <>
                                                <div className={`flex-shrink-0 w-12 text-center rounded-lg py-2 ${event.type === 'Deadline' ? 'bg-red-100 text-red-700' :
                                                    event.type === 'Interview' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-gray-100 text-gray-700'
                                                    }`}>
                                                    <span className="block text-xs font-bold uppercase">{event.date.split(' ')[0]}</span>
                                                    <span className="block text-lg font-bold leading-none">{event.date.split(' ')[1].replace(',', '')}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <h4 className="text-sm font-bold text-gray-900 truncate pr-4 text-left">{event.title}</h4>
                                                        <Badge variant={event.type === 'Deadline' ? 'destructive' : 'default'} className="text-[10px] px-1.5 h-5">
                                                            {event.type}
                                                        </Badge>
                                                    </div>
                                                    <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        {event.time}
                                                    </p>
                                                    {event.type === 'Interview' && (
                                                        <p className="text-xs text-gray-500 mt-1 flex items-center gap-2">
                                                            <MapPin className="w-3.5 h-3.5" />
                                                            NAAP - Villamor Campus
                                                        </p>
                                                    )}
                                                </div>
                                            </>
                                        );

                                        return (
                                            <div key={index} className="p-4 border-b last:border-0 hover:bg-blue-50/50 transition-colors group relative flex items-start justify-between">
                                                {event.jobId ? (
                                                    <Link href={`/jobs/${event.jobId}`} className="flex items-start gap-4 flex-1 cursor-pointer">
                                                        {innerContent}
                                                    </Link>
                                                ) : (
                                                    <div className="flex items-start gap-4 flex-1">
                                                        {innerContent}
                                                    </div>
                                                )}
                                                <div className="absolute right-2 top-1/2 -translate-y-1/2 hidden group-hover:flex">
                                                    <Button
                                                        size="icon"
                                                        variant="ghost"
                                                        className="h-8 w-8 text-gray-400 hover:text-red-500"
                                                        onClick={() => handleDeleteEvent(event.id)}
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
