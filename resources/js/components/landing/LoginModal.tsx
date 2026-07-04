import { useForm } from '@inertiajs/react'; // Verify if we can use this outside of a page component, usually yes if inside Inertia context
import { router } from '@inertiajs/react';
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
            <DialogContent className="sm:max-w-[425px]">
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
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoComplete="current-password"
                            placeholder="Password"
                        />
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

                    <Button type="submit" className="w-full" disabled={processing}>
                        {processing && <Spinner className="mr-2" />}
                        Log in
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground mt-4">
                    Don't have an account?{' '}
                    <button
                        onClick={onSwitchToRegister}
                        className="text-primary underline-offset-4 hover:underline font-medium text-blue-600"
                    >
                        Sign up
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
