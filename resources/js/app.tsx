
import '../css/app.css';

import { createInertiaApp } from '@inertiajs/react';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import { createRoot } from 'react-dom/client';
import { Toaster } from 'sonner';

import ErrorBoundary from '@/components/ErrorBoundary';

const appName = import.meta.env.VITE_APP_NAME || 'NAAP Careers';

createInertiaApp({
    title: (title) => `${title} - ${appName}`,
    resolve: (name) => resolvePageComponent(`./pages/${name}.tsx`, import.meta.glob(['./pages/**/*.tsx', './Pages/**/*.tsx'])),
    setup({ el, App, props }) {
        const root = createRoot(el);

        root.render(
            <ErrorBoundary>
                <App {...props} />
                <Toaster position="top-right" richColors expand visibleToasts={3} closeButton />
            </ErrorBoundary>
        );
    },
    progress: {
        color: '#4B5563',
    },
});