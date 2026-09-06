import { useForm } from '@inertiajs/react'; // Verify if we can use this outside of a page component, usually yes if inside Inertia context
import { router } from '@inertiajs/react';
import { Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

interface LoginModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToRegister: () => void;
}

export default function LoginModal({ isOpen, onClose, onSwitchToRegister }: LoginModalProps) {
    const [showPassword, setShowPassword] = useState(false);

    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/login', {
            onFinish: () => reset('password'),
            onSuccess: () => {
                onClose();
                // Optionally redirect or just stay on page with auth state updated (requires page reload or state update)
                // For this "single page" feel, a reload might happen if the backend redirects back to '/', 
                // but let's assume standard Inertia behavior.
            }
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[92vw] max-h-[90vh] overflow-y-auto sm:max-w-md p-6">
                <DialogHeader>
                    <DialogTitle>Log in to your account</DialogTitle>
                    <DialogDescription>
                        Enter your email and password below to log in
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="flex flex-col gap-6 pt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoFocus
                            autoComplete="username"
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <div className="flex items-center">
                            <Label htmlFor="password">Password</Label>
                            <a
                                href="/forgot-password"
                                className="ml-auto text-sm underline-offset-4 hover:underline"
                                onClick={(e) => {
                                    // Let it handle normally for now, or could implement ForgotPasswordModal
                                }}
                            >
                                Forgot password?
                            </a>
                        </div>
                        <div className="relative">
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                value={data.password}
                                onChange={(e) => setData('password', e.target.value)}
                                required
                                autoComplete="current-password"
                                placeholder="Password"
                                className="pr-10"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#193153] cursor-pointer p-1 rounded-md transition-colors"
                                title={showPassword ? 'Hide password' : 'Show password'}
                            >
                                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                        </div>
                        <InputError message={errors.password} />
                    </div>

                    <div className="flex items-center space-x-3">
                        <Checkbox
                            id="remember"
                            checked={data.remember}
                            onCheckedChange={(checked) => setData('remember', checked as boolean)}
                        />
                        <Label htmlFor="remember">Remember me</Label>
                    </div>

                    <Button type="submit" className="w-full bg-[#193153] hover:bg-[#152844] text-[#ffdd59] font-bold py-2.5 rounded-lg shadow-md hover:shadow-lg transition-all border border-[#ffdd59]/30" disabled={processing}>
                        {processing && <Spinner className="mr-2" />}
                        Log in
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground mt-4">
                    Don't have an account?{' '}
                    <button
                        onClick={onSwitchToRegister}
                        className="underline-offset-4 hover:underline font-medium text-blue-600"
                    >
                        Sign up
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
