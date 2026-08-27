import { Head, router, usePage } from '@inertiajs/react';
import { ShieldBan, ShieldCheck, Lock, Smartphone, Mail, KeyRound, CheckCircle2, User } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import TwoFactorRecoveryCodes from '@/components/two-factor-recovery-codes';
import TwoFactorSetupModal from '@/components/two-factor-setup-modal';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useTwoFactorAuth } from '@/hooks/use-two-factor-auth';
import AdminLayout from '@/layouts/AdminLayout';

type Props = {
    requiresConfirmation?: boolean;
    twoFactorEnabled?: boolean;
};

export default function TwoFactor({
    requiresConfirmation = false,
    twoFactorEnabled = false,
}: Props) {
    const { auth } = usePage<any>().props;
    const user = auth?.user || {};

    const {
        qrCodeSvg,
        hasSetupData,
        manualSetupKey,
        clearSetupData,
        fetchSetupData,
        recoveryCodesList,
        fetchRecoveryCodes,
        errors,
    } = useTwoFactorAuth();
    const [showSetupModal, setShowSetupModal] = useState<boolean>(false);
    const [isProcessing, setIsProcessing] = useState<boolean>(false);

    // Security OTP State
    const [isSendingOtp, setIsSendingOtp] = useState<boolean>(false);
    const [otpSent, setOtpSent] = useState<boolean>(false);
    const [otpInput, setOtpInput] = useState<string>('');
    const [demoOtpCode, setDemoOtpCode] = useState<string>('');
    const [isVerifyingOtp, setIsVerifyingOtp] = useState<boolean>(false);

    const handleEnable2FA = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        router.post('/user/two-factor-authentication', {}, {
            preserveScroll: true,
            onSuccess: () => {
                setIsProcessing(false);
                setShowSetupModal(true);
                toast.success('Two-factor setup initiated.');
            },
            onError: () => {
                setIsProcessing(false);
                toast.error('Failed to enable two-factor authentication.');
            }
        });
    };

    const handleDisable2FA = (e: React.FormEvent) => {
        e.preventDefault();
        setIsProcessing(true);
        router.delete('/user/two-factor-authentication', {
            preserveScroll: true,
            onSuccess: () => {
                setIsProcessing(false);
                toast.success('Two-factor authentication disabled.');
            },
            onError: () => {
                setIsProcessing(false);
                toast.error('Failed to disable two-factor authentication.');
            }
        });
    };

    const handleSendOtp = async () => {
        setIsSendingOtp(true);
        try {
            const userPhone = user.profile_data?.phone_number || user.profile_data?.contact_number || '0917-889-2026';
            const response = await axios.post('/security/send-otp', {
                email: user.email,
                phone_number: userPhone,
            });
            setIsSendingOtp(false);
            setOtpSent(true);
            if (response.data?.otp_code) {
                setDemoOtpCode(response.data.otp_code);
            }
            toast.success(`6-Digit Security Code sent to Gmail (${user.email}) & PH Mobile (${userPhone})!`);
        } catch (err: any) {
            setIsSendingOtp(false);
            toast.error('Failed to send security code.');
        }
    };

    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsVerifyingOtp(true);
        try {
            await axios.post('/security/verify-otp', { otp_code: otpInput });
            setIsVerifyingOtp(false);
            toast.success('🎉 Security Passcode Verified Successfully!');
            setOtpSent(false);
            setOtpInput('');
            setDemoOtpCode('');
        } catch (err: any) {
            setIsVerifyingOtp(false);
            toast.error('Invalid OTP Code. Please check and try again.');
        }
    };

    const pageContent = (
        <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 space-y-8">
            <Head title="Security & 2FA - NAAP Careers" />

            <div className="border-b border-gray-200 pb-4 flex flex-col sm:flex-row justify-between sm:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-[#193153]">Security & Two-Factor Authentication</h1>
                    <p className="text-sm text-gray-500 mt-1">Enhance account protection using TOTP Authenticator Apps and Dual-Channel Security Verification (Gmail & Mobile).</p>
                </div>
                <div>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => window.location.href = '/settings/profile'}
                        className="flex items-center gap-2 border-blue-600 text-blue-700 hover:bg-blue-50 font-bold text-xs shadow-xs cursor-pointer"
                    >
                        <User className="w-4 h-4 text-blue-600" />
                        Account Settings
                    </Button>
                </div>
            </div>

            {/* TOTP 2FA Card */}
            <Card className="border border-gray-200 shadow-xs rounded-xl bg-white">
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <CardTitle className="text-lg font-bold text-[#193153] flex items-center gap-2">
                            <Lock className="w-5 h-5 text-emerald-600" /> Authenticator App 2FA
                        </CardTitle>
                        {twoFactorEnabled ? (
                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 font-bold px-3 py-1 text-xs">
                                🟢 Enabled & Active
                            </Badge>
                        ) : (
                            <Badge className="bg-red-100 text-red-800 border-red-200 font-bold px-3 py-1 text-xs">
                                🔴 Currently Disabled
                            </Badge>
                        )}
                    </div>
                    <CardDescription className="mt-1">
                        When 2FA is enabled, you will be prompted for a secure 6-digit random passcode during login using Google Authenticator or Authy.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    {twoFactorEnabled ? (
                        <div className="space-y-6">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Your account is currently protected with Two-Factor Authentication. Keep your recovery codes safe in case you lose access to your mobile device.
                            </p>

                            <TwoFactorRecoveryCodes
                                recoveryCodesList={recoveryCodesList}
                                fetchRecoveryCodes={fetchRecoveryCodes}
                                errors={errors}
                            />

                            <form onSubmit={handleDisable2FA} className="pt-2">
                                <Button
                                    variant="destructive"
                                    type="submit"
                                    disabled={isProcessing}
                                    className="bg-red-600 hover:bg-red-700 text-white font-bold cursor-pointer flex items-center gap-2"
                                >
                                    <ShieldBan className="w-4 h-4" /> Disable 2FA Protection
                                </Button>
                            </form>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <p className="text-sm text-gray-600 leading-relaxed">
                                Protect your administrative portal access by connecting an authenticator app.
                            </p>

                            <div>
                                {hasSetupData ? (
                                    <Button
                                        onClick={() => setShowSetupModal(true)}
                                        className="bg-[#193153] hover:bg-[#193153]/90 text-[#ffdd59] font-bold cursor-pointer flex items-center gap-2"
                                    >
                                        <ShieldCheck className="w-4 h-4 text-[#ffdd59]" />
                                        Continue 2FA Setup
                                    </Button>
                                ) : (
                                    <form onSubmit={handleEnable2FA}>
                                        <Button
                                            type="submit"
                                            disabled={isProcessing}
                                            className="bg-[#193153] hover:bg-[#193153]/90 text-[#ffdd59] font-bold cursor-pointer flex items-center gap-2"
                                        >
                                            <ShieldCheck className="w-4 h-4 text-[#ffdd59]" />
                                            Enable Two-Factor Authentication
                                        </Button>
                                    </form>
                                )}
                            </div>
                        </div>
                    )}

                    <TwoFactorSetupModal
                        isOpen={showSetupModal}
                        onClose={() => setShowSetupModal(false)}
                        requiresConfirmation={requiresConfirmation}
                        twoFactorEnabled={twoFactorEnabled}
                        qrCodeSvg={qrCodeSvg}
                        manualSetupKey={manualSetupKey}
                        clearSetupData={clearSetupData}
                        fetchSetupData={fetchSetupData}
                        errors={errors}
                    />
                </CardContent>
            </Card>

            {/* Dual Channel Gmail & Mobile OTP Card */}
            <Card className="border border-gray-200 shadow-xs rounded-xl bg-white">
                <CardHeader>
                    <CardTitle className="text-lg font-bold text-[#193153] flex items-center gap-2">
                        <Smartphone className="w-5 h-5 text-blue-600" /> Dual-Channel OTP (Gmail & Contact Mobile)
                    </CardTitle>
                    <CardDescription>
                        Test sending 6-digit security verification passcodes directly to your registered Gmail address and contact mobile number.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200/80">
                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                                <Mail className="w-5 h-5" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Gmail Inbox</p>
                                <p className="text-sm font-bold text-[#193153] truncate">{user.email || 'admin@naap.edu.ph'}</p>
                            </div>
                        </div>

                        <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
                                <Smartphone className="w-5 h-5" />
                            </div>
                            <div className="overflow-hidden">
                                <p className="text-xs font-semibold text-gray-500 uppercase">Contact Mobile Number</p>
                                <p className="text-sm font-bold text-[#193153] truncate">
                                    {user.profile_data?.phone_number || user.profile_data?.contact_number || '0917-889-2026'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {!otpSent ? (
                        <div>
                            <Button
                                onClick={handleSendOtp}
                                disabled={isSendingOtp}
                                className="bg-[#193153] hover:bg-[#193153]/90 text-[#ffdd59] font-bold cursor-pointer flex items-center gap-2"
                            >
                                <KeyRound className="w-4 h-4 text-[#ffdd59]" />
                                {isSendingOtp ? 'Dispatching 6-Digit Code...' : '📱 Send 6-Digit Verification Code'}
                            </Button>
                        </div>
                    ) : (
                        <div className="space-y-4 p-5 bg-blue-50/50 rounded-xl border border-blue-200">
                            <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                    Security Code Dispatched!
                                </span>
                                {demoOtpCode && (
                                    <span className="text-xs bg-yellow-200 text-yellow-900 font-mono font-bold px-2 py-0.5 rounded-md border border-yellow-300">
                                        Demo Passcode: {demoOtpCode}
                                    </span>
                                )}
                            </div>

                            <form onSubmit={handleVerifyOtp} className="space-y-3 max-w-sm">
                                <div className="space-y-1">
                                    <Label htmlFor="otp_input" className="text-xs font-semibold text-gray-700">Enter 6-Digit Passcode</Label>
                                    <Input
                                        id="otp_input"
                                        type="text"
                                        maxLength={6}
                                        value={otpInput}
                                        onChange={(e) => setOtpInput(e.target.value)}
                                        placeholder="e.g. 849201"
                                        className="font-mono text-center tracking-widest text-lg font-bold"
                                        required
                                    />
                                </div>

                                <div className="flex items-center gap-2">
                                    <Button
                                        type="submit"
                                        disabled={isVerifyingOtp || otpInput.length !== 6}
                                        className="bg-[#193153] hover:bg-[#193153]/90 text-[#ffdd59] font-bold text-xs cursor-pointer"
                                    >
                                        Verify Security Passcode
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleSendOtp}
                                        disabled={isSendingOtp}
                                        className="text-xs cursor-pointer"
                                    >
                                        Resend Code
                                    </Button>
                                </div>
                            </form>
                        </div>
                    )}
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
                                        {user?.avatar_url || user?.profile_data?.avatar_url || user?.profile_data?.photo || (typeof window !== 'undefined' ? localStorage.getItem(`user_profile_image_${user?.id}`) : null) ? (
                                            <img src={user?.avatar_url || user?.profile_data?.avatar_url || user?.profile_data?.photo || (typeof window !== 'undefined' ? localStorage.getItem(`user_profile_image_${user?.id}`) : null) || ''} alt="Profile" className="w-full h-full object-cover" />
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
