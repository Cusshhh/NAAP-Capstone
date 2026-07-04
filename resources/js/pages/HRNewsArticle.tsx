import { Head, Link } from '@inertiajs/react';
import { ChevronLeft, Calendar, User, Share2, Tag, Search, Menu, Facebook, Twitter, Linkedin, Link as LinkIcon, Check } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { getHRNews, type HRNewsItem } from '@/data/mockData';

interface ArticleProps {
    id: string;
}

// Convert plain text to formatted HTML
const formatTextToHTML = (text: string): string => {
    if (!text) return '';

    const lines = text.split('\n');
    let html = '';
    let inList = false;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();

        // Skip empty lines
        if (!line) {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            continue;
        }

        // Horizontal rule
        if (line === '---') {
            if (inList) {
                html += '</ul>';
                inList = false;
            }
            html += '<hr class="my-8 border-gray-300" />';
            continue;
        }

        // Bullet points
        if (line.startsWith('- ')) {
            if (!inList) {
                html += '<ul class="list-disc pl-6 mb-6 space-y-2">';
                inList = true;
            }
            html += `<li>${line.substring(2)}</li>`;
            continue;
        }

        // Close list if we're in one and hit non-list content
        if (inList) {
            html += '</ul>';
            inList = false;
        }

        // Section headers (ALL CAPS lines)
        if (line === line.toUpperCase() && line.length > 3 && !line.includes(':')) {
            html += `<h3 class="text-2xl font-bold text-[#193153] mb-4 mt-8">${line}</h3>`;
            continue;
        }

        // Subsection headers (lines ending with colon or containing specific keywords)
        if (line.includes(':') && line.split(':')[0].length < 50) {
            const parts = line.split(':');
            if (parts.length === 2) {
                html += `<p class="mb-4"><strong>${parts[0]}:</strong> ${parts[1]}</p>`;
            } else {
                html += `<p class="font-bold text-lg text-[#193153] mb-2 mt-6">${line}</p>`;
            }
            continue;
        }

        // Regular paragraphs
        html += `<p class="mb-4">${line}</p>`;
    }

    // Close any open list
    if (inList) {
        html += '</ul>';
    }

    return html;
};

