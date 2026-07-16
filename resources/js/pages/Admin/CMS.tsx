import {
    Layout, Save, Plus, Trash2, Edit3, MessageSquare,
    Gift, Award, LogOut, ChevronLeft, ArrowRight, Shield, Users
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import type { LandingPageContent, CMSSection, CMSPost } from '@/data/mockData';
import { getLandingPageContent, updateLandingPageContent } from '@/data/mockData';
import AdminLayout from '@/layouts/AdminLayout';

export default function CMS({ auth }: { auth: any }) {
    const admin = auth?.user || { name: 'Admin' };
    const [content, setContent] = useState<LandingPageContent>(getLandingPageContent());

    useEffect(() => {
        const loadDbContent = async () => {
            try {
                const response = await axios.get('/cms-content/mock_cms_content');
                if (response.data) setContent(response.data);
            } catch (e) {
                console.error("Failed to load CMS content from database", e);
            }
        };
        loadDbContent();
    }, []);

    const handleSave = async () => {
        try {
            await axios.post('/cms-content', {
                key: 'mock_cms_content',
                value: content
            });
            updateLandingPageContent(content);
            toast.success("Landing page content updated successfully!");
        } catch (e) {
            console.error(e);
            toast.error("Failed to save landing page content to database.");
        }
    };

    const updateSection = (key: keyof LandingPageContent, field: keyof CMSSection, value: any) => {
        setContent(prev => ({
            ...prev,
            [key]: { ...prev[key], [field]: value }
        }));
    };

    const addPost = (key: keyof LandingPageContent) => {
        const newPost: CMSPost = {
            id: Date.now().toString(),
            title: 'New Post',
            description: 'Enter description here...',
            date: new Date().toISOString().split('T')[0]
        };
        const updatedSection = {
            ...content[key],
            posts: [newPost, ...content[key].posts]
        };
        setContent(prev => ({ ...prev, [key]: updatedSection }));
    };

    const removePost = (key: keyof LandingPageContent, postId: string) => {
        const updatedSection = {
            ...content[key],
            posts: content[key].posts.filter(p => p.id !== postId)
        };
        setContent(prev => ({ ...prev, [key]: updatedSection }));
    };

    const updatePost = (key: keyof LandingPageContent, postId: string, field: keyof CMSPost, value: string) => {
        const updatedSection = {
            ...content[key],
            posts: content[key].posts.map(p => p.id === postId ? { ...p, [field]: value } : p)
        };
        setContent(prev => ({ ...prev, [key]: updatedSection }));
    };

    const SectionEditor = ({ sectionKey, icon: Icon, color }: { sectionKey: keyof LandingPageContent, icon: any, color: string }) => (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${color} bg-opacity-10 text-${color.split('-')[1]}-600`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <CardTitle>Core Information</CardTitle>
                            <CardDescription>Main heading and description for this section</CardDescription>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid gap-2">
                        <Label>Section Title</Label>
                        <Input
                            value={content[sectionKey].title}
                            onChange={(e) => updateSection(sectionKey, 'title', e.target.value)}
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label>Section Subtitle</Label>
                        <Textarea
                            value={content[sectionKey].subtitle}
                            onChange={(e) => updateSection(sectionKey, 'subtitle', e.target.value)}
                        />
                    </div>
                </CardContent>
            </Card>

            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-gray-800">Individual Posts</h3>
                <Button onClick={() => addPost(sectionKey)} size="sm" className="bg-[#193153]">
                    <Plus className="w-4 h-4 mr-2" /> Add New Post
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {content[sectionKey].posts.map(post => (
                    <Card key={post.id} className="relative group">
                        <CardContent className="pt-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="absolute top-2 right-2 text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removePost(sectionKey, post.id)}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                            <div className="space-y-4">
                                <div className="grid gap-2">
                                    <Label className="text-xs uppercase text-gray-500 font-bold">Post Title</Label>
                                    <Input
                                        value={post.title}
                                        onChange={(e) => updatePost(sectionKey, post.id, 'title', e.target.value)}
                                        className="font-bold"
                                    />
                                </div>
                                <div className="grid gap-2">
                                    <Label className="text-xs uppercase text-gray-500 font-bold">Content</Label>
                                    <Textarea
                                        value={post.description}
                                        onChange={(e) => updatePost(sectionKey, post.id, 'description', e.target.value)}
                                        rows={3}
                                    />
                                </div>
                                {post.date !== undefined && (
                                    <div className="grid gap-2">
                                        <Label className="text-xs uppercase text-gray-500 font-bold">Date</Label>
                                        <Input
                                            type="date"
                                            value={post.date}
                                            onChange={(e) => updatePost(sectionKey, post.id, 'date', e.target.value)}
                                        />
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );

    return (
        <AdminLayout
            auth={auth}
            headerActions={
                <Button onClick={handleSave} className="bg-[#ffdd59] text-[#193153] hover:bg-[#ffdd59]/90 font-bold">
                    <Save className="w-4 h-4 mr-2" /> Save Changes
                </Button>
            }
        >
            <div className="container mx-auto px-4 py-8">
                <div className="flex items-center gap-4 mb-8">
                    <Link href="/admin/dashboard">
                        <Button variant="outline" size="icon" className="rounded-full">
                            <ChevronLeft className="w-5 h-5" />
                        </Button>
                    </Link>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Landing Page Manager</h1>
                        <p className="text-gray-500">Customize the content and features shown on your homepage.</p>
                    </div>
                </div>

                <Tabs defaultValue="hired" className="space-y-8">
                    <TabsList className="bg-white p-1 border shadow-sm">
                        <TabsTrigger value="hired" className="data-[state=active]:bg-[#193153] data-[state=active]:text-white px-8">
                            <Users className="w-4 h-4 mr-2" /> Professionals Hired
                        </TabsTrigger>
                        <TabsTrigger value="perks" className="data-[state=active]:bg-[#193153] data-[state=active]:text-white px-8">
                            <Gift className="w-4 h-4 mr-2" /> Employee Perks
                        </TabsTrigger>
                        <TabsTrigger value="achievements" className="data-[state=active]:bg-[#193153] data-[state=active]:text-white px-8">
                            <Award className="w-4 h-4 mr-2" /> CSC Achievements
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="hired">
                        <SectionEditor sectionKey="hired" icon={Users} color="bg-emerald-500" />
                    </TabsContent>

                    <TabsContent value="perks">
                        <SectionEditor sectionKey="perks" icon={Gift} color="bg-purple-500" />
                    </TabsContent>

                    <TabsContent value="achievements">
                        <SectionEditor sectionKey="achievements" icon={Award} color="bg-orange-500" />
                    </TabsContent>
                </Tabs>
            </div>
        </AdminLayout>
    );
}
