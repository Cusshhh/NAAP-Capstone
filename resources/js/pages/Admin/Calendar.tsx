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
import { mockEvents } from '@/data/mockData';
import AdminLayout from '@/layouts/AdminLayout';

export default function AdminCalendar() {
    const { auth } = usePage().props as any;
    const admin = auth?.user || { name: 'Admin' };

    // Local state for interactive events
    const [events, setEvents] = useState(mockEvents);

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

        const [y, m, d] = newEvent.date.split('-').map(Number);
        const dateObj = new Date(y, m - 1, d);

        const formattedDate = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const eventToAdd = {
            id: Date.now(),
            title: newEvent.title,
            date: formattedDate,
            time: newEvent.time,
            type: newEvent.type
        };

        setEvents([...events, eventToAdd]);
        setNewEvent({ title: '', date: '', time: '', type: 'Personal' });
        setIsDialogOpen(false);
        toast.success("Event added successfully!");
    };

    const handleDeleteEvent = (id: number) => {
        setEvents(events.filter(e => e.id !== id));
        toast.success("Event removed.");
    };

    // State for current view (Month/Year)
    // Default to Feb 2026 to match mock data context
    const [currentDate, setCurrentDate] = useState(new Date(2026, 1, 1));

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day: number) => {
        const selectedDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const year = selectedDate.getFullYear();
        const month = String(selectedDate.getMonth() + 1).padStart(2, '0');
        const dayStr = String(selectedDate.getDate()).padStart(2, '0');
        const dateStr = `${year}-${month}-${dayStr}`;

        setNewEvent({ ...newEvent, date: dateStr });
        setIsDialogOpen(true);
    };

    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();

    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDay = new Date(year, month, 1).getDay();

    const totalSlots = startDay + daysInMonth;
    const calendarGridSize = totalSlots <= 35 ? 35 : 42;

    const calendarDays = Array.from({ length: calendarGridSize }, (_, i) => {
        const day = i - startDay + 1;
        if (day <= 0 || day > daysInMonth) return null;

        const currentDayDate = new Date(year, month, day);
        const dateString = currentDayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

        const eventsForDay = events.filter(e => e.date === dateString);

        return { day, events: eventsForDay };
    });

    return (
        <AdminLayout auth={auth}>
            <Head title="Admin Calendar" />
            
            <div className="bg-[#193153] text-white py-12 mb-8 rounded-b-3xl shadow-lg relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <CalendarIcon className="w-32 h-32" />
                </div>
                <div className="container mx-auto px-4 relative z-10">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-blue-200">
                                <Link href="/admin/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
                                <span>/</span>
                                <span className="text-white font-medium">Calendar</span>
                            </div>
                            <h1 className="text-4xl font-extrabold mb-2 tracking-tight">NAAP Schedule</h1>
                            <p className="text-blue-100 max-w-xl text-lg">Manage interviews, deadlines, and upcoming corporate events with ease.</p>
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
                                            <SelectTrigger className="w-auto border-none shadow-none font-bold text-2xl h-auto p-0 focus:ring-0 gap-2 bg-transparent">
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
                                                {Array.from({ length: 15 }, (_, i) => (
                                                    <SelectItem key={i} value={(2024 + i).toString()}>
                                                        {2024 + i}
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
                                                        placeholder="e.g., Technical Interview at NAAP"
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
                                                        {date.events.map((event, i) => (
                                                            <div key={i} className={`
                                                                text-[10px] px-2 py-1 rounded-md truncate font-semibold shadow-sm
                                                                ${event.type === 'Deadline' ? 'bg-red-50 text-red-700 border border-red-100' :
                                                                    event.type === 'Interview' ? 'bg-blue-50 text-blue-700 border border-blue-100' :
                                                                        'bg-gray-50 text-gray-700 border border-gray-100'}
                                                            `}>
                                                                {event.title}
                                                            </div>
                                                        ))}
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
                                    Upcoming Agenda
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
                                    events.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()).map((event, index) => (
                                        <div key={index} className="px-6 py-5 border-b last:border-0 hover:bg-gray-50 transition-all group relative">
                                            <div className="flex items-start gap-5">
                                                <div className={`flex-shrink-0 w-14 text-center rounded-2xl py-3 shadow-md ${event.type === 'Deadline' ? 'bg-red-600 text-white' :
                                                    event.type === 'Interview' ? 'bg-blue-600 text-white' :
                                                        'bg-gray-800 text-white'
                                                    }`}>
                                                    <span className="block text-[10px] font-black uppercase tracking-tighter opacity-80">{event.date.split(' ')[0]}</span>
                                                    <span className="block text-2xl font-black leading-none">{event.date.split(' ')[1].replace(',', '')}</span>
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
                                                    {event.type === 'Interview' && (
                                                        <p className="text-[10px] text-gray-400 mt-2 flex items-center gap-1 font-medium">
                                                            <MapPin className="w-3 h-3" />
                                                            NAAP - Villamor Campus
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
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
                                        </div>
                                    ))
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
