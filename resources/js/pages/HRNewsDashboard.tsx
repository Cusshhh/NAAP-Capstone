import { Head, Link, router } from '@inertiajs/react';
import { ChevronLeft, Calendar, Tag, Edit2, Save, X, Settings, LogOut } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getHRNews, updateHRNews, type HRNewsItem } from '@/data/mockData';

export default function HRNewsDashboard({ auth }: { auth: any }) {
    const [hrNews, setHrNews] = useState<HRNewsItem[]>(() => getHRNews());
    const [editMode, setEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<HRNewsItem | null>(null);
    const [formData, setFormData] = useState<Partial<HRNewsItem>>({});

    const isAdmin = auth?.user && ['admin@naap.edu.ph', 'admin@admin.com'].includes(auth.user.email);

    useEffect(() => {
        const loadNews = async () => {
            try {
                const response = await axios.get('/cms-content/mock_hr_news');
                if (response.data) {
                    const articlesList = Array.isArray(response.data) ? response.data : Object.values(response.data || {});
                    setHrNews(articlesList);
                }
            } catch (e) {
                console.error("Failed to load news from database", e);
            }
        };
        loadNews();
    }, []);

    const handleEdit = (item: HRNewsItem) => {
        setEditingItem(item);
        setFormData({ ...item });
    };

    const handleSave = async () => {
        if (!editingItem || !formData.title || !formData.date || !formData.category || !formData.summary) {
            return;
        }

        const updatedNews = hrNews.map(item =>
            item.id === editingItem.id
                ? { ...item, ...formData }
                : item
        );

        try {
            await axios.post('/cms-content', {
                key: 'mock_hr_news',
                value: updatedNews
            });
            updateHRNews(updatedNews);
            setHrNews(updatedNews);
            setEditingItem(null);
            setFormData({});
        } catch (e) {
            console.error(e);
        }
    };

    const handleCancel = () => {
        setEditingItem(null);
        setFormData({});
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
            < Head title="HR News Dashboard" />

            {/* --- TOP BAR --- */}
            {auth?.user ? (
                <nav className="bg-[#193153] text-white shadow-lg sticky top-0 z-50">
                    <div className="container mx-auto px-6 py-4">
                        <div className="flex justify-between items-center">
                            {/* Logo Area */}
                            <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"} className="flex items-center space-x-4">
                                <img
                                    src="/images/PhilSCA_Logo.png"
                                    alt="NAAP Logo"
                                    className="h-10 w-auto object-contain bg-white/10 rounded-full p-1"
                                />
                                <div>
                                    <span className="font-bold text-lg tracking-tight block leading-none text-white">NAAP Careers</span>
                                    <span className="text-[10px] text-blue-200 uppercase tracking-widest block mt-0.5">
                                        {isAdmin ? "Admin Portal" : "Applicant Portal"}
                                    </span>
                                </div>
                            </Link>

                            {/* Right Menu */}
                            <div className="flex items-center space-x-4">
                                <Link href={isAdmin ? "/admin/dashboard" : "/dashboard"}>
                                    <button className="text-xs font-semibold bg-[#ffdd59] text-[#193153] hover:bg-[#eac545] px-3.5 py-2 rounded-lg transition-colors cursor-pointer">
                                        Back to Dashboard
                                    </button>
                                </Link>

                                <div className="h-6 w-px bg-white/20"></div>

                                {/* User Avatar */}
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-[#ffdd59] flex items-center justify-center text-[#193153] font-bold text-xs overflow-hidden border border-white">
                                        {auth.user.name ? auth.user.name.charAt(0) : 'U'}
                                    </div>
                                    <span className="text-sm font-medium hidden sm:block text-white">
                                        {auth.user.name}
                                    </span>

                                    <button
                                        onClick={() => router.get('/settings/profile')}
                                        className="p-2 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer"
                                        title="Settings"
                                    >
                                        <Settings className="w-4 h-4" />
                                    </button>

                                    <button
                                        onClick={() => router.post('/logout')}
                                        className="p-2 hover:bg-white/10 rounded-full text-white transition-colors cursor-pointer"
                                        title="Logout"
                                    >
                                        <LogOut className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </nav>
            ) : (
                <header className="bg-[#193153] border-b border-[#193153] sticky top-0 z-50 shadow-md">
                    <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                        <Link href="/" className="flex items-center space-x-3">
                            <div className="bg-white/10 p-2 rounded-full h-12 w-12 flex items-center justify-center overflow-hidden">
                                <img src="/images/PhilSCA_Logo.png" alt="NAAP Logo" className="h-full w-full object-contain" />
                            </div>
                            <div>
                                <span className="font-bold text-lg block leading-none text-white">NAAP HR</span>
                                <span className="text-[10px] text-blue-200 uppercase tracking-widest">Newsroom</span>
                            </div>
                        </Link>

                        <nav className="hidden md:flex items-center space-x-6">
                            <Link href="/" className="text-white hover:text-[#ffdd59] transition-colors text-sm font-medium">
                                Home
                            </Link>
                            <Link href="/hr-news" className="text-white hover:text-[#ffdd59] font-medium text-sm">
                                HR News
                            </Link>
                            <Link href="/jobs" className="text-white hover:text-[#ffdd59] transition-colors text-sm font-medium">
                                Browse Jobs
                            </Link>
                        </nav>

                        <button className="md:hidden text-white">
                            <Menu className="h-6 w-6" />
                        </button>
                    </div>
                </header>
            )}

            {/* Page Title Header */}
            <div className="bg-gray-100 border-b border-gray-200">
                <div className="container mx-auto px-6 py-8">
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-2xl font-bold text-[#193153] tracking-tight mb-1">HR Updates & Announcements</h1>
                            <p className="text-sm text-gray-500">Keeping the NAAP community informed about Human Resources initiatives.</p>
                        </div>
                        <div className="flex gap-2">
                            {isAdmin && (
                                <button
                                    onClick={() => setEditMode(!editMode)}
                                    className={`flex items-center text-sm font-medium px-4 py-2 rounded-lg transition-colors ${editMode
                                        ? 'bg-[#ffdd59] text-[#193153]'
                                        : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 shadow-sm'
                                        }`}
                                >
                                    <Edit2 className="w-4 h-4 mr-1" />
                                    {editMode ? 'Exit Edit Mode' : 'Edit Mode'}
                                </button>
                            )}
                            {auth?.user && !isAdmin && (
                                <Link href="/dashboard" className="flex items-center text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors shadow-sm">
                                    <ChevronLeft className="w-4 h-4 mr-1" />
                                    Back to Dashboard
                                </Link>
                            )}
                            {!auth?.user && (
                                <>
                                    <Link href="/news/csc-prime-hrm-level-2" className="flex items-center text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors shadow-sm">
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Back to Newsroom
                                    </Link>
                                    <Link href="/" className="flex items-center text-sm font-medium bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 px-4 py-2 rounded-lg transition-colors shadow-sm">
                                        <ChevronLeft className="w-4 h-4 mr-1" />
                                        Back to Home
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            < main className="container mx-auto px-6 py-12">
                < div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {
                        hrNews.map((news) => (
                            <div key={news.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow flex flex-col h-full">
                                < div className="h-2 bg-[#ffdd59]"></div>
                                < div className="p-6 flex-grow flex flex-col">
                                    < div className="flex items-center justify-between mb-4">
                                        < span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                            < Tag className="w-3 h-3 mr-1" />
                                            {news.category}
                                        </span >
                                        <div className="flex items-center text-gray-400 text-xs">
                                            < Calendar className="w-3 h-3 mr-1" />
                                            {news.date}
                                        </div >
                                    </div >
                                    <h2 className="text-xl font-bold text-[#193153] mb-3 leading-snug">
                                        {news.title}
                                    </h2 >
                                    <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-grow">
                                        {news.summary}
                                    </p >
                                    <div className="mt-auto pt-4 border-t border-gray-50 flex justify-between items-center">
                                        <Link href={`/hr-news/${news.id}`} className="text-sm font-bold text-[#193153] hover:text-[#ffdd59] transition-colors flex items-center">
                                            Read More
                                        </Link>
                                        {editMode && isAdmin && (
                                            <button
                                                onClick={() => handleEdit(news)}
                                                className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4 mr-1" />
                                                Edit
                                            </button>
                                        )}
                                    </div >
                                </div >
                            </div >
                        ))}
                </div >
            </main >

            {/* Edit Modal */}
            {
                editingItem && isAdmin && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        < div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            < div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                                < h3 className="text-2xl font-bold text-[#193153]">Edit News Item</h3>
                                < button
                                    onClick={handleCancel}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button >
                            </div >
                            <div className="p-6 space-y-4">
                                < div >
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                                    < input
                                        type="text"
                                        value={formData.title || ''}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })
                                        }
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193153] focus:border-transparent"
                                    />
                                </div >
                                <div className="grid grid-cols-2 gap-4">
                                    < div >
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                                        < input
                                            type="text"
                                            value={formData.date || ''}
                                            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193153] focus:border-transparent"
                                        />
                                    </div >
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                                        <input
                                            type="text"
                                            value={formData.category || ''}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193153] focus:border-transparent"
                                        />
                                    </div >
                                </div >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">Summary</label>
                                    <textarea
                                        value={formData.summary || ''}
                                        onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                                        rows={4}
                                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#193153] focus:border-transparent"
                                    />
                                </div >
                            </div >
                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                                < button
                                    onClick={handleCancel}
                                    className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                                >
                                    Cancel
                                </button >
                                <button
                                    onClick={handleSave}
                                    className="px-6 py-2 bg-[#193153] text-white rounded-lg hover:bg-[#2a4a75] transition-colors font-medium flex items-center"
                                >
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </button >
                            </div >
                        </div >
                    </div >
                )}
        </div >
    );
}
