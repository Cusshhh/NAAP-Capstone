import { Shield, Users, LogOut, Briefcase, Edit2, Save, X, Image as ImageIcon, Eye, Newspaper, Upload, Trash2 } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { getAnnouncements, updateAnnouncements, getHRNews, updateHRNews, getRecentlyHired, updateRecentlyHired, type Announcement, type HRNewsItem, type RecentlyHiredApplicant } from '@/data/mockData';
import AdminLayout from '@/layouts/AdminLayout';

export default function LandingPageManager({ auth }: { auth: any }) {
    const admin = auth?.user || { name: 'Admin' };
    const [activeTab, setActiveTab] = useState('announcements');

    // Announcements State
    const [announcements, setAnnouncements] = useState<Announcement[]>([]);
    const [editingAnnouncementId, setEditingAnnouncementId] = useState<number | null>(null);
    const [announcementFormData, setAnnouncementFormData] = useState<Partial<Announcement>>({});
    const [previewAnnouncementImage, setPreviewAnnouncementImage] = useState<string>('');

    // Newsroom State
    const [newsItems, setNewsItems] = useState<HRNewsItem[]>([]);
    const [editingNewsId, setEditingNewsId] = useState<number | null>(null);
    const [newsFormData, setNewsFormData] = useState<Partial<HRNewsItem>>({});
    const [newsImageUrl, setNewsImageUrl] = useState<string>('');
    const newsImageInputRef = useRef<HTMLInputElement | null>(null);

    // Recently Hired State
    const [recentlyHired, setRecentlyHired] = useState<RecentlyHiredApplicant[]>([]);
    const [editingHiredId, setEditingHiredId] = useState<number | null>(null);
    const [hiredFormData, setHiredFormData] = useState<Partial<RecentlyHiredApplicant>>({});
    const [hiredImageUrl, setHiredImageUrl] = useState<string>('');

    useEffect(() => {
        setAnnouncements(getAnnouncements());
        setNewsItems(getHRNews());
        setRecentlyHired(getRecentlyHired());
    }, []);


    // Announcement Handlers
    const handleEditAnnouncement = (announcement: Announcement) => {
        setEditingAnnouncementId(announcement.id);
        setAnnouncementFormData({ ...announcement });
        setPreviewAnnouncementImage(announcement.image);
    };

    const handleSaveAnnouncement = () => {
        if (!editingAnnouncementId || !announcementFormData.title || !announcementFormData.description || !announcementFormData.image) {
            toast.error('Please fill in all fields');
            return;
        }

        const updatedAnnouncements = announcements.map(item =>
            item.id === editingAnnouncementId
                ? { ...item, ...announcementFormData }
                : item
        );

        updateAnnouncements(updatedAnnouncements);
        setAnnouncements(updatedAnnouncements);
        setEditingAnnouncementId(null);
        setAnnouncementFormData({});
        setPreviewAnnouncementImage('');
        toast.success('Announcement updated successfully!');
    };

    const handleCancelAnnouncement = () => {
        setEditingAnnouncementId(null);
        setAnnouncementFormData({});
        setPreviewAnnouncementImage('');
    };

    const handleAnnouncementImageChange = (url: string) => {
        setAnnouncementFormData({ ...announcementFormData, image: url });
        setPreviewAnnouncementImage(url);
    };

    // Newsroom Handlers
    const handleEditNews = (newsItem: HRNewsItem) => {
        setEditingNewsId(newsItem.id);
        setNewsFormData({ ...newsItem });
        setNewsImageUrl(newsItem.image || '');
    };

    const handleSaveNews = () => {
        if (!editingNewsId || !newsFormData.title || !newsFormData.date || !newsFormData.category || !newsFormData.summary || !newsImage) {
            toast.error('Please fill in all required fields');
            return;
        }

        const updatedNews = newsItems.map(item =>
            item.id === editingNewsId
                ? { ...item, ...newsFormData, image: newsImage }
                : item
        );

        updateHRNews(updatedNews);
        setNewsItems(updatedNews);
        setEditingNewsId(null);
        setNewsFormData({});
        setNewsImageUrl('');
        toast.success('News article updated successfully!');
    };

    const handleCancelNews = () => {
        setEditingNewsId(null);
        setNewsFormData({});
        setNewsImageUrl('');
    };

    const handleRemoveNewsImage = () => {
        setNewsFormData(prev => ({ ...prev, image: undefined }));
        setNewsImageUrl('');
        if (newsImageInputRef.current) {
            newsImageInputRef.current.value = '';
        }
    };

    const newsImage = newsFormData.image || newsImageUrl;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'announcement' | 'news' | 'hired') => {
        const input = e.target;
        const file = input.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            const base64String = reader.result as string;
            if (type === 'announcement') {
                setAnnouncementFormData(prev => ({ ...prev, image: base64String }));
                setPreviewAnnouncementImage(base64String);
            } else if (type === 'news') {
                setNewsImageUrl(base64String);
                setNewsFormData(prev => ({ ...prev, image: base64String }));
            } else if (type === 'hired') {
                setHiredFormData(prev => ({ ...prev, image: base64String }));
            }

            input.value = '';
        };
        reader.readAsDataURL(file);
    };

    // Recently Hired Handlers
    const [isAddingHired, setIsAddingHired] = useState(false);

    const handleAddHired = () => {
        setIsAddingHired(true);
        setEditingHiredId(null);
        setHiredFormData({
            name: '',
            position: '',
            image: '',
            hiredDate: new Date().toISOString().split('T')[0]
        });
        setHiredImageUrl('');
    };

    const handleEditHired = (hired: RecentlyHiredApplicant) => {
        setIsAddingHired(false);
        setEditingHiredId(hired.id);
        setHiredFormData({ ...hired });
        setHiredImageUrl(hired.image);
    };

    const handleSaveHired = () => {
        if (!hiredFormData.name || !hiredFormData.position || !hiredFormData.image) {
            toast.error('Please fill in all fields');
            return;
        }

        let updatedHired;
        if (isAddingHired) {
            const newId = recentlyHired.length > 0 ? Math.max(...recentlyHired.map(h => h.id)) + 1 : 1;
            const newApplicant = { ...hiredFormData, id: newId } as RecentlyHiredApplicant;
            updatedHired = [...recentlyHired, newApplicant];
        } else {
            updatedHired = recentlyHired.map(item =>
                item.id === editingHiredId
                    ? { ...item, ...hiredFormData }
                    : item
            );
        }

        updateRecentlyHired(updatedHired);
        setRecentlyHired(updatedHired);
        setEditingHiredId(null);
        setIsAddingHired(false);
        setHiredFormData({});
        setHiredImageUrl('');
        toast.success(isAddingHired ? 'New professional added successfully!' : 'Hired professional updated successfully!');
    };

    const handleCancelHired = () => {
        setEditingHiredId(null);
        setIsAddingHired(false);
        setHiredFormData({});
        setHiredImageUrl('');
    };

    const handleDeleteHired = (id: number) => {
        if (window.confirm('Are you sure you want to remove this applicant from the recently hired list?')) {
            const updatedHired = recentlyHired.filter(h => h.id !== id);
            updateRecentlyHired(updatedHired);
            setRecentlyHired(updatedHired);
            toast.success('Applicant removed successfully');
        }
    };

    return (
        <AdminLayout auth={auth}>
            <div className="container mx-auto px-4 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-[#193153] mb-2">Landing Page Manager</h1>
                    <p className="text-gray-600">Manage announcements and newsroom content</p>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="grid w-full max-w-2xl grid-cols-3 mb-8">
                        <TabsTrigger value="announcements">Announcements</TabsTrigger>
                        <TabsTrigger value="newsroom">Newsroom</TabsTrigger>
                        <TabsTrigger value="hired">Recently Hired</TabsTrigger>
                    </TabsList>

                    {/* Announcements Tab */}
                    <TabsContent value="announcements">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {announcements.map((announcement) => (
                                <Card key={announcement.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="h-48 overflow-hidden bg-gray-200">
                                        <img
                                            src={announcement.image}
                                            alt={announcement.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.currentTarget.src = '/images/Dorm1.jpg';
                                            }}
                                        />
                                    </div>
                                    <CardHeader>
                                        <CardTitle className="text-xl text-[#193153]">{announcement.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 mb-4 line-clamp-3">{announcement.description}</p>
                                        <Button
                                            onClick={() => handleEditAnnouncement(announcement)}
                                            className="w-full bg-[#193153] hover:bg-[#2a4a75] text-white"
                                        >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Edit Announcement
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Newsroom Tab */}
                    <TabsContent value="newsroom">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {newsItems.map((newsItem) => (
                                <Card key={newsItem.id} className="hover:shadow-lg transition-shadow">
                                    <CardHeader>
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                {newsItem.category}
                                            </span>
                                            <span className="text-xs text-gray-500">{newsItem.date}</span>
                                        </div>
                                        <CardTitle className="text-xl text-[#193153]">{newsItem.title}</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-gray-600 mb-4 line-clamp-3">{newsItem.summary}</p>
                                        <Button
                                            onClick={() => handleEditNews(newsItem)}
                                            className="w-full bg-[#193153] hover:bg-[#2a4a75] text-white"
                                        >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Edit News Article
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>

                    {/* Recently Hired Tab */}
                    <TabsContent value="hired">
                        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                            {/* Add New Button Card */}
                            <Card
                                className="overflow-hidden border-2 border-dashed border-gray-200 bg-gray-50/50 hover:bg-gray-50 hover:border-[#193153]/30 transition-all cursor-pointer flex flex-col items-center justify-center p-8 group min-h-87.5"
                                onClick={handleAddHired}
                            >
                                <div className="w-16 h-16 rounded-full bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                    <Users className="w-8 h-8 text-[#193153]/40 group-hover:text-[#193153]" />
                                    <div className="absolute top-0 right-0 p-1">
                                        <div className="bg-[#ffdd59] rounded-full p-1 shadow-sm">
                                            <X className="w-3 h-3 text-[#193153] rotate-45" />
                                        </div>
                                    </div>
                                </div>
                                <h3 className="font-bold text-[#193153] text-lg">Add New Applicant</h3>
                                <p className="text-sm text-gray-500 text-center mt-2">Display a newly hired professional on the landing page</p>
                            </Card>

                            {recentlyHired.map((hired) => (
                                <Card key={hired.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="h-48 flex items-center justify-center bg-gray-100 border-b border-gray-100">
                                        <div className="w-32 h-32 bg-white p-1 rounded-sm shadow-md border border-gray-200 overflow-hidden">
                                            <img
                                                src={hired.image}
                                                alt={hired.name}
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/pilot-female.jpg';
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <CardHeader className="text-center">
                                        <CardTitle className="text-xl text-[#193153]">{hired.name}</CardTitle>
                                        <div className="text-sm text-gray-500 font-medium">{hired.position}</div>
                                    </CardHeader>
                                    <CardContent className="space-y-2">
                                        <Button
                                            onClick={() => handleEditHired(hired)}
                                            className="w-full bg-[#193153] hover:bg-[#2a4a75] text-white"
                                        >
                                            <Edit2 className="h-4 w-4 mr-2" />
                                            Edit Details
                                        </Button>
                                        <Button
                                            variant="outline"
                                            onClick={() => handleDeleteHired(hired.id)}
                                            className="w-full text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 hover:border-red-300"
                                        >
                                            <Trash2 className="h-4 w-4 mr-2" />
                                            Remove Applicant
                                        </Button>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Edit Announcement Modal */}
                {editingAnnouncementId && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white">
                                <h3 className="text-2xl font-bold text-[#193153]">Edit Announcement</h3>
                                <button onClick={handleCancelAnnouncement} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Image Preview */}
                                {previewAnnouncementImage && (
                                    <div className="space-y-2">
                                        <Label>Image Preview</Label>
                                        <div className="h-64 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                                            <img
                                                src={previewAnnouncementImage}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/Dorm1.jpg';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Announcement Photo Upload */}
                                <div className="space-y-2">
                                    <Label htmlFor="announcement-image">Announcement Image *</Label>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="announcement-image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-gray-400">PNG, JPG or JPEG (MAX. 800x400px)</p>
                                                </div>
                                                <input
                                                    id="announcement-image-upload"
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'announcement')}
                                                />
                                            </label>
                                        </div>
                                        {announcementFormData.image && (
                                            <div className="flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full w-fit">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                Image Uploaded Successfully
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="title">Title</Label>
                                    <Input
                                        id="title"
                                        value={announcementFormData.title || ''}
                                        onChange={(e) => setAnnouncementFormData({ ...announcementFormData, title: e.target.value })}
                                        placeholder="Announcement title"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description">Description</Label>
                                    <Textarea
                                        id="description"
                                        value={announcementFormData.description || ''}
                                        onChange={(e) => setAnnouncementFormData({ ...announcementFormData, description: e.target.value })}
                                        rows={4}
                                        placeholder="Announcement description"
                                    />
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                                <Button variant="outline" onClick={handleCancelAnnouncement}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveAnnouncement} className="bg-[#193153] hover:bg-[#2a4a75] text-white">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit News Modal */}
                {editingNewsId && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h3 className="text-2xl font-bold text-[#193153]">Edit News Article</h3>
                                <button onClick={handleCancelNews} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="news-title">Title *</Label>
                                    <Input
                                        id="news-title"
                                        value={newsFormData.title || ''}
                                        onChange={(e) => setNewsFormData({ ...newsFormData, title: e.target.value })}
                                        placeholder="News title"
                                    />
                                </div>

                                {/* News Image Preview */}
                                {(newsFormData.image || newsImageUrl) && (
                                    <div className="space-y-2">
                                        <Label>Current Article Image</Label>
                                        <div className="h-64 rounded-lg overflow-hidden bg-gray-100 border-2 border-gray-200">
                                            <img
                                                src={newsFormData.image || newsImageUrl}
                                                alt="Article preview"
                                                className="w-full h-full object-cover"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/Dorm1.jpg';
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* Date and Category Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="news-date">Date *</Label>
                                        <Input
                                            id="news-date"
                                            type="date"
                                            value={newsFormData.date || ''}
                                            onChange={(e) => setNewsFormData({ ...newsFormData, date: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="news-category">Category *</Label>
                                        <Input
                                            id="news-category"
                                            value={newsFormData.category || ''}
                                            onChange={(e) => setNewsFormData({ ...newsFormData, category: e.target.value })}
                                            placeholder="e.g., Announcement, Event, Policy"
                                        />
                                    </div>
                                </div>

                                {/* Summary */}
                                <div className="space-y-2">
                                    <Label htmlFor="news-summary">Summary *</Label>
                                    <Textarea
                                        id="news-summary"
                                        value={newsFormData.summary || ''}
                                        onChange={(e) => setNewsFormData({ ...newsFormData, summary: e.target.value })}
                                        rows={3}
                                        placeholder="Brief summary of the news article"
                                    />
                                </div>

                                {/* Full Article Content (Plain Text) */}
                                <div className="space-y-2">
                                    <Label htmlFor="news-fullContent">Full Article Content</Label>
                                    <Textarea
                                        id="news-fullContent"
                                        value={newsFormData.fullContent || ''}
                                        onChange={(e) => setNewsFormData({ ...newsFormData, fullContent: e.target.value })}
                                        rows={15}
                                        placeholder="Enter article content here. Use simple formatting:&#10;- Start lines with '- ' for bullet points&#10;- Use ALL CAPS for section headers&#10;- Use '---' for dividers"
                                        className="font-mono text-sm"
                                    />
                                    <p className="text-xs text-gray-500">
                                        Write in plain text. Use "- " for bullets, ALL CAPS for headers, and "---" for dividers.
                                    </p>
                                </div>

                                {/* News Image Upload */}
                                <div className="space-y-2">
                                    <Label htmlFor="news-image">Article Image *</Label>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="news-image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-gray-400">PNG, JPG or JPEG (MAX. 800x400px)</p>
                                                </div>
                                                <input
                                                    id="news-image-upload"
                                                    type="file"
                                                    ref={newsImageInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'news')}
                                                />
                                            </label>
                                        </div>

                                        {newsImage && (
                                            <div className="space-y-3">
                                                <div className="rounded-xl overflow-hidden border border-gray-200 bg-white shadow-sm">
                                                    <img
                                                        src={newsImage}
                                                        alt="Uploaded article"
                                                        className="w-full h-40 object-cover"
                                                        onError={(e) => { e.currentTarget.src = '/images/Dorm1.jpg'; }}
                                                    />
                                                </div>
                                                <div className="flex flex-wrap items-center gap-2 text-xs text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full w-fit">
                                                    <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                    <span>Image Uploaded Successfully</span>
                                                    <button
                                                        type="button"
                                                        onClick={handleRemoveNewsImage}
                                                        className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 focus:outline-none"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                        Remove
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                                <Button variant="outline" onClick={handleCancelNews}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveNews} className="bg-[#193153] hover:bg-[#2a4a75] text-white">
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit/Add Hired Modal */}
                {(editingHiredId || isAddingHired) && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto scale-in-center animate-in fade-in duration-200">
                            <div className="p-6 border-b border-gray-100 flex justify-between items-center sticky top-0 bg-white z-10">
                                <h3 className="text-2xl font-bold text-[#193153]">
                                    {isAddingHired ? 'Add New Hired Professional' : 'Edit Hired Professional'}
                                </h3>
                                <button onClick={handleCancelHired} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Photo Preview */}
                                <div className="flex justify-center">
                                    <div className="space-y-2 text-center">
                                        <Label>Formal Photo Preview (2x2 Style)</Label>
                                        <div className="w-40 h-40 bg-white p-1 rounded-sm shadow-md border border-gray-200 overflow-hidden mx-auto">
                                            <img
                                                src={hiredFormData.image || ''}
                                                alt="Preview"
                                                className="w-full h-full object-cover grayscale-[0.2]"
                                                onError={(e) => {
                                                    e.currentTarget.src = '/images/pilot-female.jpg';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="hired-name">Full Name *</Label>
                                    <Input
                                        id="hired-name"
                                        value={hiredFormData.name || ''}
                                        onChange={(e) => setHiredFormData({ ...hiredFormData, name: e.target.value })}
                                        placeholder="e.g., John Paul F. Vivar"
                                    />
                                </div>

                                {/* Position */}
                                <div className="space-y-2">
                                    <Label htmlFor="hired-position">Job Position *</Label>
                                    <Input
                                        id="hired-position"
                                        value={hiredFormData.position || ''}
                                        onChange={(e) => setHiredFormData({ ...hiredFormData, position: e.target.value })}
                                        placeholder="e.g., IT Instructor"
                                    />
                                </div>

                                {/* Hired Photo Upload */}
                                <div className="space-y-2">
                                    <Label htmlFor="hired-image">Formal Photo *</Label>
                                    <div className="flex flex-col gap-4">
                                        <div className="flex items-center justify-center w-full">
                                            <label htmlFor="hired-image-upload" className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                                                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                                    <Upload className="w-8 h-8 mb-3 text-gray-400" />
                                                    <p className="mb-2 text-sm text-gray-500"><span className="font-semibold">Click to upload</span> or drag and drop</p>
                                                    <p className="text-xs text-gray-400">PNG, JPG or JPEG (Square recommended, 400x400px)</p>
                                                </div>
                                                <input
                                                    id="hired-image-upload"
                                                    type="file"
                                                    ref={hiredImageInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={(e) => handleFileChange(e, 'hired')}
                                                />
                                            </label>
                                        </div>
                                        {hiredFormData.image && (
                                            <div className="flex items-center gap-2 text-xs text-green-600 font-medium bg-green-50 px-3 py-1.5 rounded-full w-fit">
                                                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                                                Photo Uploaded Successfully
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-gray-100 flex justify-end gap-3 sticky bottom-0 bg-white">
                                <Button variant="outline" onClick={handleCancelHired}>
                                    Cancel
                                </Button>
                                <Button onClick={handleSaveHired} className="bg-[#193153] hover:bg-[#2a4a75] text-white">
                                    <Save className="w-4 h-4 mr-2" />
                                    {isAddingHired ? 'Add Professional' : 'Save Changes'}
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
