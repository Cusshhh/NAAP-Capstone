// Credit: https://usehooks-ts.com/
import { useCallback, useState } from 'react';

export type CopiedValue = string | null;
export type CopyFn = (text: string) => Promise<boolean>;
export type UseClipboardReturn = [CopiedValue, CopyFn];

export function useClipboard(): UseClipboardReturn {
    const [copiedText, setCopiedText] = useState<CopiedValue>(null);

    const copy: CopyFn = useCallback(async (text) => {
        if (!text) return false;

        // Try Navigator Clipboard API first
        if (navigator?.clipboard?.writeText) {
            try {
                await navigator.clipboard.writeText(text);
                setCopiedText(text);
                return true;
            } catch (error) {
                console.warn('Clipboard API failed, trying fallback', error);
            }
        }

        // Fallback for non-HTTPS / HTTP local origins
        try {
            const textArea = document.createElement('textarea');
            textArea.value = text;
            textArea.style.position = 'fixed';
            textArea.style.left = '-999999px';
            textArea.style.top = '-999999px';
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            const successful = document.execCommand('copy');
            document.body.removeChild(textArea);
            if (successful) {
                setCopiedText(text);
                return true;
            }
        } catch (err) {
            console.warn('Fallback copy failed', err);
        }

        setCopiedText(null);
        return false;
    }, []);

    return [copiedText, copy];
}
