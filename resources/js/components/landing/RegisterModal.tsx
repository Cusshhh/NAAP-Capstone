import { useForm } from '@inertiajs/react';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';

interface RegisterModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSwitchToLogin: () => void;
}

export default function RegisterModal({ isOpen, onClose, onSwitchToLogin }: RegisterModalProps) {
    const { data, setData, post, processing, errors, reset } = useForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
        invitation_code: '',
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        post('/register', {
            onFinish: () => reset('password', 'password_confirmation'),
            onSuccess: () => {
                onClose();
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Create an account</DialogTitle>
                    <DialogDescription>
                        Enter your details below to create your account
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={submit} className="flex flex-col gap-6 pt-4">
                    <div className="grid gap-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            required
                            autoFocus
                            autoComplete="name"
                            placeholder="Full name"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            required
                            autoComplete="username"
                            placeholder="email@example.com"
                        />
                        <InputError message={errors.email} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            type="password"
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder="Password"
                        />
                        <InputError message={errors.password} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="password_confirmation">Confirm password</Label>
                        <Input
                            id="password_confirmation"
                            type="password"
                            value={data.password_confirmation}
                            onChange={(e) => setData('password_confirmation', e.target.value)}
                            required
                            autoComplete="new-password"
                            placeholder="Confirm password"
                        />
                        <InputError message={errors.password_confirmation} />
                    </div>

                    <div className="grid gap-2">
                        <Label htmlFor="invitation_code">Invitation Code (Optional)</Label>
                        <Input
                            id="invitation_code"
                            value={data.invitation_code}
                            onChange={(e) => setData('invitation_code', e.target.value)}
                            placeholder="NAAP-XXXX-XXXX (for Admin registration)"
                        />
                        <InputError message={errors.invitation_code} />
                    </div>

                    <Button type="submit" className="w-full" disabled={processing}>
                        {processing && <Spinner className="mr-2" />}
                        Create account
                    </Button>
                </form>

                <div className="text-center text-sm text-muted-foreground mt-4">
                    Already have an account?{' '}
                    <button
                        onClick={onSwitchToLogin}
                        className="text-primary underline-offset-4 hover:underline font-medium text-blue-600"
                    >
                        Log in
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
