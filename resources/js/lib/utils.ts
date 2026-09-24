import type { InertiaLinkProps } from '@inertiajs/react';
import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

export function toUrl(url: NonNullable<InertiaLinkProps['href']>): string {
    return typeof url === 'string' ? url : url.url;
}

export function formatApplicantFullName(data: any): string {
    if (!data) return '';

    if (typeof data === 'string') {
        let str = data.trim();
        if (!str) return '';
        // Clean out trailing N/A or None or -
        str = str.replace(/\s+(N\/A|n\/a|None|none|-)\s*$/i, '');
        return str;
    }

    const first = (data.firstName || data.first_name || '').trim();
    const last = (data.lastName || data.last_name || '').trim();
    const middleRaw = (data.middleName || data.middle_name || '').trim();
    const extRaw = (data.extensionName || data.extension_name || '').trim();

    if (!first && !last) {
        const fallback = (data.fullName || data.full_name || data.name || data.applicant_name || data.candidateName || '').trim();
        return fallback.replace(/\s+(N\/A|n\/a|None|none|-)\s*$/i, '');
    }

    let middleInitial = '';
    if (middleRaw && !['n/a', 'none', '-', 'null', 'n / a'].includes(middleRaw.toLowerCase())) {
        const cleaned = middleRaw.replace(/\./g, '').trim();
        if (cleaned.length > 0) {
            middleInitial = `${cleaned.charAt(0).toUpperCase()}.`;
        }
    }

    let extStr = '';
    if (extRaw && !['n/a', 'none', '-', 'null', 'n / a'].includes(extRaw.toLowerCase())) {
        extStr = extRaw;
    }

    const parts = [first, middleInitial, last, extStr].filter(Boolean);
    return parts.join(' ');
}

export function formatApplicantFirstName(data: any): string {
    if (!data) return '';

    if (typeof data === 'string') {
        let str = data.trim();
        if (!str) return '';
        str = str.replace(/\s+(N\/A|n\/a|None|none|-)\s*$/i, '');
        const firstWord = str.split(' ')[0] || str;
        return firstWord;
    }

    const first = (data.firstName || data.first_name || '').trim();
    if (first && !['n/a', 'none', '-', 'null'].includes(first.toLowerCase())) {
        return first.split(' ')[0] || first;
    }

    const fallback = (data.fullName || data.full_name || data.name || data.applicant_name || data.candidateName || '').trim();
    if (fallback) {
        const cleaned = fallback.replace(/\s+(N\/A|n\/a|None|none|-)\s*$/i, '');
        return cleaned.split(' ')[0] || cleaned;
    }

    return '';
}

