import { Head, useForm, usePage } from '@inertiajs/react';
import { User, Key, Eye, EyeOff, Trash2, Camera, Upload, ShieldCheck } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import AdminLayout from '@/layouts/AdminLayout';

export default function Profile({ mustVerifyEmail, status }: any) {
    const { auth } = usePage<any>().props;
    const user = auth?.user || {};

    const [showCurrentPassword, setShowCurrentPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // Avatar State
    const [avatarPreview, setAvatarPreview] = useState<string | null>(() => {
        return user.avatar_url 
            || user.profile_data?.avatar_url 
            || user.profile_data?.photo 
            || user.profile_data?.avatar 
            || (typeof window !== 'undefined' ? localStorage.getItem(`user_profile_image_${user.id}`) : null) 
            || null;
    });
    const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

    const profileForm = useForm({
        name: user.name || '',
        email: user.email || '',
        phone_number: user.profile_data?.phone_number || user.profile_data?.contact_number || '0917-889-2026',
        avatar_data: '',
        remove_avatar: false,
    });

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                toast.error('Image file size must be less than 5MB.');
                return;
            }
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64String = reader.result as string;
                setAvatarPreview(base64String);
                if (user?.id && typeof window !== 'undefined') {
                    try {
                        localStorage.setItem(`user_profile_image_${user.id}`, base64String);
                    } catch (err) {
                        console.warn('LocalStorage quota exceeded for avatar string');
                    }
                }
                profileForm.setData((prev) => ({
                    ...prev,
                    avatar_data: base64String,
                    remove_avatar: false,
                }));
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemovePhoto = () => {
        setAvatarPreview(null);
        if (user?.id && typeof window !== 'undefined') {
            localStorage.removeItem(`user_profile_image_${user.id}`);
        }
        profileForm.setData((prev) => ({
            ...prev,
            avatar_data: '',
            remove_avatar: true,
        }));
    };

    const passwordForm = useForm({
        current_password: '',
        password: '',
        password_confirmation: '',
    });

    const handleProfileSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        profileForm.patch('/settings/profile', {
            preserveScroll: true,
            onSuccess: () => toast.success('Profile and photo updated successfully!'),
            onError: () => toast.error('Failed to update profile. Please check the form.'),
        });
    };

    const handlePasswordSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        passwordForm.put('/settings/password', {
            preserveScroll: true,
            onSuccess: () => {
                passwordForm.reset();
                toast.success('Password updated successfully!');
            },
            onError: () => toast.error('Failed to update password. Please check your inputs.'),
        });
    };

    const pageContent = (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
            <Head title="Account Settings - NAAP Careers" />

            <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#193153]">Account Settings</h1>
                    <p className="text-sm text-gray-500 mt-1">Manage your login credentials, display profile, avatar photo, and security options.</p>
                </div>
                <div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.location.href = '/settings/two-factor'}
                        className="flex items-center gap-2 border-emerald-600 text-emerald-700 hover:bg-emerald-50 font-bold text-xs shadow-xs cursor-pointer"
                    >
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        Security & 2FA
                    </Button>
                </div>
            </div>

            {/* Profile Info Card */}
            <Card className="border border-gray-200 shadow-xs rounded-xl bg-white">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#193153] flex items-center gap-2">
                        <User className="w-5 h-5 text-blue-600" /> Profile Information
                    </CardTitle>
                    <CardDescription>Update your account display name, profile photo, contact email, and mobile number.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleProfileSubmit} className="space-y-6 max-w-lg">
                        {/* Avatar Upload Section */}
                        <div className="flex items-center gap-5 p-4 bg-gray-50/80 rounded-xl border border-gray-200/80">
                            <div className="relative group shrink-0">
                                <div 
                                    onClick={() => avatarPreview && setIsPreviewModalOpen(true)}
                                    className={`w-20 h-20 rounded-full bg-[#193153] text-[#ffdd59] font-bold text-2xl flex items-center justify-center overflow-hidden border-2 border-white shadow-md transition-all ${
                                        avatarPreview ? 'cursor-pointer hover:opacity-90 hover:ring-2 hover:ring-blue-400' : ''
                                    }`}
                                    title={avatarPreview ? 'Click to view full profile picture' : user.name}
                                >
                                    {avatarPreview ? (
                                        <img src={avatarPreview} alt={user.name} className="w-full h-full object-cover" />
                                    ) : (
                                        user.name ? user.name.charAt(0) : 'A'
                                    )}
                                </div>
                                <label htmlFor="avatar-upload" className="absolute bottom-0 right-0 bg-[#ffdd59] text-[#193153] p-1.5 rounded-full cursor-pointer shadow-md hover:scale-110 transition-transform border border-white" title="Change photo">
                                    <Camera className="w-4 h-4" />
                                    <input id="avatar-upload" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                </label>
                            </div>
                            <div className="space-y-1">
                                <h4 className="text-sm font-bold text-[#193153]">{user.name || 'Admin Profile Photo'}</h4>
                                <p className="text-xs text-gray-500 leading-relaxed">Upload an official portrait photo (JPG, PNG, WEBP up to 5MB).</p>
                                <div className="flex items-center gap-2 pt-1">
                                    <label htmlFor="avatar-upload-btn" className="text-xs font-bold text-blue-600 hover:text-blue-800 cursor-pointer flex items-center gap-1">
                                        <Upload className="w-3.5 h-3.5" /> Upload Photo
                                        <input id="avatar-upload-btn" type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                    </label>
                                    {avatarPreview && (
                                        <>
                                            <span className="text-gray-300">|</span>
                                            <button type="button" onClick={handleRemovePhoto} className="text-xs font-medium text-red-500 hover:text-red-700 cursor-pointer flex items-center gap-1">
                                                <Trash2 className="w-3.5 h-3.5" /> Remove
                                            </button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>

                        {/* Full Photo Modal Preview */}
                        <Dialog open={isPreviewModalOpen} onOpenChange={setIsPreviewModalOpen}>
                            <DialogContent className="sm:max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-gray-100 flex flex-col items-center text-center">
                                <DialogHeader className="w-full text-center pb-2">
                                    <DialogTitle className="text-lg font-bold text-[#193153]">
                                        {user.name || 'Admin Profile Photo'}
                                    </DialogTitle>
                                    <DialogDescription className="text-xs text-gray-500">
                                        Official HR Admin Profile Picture
                                    </DialogDescription>
                                </DialogHeader>
                                {avatarPreview && (
                                    <div className="w-72 h-72 sm:w-80 sm:h-80 rounded-2xl overflow-hidden border-4 border-white shadow-xl bg-gray-900 my-2">
                                        <img src={avatarPreview} alt={user.name} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="pt-3 w-full flex justify-end">
                                    <Button 
                                        type="button" 
                                        variant="outline" 
                                        onClick={() => setIsPreviewModalOpen(false)}
                                        className="text-xs font-bold text-gray-700 border-gray-300 hover:bg-gray-100 cursor-pointer"
                                    >
                                        Close Preview
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>

                        <div className="space-y-1.5">
                            <Label htmlFor="name" className="text-xs font-semibold text-gray-700">Full Name</Label>
                            <Input
                                id="name"
                                value={profileForm.data.name}
                                onChange={(e) => profileForm.setData('name', e.target.value)}
                                className="w-full"
                                required
                                placeholder="Enter full name"
                            />
                            {profileForm.errors.name && <p className="text-xs text-red-500">{profileForm.errors.name}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="email" className="text-xs font-semibold text-gray-700">Official Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                value={profileForm.data.email}
                                onChange={(e) => profileForm.setData('email', e.target.value)}
                                className="w-full"
                                required
                                placeholder="admin@naap.edu.ph"
                            />
                            {profileForm.errors.email && <p className="text-xs text-red-500">{profileForm.errors.email}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="phone_number" className="text-xs font-semibold text-gray-700">Contact / Mobile Number</Label>
                            <Input
                                id="phone_number"
                                type="text"
                                value={profileForm.data.phone_number}
                                onChange={(e) => profileForm.setData('phone_number', e.target.value)}
                                className="w-full"
                                placeholder="0917-123-4567"
                            />
                            {profileForm.errors.phone_number && <p className="text-xs text-red-500">{profileForm.errors.phone_number}</p>}
                        </div>

                        <Button 
                            type="submit" 
                            disabled={profileForm.processing} 
                            className="bg-[#193153] hover:bg-[#193153]/90 text-[#ffdd59] font-bold px-6 cursor-pointer"
                        >
                            Save Profile Changes
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* Update Password Card */}
            <Card className="border border-gray-200 shadow-xs rounded-xl bg-white">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#193153] flex items-center gap-2">
                        <Key className="w-5 h-5 text-purple-600" /> Update Password
                    </CardTitle>
                    <CardDescription>Ensure your account is using a long, secure password to stay protected.</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-lg">
                        <div className="space-y-1.5">
                            <Label htmlFor="current_password" className="text-xs font-semibold text-gray-700">Current Password</Label>
                            <div className="relative">
                                <Input
                                    id="current_password"
                                    type={showCurrentPassword ? "text" : "password"}
                                    value={passwordForm.data.current_password}
                                    onChange={(e) => passwordForm.setData('current_password', e.target.value)}
                                    className="w-full pr-10"
                                    required
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#193153] cursor-pointer p-1 rounded-md transition-colors"
                                    title={showCurrentPassword ? "Hide password" : "Show password"}
                                >
                                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passwordForm.errors.current_password && <p className="text-xs text-red-500">{passwordForm.errors.current_password}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password" className="text-xs font-semibold text-gray-700">New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showNewPassword ? "text" : "password"}
                                    value={passwordForm.data.password}
                                    onChange={(e) => passwordForm.setData('password', e.target.value)}
                                    className="w-full pr-10"
                                    required
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowNewPassword(!showNewPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#193153] cursor-pointer p-1 rounded-md transition-colors"
                                    title={showNewPassword ? "Hide password" : "Show password"}
                                >
                                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passwordForm.errors.password && <p className="text-xs text-red-500">{passwordForm.errors.password}</p>}
                        </div>

                        <div className="space-y-1.5">
                            <Label htmlFor="password_confirmation" className="text-xs font-semibold text-gray-700">Confirm New Password</Label>
                            <div className="relative">
                                <Input
                                    id="password_confirmation"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={passwordForm.data.password_confirmation}
                                    onChange={(e) => passwordForm.setData('password_confirmation', e.target.value)}
                                    className="w-full pr-10"
                                    required
                                    placeholder="••••••••"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#193153] cursor-pointer p-1 rounded-md transition-colors"
                                    title={showConfirmPassword ? "Hide password" : "Show password"}
                                >
                                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                            </div>
                            {passwordForm.errors.password_confirmation && <p className="text-xs text-red-500">{passwordForm.errors.password_confirmation}</p>}
                        </div>

                        <Button 
                            type="submit" 
                            disabled={passwordForm.processing} 
                            className="bg-[#193153] hover:bg-[#193153]/90 text-[#ffdd59] font-bold px-6 cursor-pointer"
                        >
                            Update Password
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );

    if (user.is_admin || user.email === 'admin@naap.edu.ph') {
        return <AdminLayout auth={{ user }}>{pageContent}</AdminLayout>;
    }

    return (
        <div className="min-h-screen bg-gray-100/60 font-sans text-gray-900 pb-12">
            {/* Top Applicant Navbar */}
            <nav className="bg-[#193153] text-white sticky top-0 z-40 shadow-md">
                <div className="container mx-auto px-6 py-3.5">
                    <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.location.href = '/dashboard'}>
                            <img
                                src="/images/logo.png"
                                alt="NAAP Logo"
                                className="h-10 w-auto object-contain bg-white/10 rounded-full p-1"
                            />
                            <div className="hidden md:block">
                                <span className="font-bold text-lg tracking-tight block leading-none">NAAP Careers</span>
                                <span className="text-[10px] text-blue-200 uppercase tracking-widest">Applicant Portal</span>
                            </div>
                        </div>

                        <div className="flex items-center space-x-4">
                            <div className="flex items-center gap-3">
                                <button
                                    onClick={() => window.location.href = '/dashboard'}
                                    className="flex items-center gap-2.5 bg-[#244066]/80 hover:bg-[#2e4f7e] border border-blue-300/30 rounded-full pl-1.5 pr-4 py-1 transition-all duration-200 group shadow-xs cursor-pointer"
                                >
                                    <div className="w-8 h-8 rounded-full bg-[#ffdd59] flex items-center justify-center text-[#193153] font-bold text-xs overflow-hidden ring-2 ring-white/50 group-hover:ring-[#ffdd59] transition-all shrink-0">
                                        {avatarPreview || user?.avatar_url || user?.profile_data?.avatar_url || user?.profile_data?.photo || (typeof window !== 'undefined' ? localStorage.getItem(`user_profile_image_${user?.id}`) : null) ? (
                                            <img src={avatarPreview || user?.avatar_url || user?.profile_data?.avatar_url || user?.profile_data?.photo || (typeof window !== 'undefined' ? localStorage.getItem(`user_profile_image_${user?.id}`) : null) || ''} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            (user?.name || 'A').charAt(0).toUpperCase()
                                        )}
                                    </div>
                                    <span className="text-sm font-bold hidden sm:block text-[#ffdd59] group-hover:text-white transition-colors max-w-[150px] truncate">
                                        {user?.name || 'Applicant'}
                                    </span>
                                </button>

                                <Button 
                                    onClick={() => window.location.href = '/dashboard'} 
                                    size="sm" 
                                    variant="ghost" 
                                    className="text-white hover:bg-white/10 hover:text-[#ffdd59] text-xs font-semibold" 
                                >
                                    Back to Dashboard
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            <div className="container mx-auto px-4 pt-4">
                {pageContent}
            </div>
        </div>
    );
}
