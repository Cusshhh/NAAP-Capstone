import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Calendar, Tag, Edit2, Save, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { getHRNews, updateHRNews, type HRNewsItem } from '@/data/mockData';

export default function HRNewsDashboard({ auth }: { auth: any }) {
    const [hrNews, setHrNews] = useState<HRNewsItem[]>([]);
    const [editMode, setEditMode] = useState(false);
    const [editingItem, setEditingItem] = useState<HRNewsItem | null>(null);
    const [formData, setFormData] = useState<Partial<HRNewsItem>>({});

    const isAdmin = auth?.user && ['admin@naap.edu.ph', 'admin@admin.com'].includes(auth.user.email);

    useEffect(() => {
        setHrNews(getHRNews());
    }, []);

    const handleEdit = (item: HRNewsItem) => {
        setEditingItem(item);
        setFormData({ ...item });
    };

    const handleSave = () => {
        if (!editingItem || !formData.title || !formData.date || !formData.category || !formData.summary) {
            return;
        }

        const updatedNews = hrNews.map(item =>
            item.id === editingItem.id
                ? { ...item, ...formData }
                : item
        );

        updateHRNews(updatedNews);
        setHrNews(updatedNews);
        setEditingItem(null);
        setFormData({});
    };

    const handleCancel = () => {
        setEditingItem(null);
        setFormData({});
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-slate-800">
            < Head title="HR News Dashboard" />

            {/* Header */}
            <header className="bg-[#193153] text-white shadow-lg">
                < div className="container mx-auto px-6 py-8">
                    < div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                        < div >
                            <h1 className="text-3xl font-bold tracking-tight mb-2">HR Updates & Announcements</h1>
                            < p className="text-blue-200">Keeping the NAAP community informed about Human Resources initiatives.</p>
                        </div >
                        <div className="flex gap-2">
                            {isAdmin && (
                                <button
                                    onClick={() => setEditMode(!editMode)}
                                    className={`flex items-center text-sm font-medium px-4 py-2 rounded-lg transition-colors ${editMode
                                        ? 'bg-[#ffdd59] text-[#193153]'
                                        : 'bg-white/10 hover:bg-white/20'
                                        }`}
                                >
                                    <Edit2 className="w-4 h-4 mr-1" />
                                    {editMode ? 'Exit Edit Mode' : 'Edit Mode'}
                                </button>
                            )}
                            <Link href="/news/csc-prime-hrm-level-2" className="flex items-center text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
                                < ChevronLeft className="w-4 h-4 mr-1" />
                                Back to Newsroom
                            </Link >
                            <Link href="/" className="flex items-center text-sm font-medium bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg transition-colors">
                                < ChevronLeft className="w-4 h-4 mr-1" />
                                Back to Home
                            </Link >
                        </div >
                    </div >
                </div >
            </header >

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