const HRNewsArticle = ({ id }: ArticleProps) => {
    const [article, setArticle] = useState<HRNewsItem | null>(null);
    const [showShareMenu, setShowShareMenu] = useState(false);
    const [copied, setCopied] = useState(false);

    useEffect(() => {
        const articles = getHRNews();
        const found = articles.find(a => a.id === parseInt(id));
        setArticle(found || null);
    }, [id]);

    const shareUrl = typeof window !== 'undefined' ? window.location.href : '';
    const shareTitle = article?.title || '';

    const handleShare = async (platform: string) => {
        const url = encodeURIComponent(shareUrl);
        const text = encodeURIComponent(shareTitle);

        const shareUrls: Record<string, string> = {
            facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
            twitter: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
            linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
        };

        if (platform === 'copy') {
            try {
                await navigator.clipboard.writeText(shareUrl);
                setCopied(true);
                toast.success('Link copied to clipboard!');
                setTimeout(() => setCopied(false), 2000);
            } catch (err) {
                toast.error('Failed to copy link');
            }
        } else if (platform === 'native' && navigator.share) {
            try {
                await navigator.share({
                    title: shareTitle,
                    url: shareUrl,
                });
            } catch (err) {
                // User cancelled or error occurred
            }
        } else if (shareUrls[platform]) {
            window.open(shareUrls[platform], '_blank', 'width=600,height=400');
        }

        setShowShareMenu(false);
    };

    if (!article) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">Article Not Found</h1>
                    <Link href="/hr-news" className="text-blue-600 hover:underline">Return to HR News</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-slate-800">
            <Head title={`${article.title} - NAAP News`} />

            {/* --- TOP BAR (Dashboard Style) --- */}
            <header className="bg-[#193153] border-b border-[#193153] sticky top-0 z-50 shadow-md">
                <div className="container mx-auto px-4 py-4 flex items-center justify-between">
                    <Link href="/" className="flex items-center space-x-3">
                        <div className="bg-white/10 p-2 rounded-full h-12 w-12 flex items-center justify-center overflow-hidden">
                            <img src="/images/PhilSCA_Logo.png" alt="NAAP Logo" className="h-full w-full object-contain" />
                        </div>
                        <div>
                            <span className="font-bold text-lg block leading-none text-white">NAAP HR</span>
                            <span className="text-[10px] text-blue-200 uppercase tracking-widest">Newsroom</span>
                        </div>
                    </Link>

                    <nav className="hidden md:flex items-center space-x-6">
                        <Link href="/" className="text-white hover:text-[#ffdd59] transition-colors text-sm font-medium">
                            Home
                        </Link>
                        <Link href="/hr-news" className="text-[#ffdd59] font-semibold text-sm">
                            HR News
                        </Link>
                        <Link href="/jobs" className="text-white hover:text-[#ffdd59] transition-colors text-sm font-medium">
                            Browse Jobs
                        </Link>
                    </nav>

                    <button className="md:hidden text-white">
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </header>

            <main className="container mx-auto px-4 py-12">
                {/* Breadcrumb */}
                <div className="flex items-center text-sm text-gray-500 mb-8 space-x-2">
                    <Link href="/" className="hover:text-[#193153]">Home</Link>
                    <span>/</span>
                    <Link href="/hr-news" className="hover:text-[#193153]">HR News</Link>
                    <span>/</span>
                    <span className="text-gray-900 font-medium truncate max-w-md">{article.title}</span>
                </div>

                <article className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden max-w-4xl mx-auto">
                    {/* Header Banner */}
                    <div className="h-64 sm:h-80 bg-gradient-to-r from-[#193153] to-[#2a4a75] relative p-8 flex flex-col justify-end">
                        <span className="inline-block px-3 py-1 rounded-full bg-[#ffdd59] text-[#193153] text-xs font-bold uppercase tracking-wider mb-4 w-fit">
                            {article.category}
                        </span>
                        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
                            {article.title}
                        </h1>
                        <div className="flex items-center text-blue-100 text-sm gap-6">
                            <span className="flex items-center gap-2">
                                <Calendar className="h-4 w-4" />
                                {article.date}
                            </span>
                            <span className="flex items-center gap-2">
                                <User className="h-4 w-4" />
                                {article.author}
                            </span>
                        </div>
                    </div>

                    <div className="p-8 sm:p-12">
                        <div
                            className="prose prose-lg text-gray-600 max-w-none"
                            dangerouslySetInnerHTML={{ __html: formatTextToHTML(article.fullContent || article.content || '') }}
                        />

                        {/* Footer Actions */}
                        <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
                            <Link
                                href="/hr-news"
                                className="inline-flex items-center text-gray-500 hover:text-[#193153] font-medium transition-colors"
                            >
                                <ChevronLeft className="mr-1 h-5 w-5" />
                                Back to HR News
                            </Link>

                            <div className="relative">
                                <button
                                    onClick={() => setShowShareMenu(!showShareMenu)}
                                    className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                >
                                    <Share2 className="h-5 w-5" />
                                    <span className="text-sm font-medium">Share</span>
                                </button>

                                {showShareMenu && (
                                    <div className="absolute right-0 bottom-full mb-2 bg-white rounded-lg shadow-lg border border-gray-200 p-2 min-w-[200px]">
                                        <button
                                            onClick={() => handleShare('facebook')}
                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors text-left"
                                        >
                                            <Facebook className="h-5 w-5 text-blue-600" />
                                            <span className="text-sm font-medium text-gray-700">Facebook</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare('twitter')}
                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-sky-50 rounded-lg transition-colors text-left"
                                        >
                                            <Twitter className="h-5 w-5 text-sky-500" />
                                            <span className="text-sm font-medium text-gray-700">Twitter</span>
                                        </button>
                                        <button
                                            onClick={() => handleShare('linkedin')}
                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-blue-50 rounded-lg transition-colors text-left"
                                        >
                                            <Linkedin className="h-5 w-5 text-blue-700" />
                                            <span className="text-sm font-medium text-gray-700">LinkedIn</span>
                                        </button>
                                        <div className="border-t border-gray-200 my-2"></div>
                                        <button
                                            onClick={() => handleShare('copy')}
                                            className="w-full flex items-center gap-3 px-4 py-2 hover:bg-gray-50 rounded-lg transition-colors text-left"
                                        >
                                            {copied ? (
                                                <Check className="h-5 w-5 text-green-600" />
                                            ) : (
                                                <LinkIcon className="h-5 w-5 text-gray-600" />
                                            )}
                                            <span className="text-sm font-medium text-gray-700">
                                                {copied ? 'Copied!' : 'Copy Link'}
                                            </span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </article>
            </main>

            <footer className="bg-gray-900 text-gray-400 py-12 mt-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm">© 2026 National Aviation Academy of the Philippines. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default HRNewsArticle;
