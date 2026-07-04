import { Head, Link } from '@inertiajs/react';
import {
    Calendar,
    User,
    Share2,
    Printer,
    ChevronLeft,
    Award,
    BookOpen,
    BarChart,
    Star,
    Search,
    Bell,
    Menu,
    Plus
} from 'lucide-react';
import React, { useState } from 'react';
import { getLandingPageContent } from '@/data/mockData';

const NewsDashboard = () => {
    const cmsContent = getLandingPageContent();
    const cmsAchievementPosts = cmsContent.achievements.posts;
    const [lightboxOpen, setLightboxOpen] = useState(false);

    const [currentImage, setCurrentImage] = useState("");

    const openLightbox = (imgSrc: string) => {
        setCurrentImage(imgSrc);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
        setCurrentImage("");
    };
    const sidebarLinks = [
        { title: "Latest Announcements", active: true },
        { title: "Press Releases", active: false },
        { title: "Campus Updates", active: false },
        { title: "Events Calendar", active: false },
        { title: "Media Gallery", active: false },
    ];


    const [searchQuery, setSearchQuery] = useState("");

    const relatedNews = [
        {
            id: 1,
            title: "NAAP Launches New Employee Wellness Program",
            date: "June 05, 2026",
            category: "Employee Welfare"
        },
        {
            id: 2,
            title: "Mass Recruitment for Senior Instructors Begins",
            date: "May 22, 2026",
            category: "Recruitment"
        },
        {
            id: 3,
            title: "Advanced Leadership Training for Admin Staff",
            date: "May 10, 2026",
            category: "Training & Dev"
        }
    ];

    const filteredNews = relatedNews.filter(news =>
        news.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        news.category.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-slate-800">
            <Head title="News: NAAP Achieves CSC PRIME-HRM Level 2 Maturity" />

            {/* --- TOP BAR (Dashboard Style) --- */}
            <header className="bg-[#193153] border-b border-[#193153] sticky top-0 z-50 shadow-md">
                <div className="container mx-auto px-4 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="flex items-center gap-2 group">
                            <div className="bg-white/10 p-1.5 rounded-lg group-hover:bg-[#ffdd59] transition-colors">
                                <img src="/images/PhilSCA_Logo.png" alt="NAAP Logo" className="h-8 w-8 object-contain" />
                            </div>
                            <span className="font-bold text-xl tracking-tight text-white">NAAP <span className="text-blue-200 font-light">Newsroom</span></span>
                        </Link>
                    </div>

                    <div className="hidden md:flex items-center gap-6">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search news..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 rounded-full border border-transparent bg-white/10 text-white placeholder-blue-200 focus:bg-white focus:text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#ffdd59] w-64 text-sm transition-all"
                            />
                        </div>



                        <div className="h-8 w-8 bg-[#ffdd59] rounded-full text-[#193153] flex items-center justify-center font-bold text-sm border-2 border-white/20">
                            G
                        </div>
                    </div>

                    <button className="md:hidden p-2 text-white">
                        <Menu className="h-6 w-6" />
                    </button>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8 flex flex-col lg:flex-row gap-8">

                {/* --- LEFT SIDEBAR (Navigation) --- */}
                {/* --- LEFT SIDEBAR (Navigation) --- REMOVED AS REQUESTED */}


                {/* --- MAIN CONTENT --- */}
                <main className="flex-grow">

                    {/* Breadcrumbs */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
                        <Link href="/" className="hover:text-[#193153]">Home</Link>
                        <span>/</span>
                        <span className="text-gray-900 font-medium">Official Announcement</span>
                    </div>

                    <article className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">

                        {/* Article Header Image/Banner */}
                        <div className="h-64 sm:h-80 bg-gradient-to-r from-[#193153] to-[#2a4a75] relative">
                            <div className="absolute inset-0 bg-[url('/images/pattern.png')] opacity-10"></div>
                            <div className="absolute bottom-0 left-0 right-0 p-8 sm:p-10 text-white bg-gradient-to-t from-black/60 to-transparent">
                                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ffdd59] text-[#193153] text-xs font-bold uppercase tracking-wide mb-4">
                                    <Award className="h-3 w-3" />
                                    Achievement Unlocked
                                </div>
                                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold leading-tight mb-4">
                                    NAAP Achieves CSC PRIME-HRM Level 2 Maturity
                                </h1>
                                <div className="flex items-center gap-6 text-sm text-blue-100">
                                    <div className="flex items-center gap-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>June 12, 2026</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <User className="h-4 w-4" />
                                        <span>Office of the President</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Article Content */}
                        <div className="p-8 sm:p-12">

                            {/* Lead Paragraph */}
                            <div className="prose max-w-none mb-12">
                                <p className="text-xl text-gray-600 leading-relaxed font-light border-l-4 border-[#ffdd59] pl-6 italic">
                                    The National Aviation Academy of the Philippines has been officially recognized by the Civil Service Commission (CSC) for achieving <strong className="text-[#193153]">Level 2 Maturity</strong> in the Program to Institutionalize Meritocracy and Excellence in Human Resource Management (PRIME-HRM).
                                </p>
                            </div>

                            <hr className="border-gray-100 mb-12" />

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
                                {/* Pillar 1 */}
                                <div className="bg-blue-50/50 rounded-xl p-6 border border-blue-100 hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center mb-4">
                                        <User className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#193153] mb-2">Recruitment, Selection & Placement</h3>
                                    <p className="text-gray-600">
                                        Merit-based hiring ensuring only the most qualified aviation professionals join our ranks. We follow strict standards to uphold the quality of our force.
                                    </p>
                                </div>

                                {/* Pillar 2 */}
                                <div className="bg-amber-50/50 rounded-xl p-6 border border-amber-100 hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 bg-amber-100 text-amber-600 rounded-lg flex items-center justify-center mb-4">
                                        <BookOpen className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#193153] mb-2">Learning & Development</h3>
                                    <p className="text-gray-600">
                                        Continuous capacity building through scholarships, trainings, and industry partnerships. We invest in the growth of our people.
                                    </p>
                                </div>

                                {/* Pillar 3 */}
                                <div className="bg-emerald-50/50 rounded-xl p-6 border border-emerald-100 hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center mb-4">
                                        <BarChart className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#193153] mb-2">Performance Management</h3>
                                    <p className="text-gray-600">
                                        Data-driven performance reviews that align individual goals with the Academy's mission. Transparency and objectiveness are key.
                                    </p>
                                </div>

                                {/* Pillar 4 */}
                                <div className="bg-purple-50/50 rounded-xl p-6 border border-purple-100 hover:shadow-md transition-shadow">
                                    <div className="h-12 w-12 bg-purple-100 text-purple-600 rounded-lg flex items-center justify-center mb-4">
                                        <Star className="h-6 w-6" />
                                    </div>
                                    <h3 className="text-lg font-bold text-[#193153] mb-2">Rewards & Recognition</h3>
                                    <p className="text-gray-600">
                                        Recognizing excellence and service through a structured and transparent awards system. Motivating our workforce to reach greater heights.
                                    </p>
                                </div>

                                {cmsAchievementPosts.map((post) => (
                                    <div key={post.id} className="bg-white rounded-xl p-6 border-l-4 border-l-orange-500 shadow-sm col-span-1 md:col-span-2">
                                        <div className="flex justify-between items-start mb-2">
                                            <h3 className="text-lg font-bold text-[#193153]">{post.title}</h3>
                                            {post.date && <span className="text-xs text-orange-600 font-bold uppercase">{post.date}</span>}
                                        </div>
                                        <p className="text-gray-600">{post.description}</p>
                                    </div>
                                ))}
                            </div>


                            {/* OFFICIAL MEMORANDUM TEXT */}
                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 md:p-10 font-serif text-sm md:text-base leading-relaxed text-gray-800 shadow-inner">
                                <div className="text-center mb-8 border-b border-gray-300 pb-4">
                                    <h4 className="font-bold text-lg uppercase tracking-widest text-[#193153] mb-1">Memorandum</h4>
                                    <p className="text-gray-500 italic">Office of the President</p>
                                </div>

                                <div className="grid grid-cols-[100px_1fr] gap-4 mb-8 text-sm">
                                    <span className="font-bold text-gray-500 uppercase">To:</span>
                                    <span>All Department Heads, Faculty, and Staff</span>

                                    <span className="font-bold text-gray-500 uppercase">From:</span>
                                    <span>Dr. Rolando A. Solis, Ph.D., College President</span>

                                    <span className="font-bold text-gray-500 uppercase">Date:</span>
                                    <span>June 12, 2026</span>

                                    <span className="font-bold text-gray-500 uppercase">Subject:</span>
                                    <span className="font-bold text-[#193153]">GRANT OF CSC PRIME-HRM LEVEL 2 MATURITY STATUS</span>
                                </div>

                                <div className="space-y-6">
                                    <p>
                                        I am pleased to announce that the Civil Service Commission (CSC) has officially conferred the <strong>Program to Institutionalize Meritocracy and Excellence in Human Resource Management (PRIME-HRM) Level 2 Maturity</strong> status to the National Aviation Academy of the Philippines.
                                    </p>
                                    <p>
                                        This recognition is a testament to our unwavering commitment to excellence in public service. The Academy has successfully met the rigorous standards set by the Commission in the four (4) core HRM systems:
                                    </p>
                                    <ul className="list-disc pl-5 space-y-2 ml-4">
                                        <li><strong>Recruitment, Selection & Placement:</strong> Upholding meritocracy and fitness in our hiring processes.</li>
                                        <li><strong>Learning & Development:</strong> Ensuring continuous professional growth for our workforce.</li>
                                        <li><strong>Performance Management:</strong> Aligning individual performance with our organizational strategic goals.</li>
                                        <li><strong>Rewards & Recognition:</strong> valuing the outstanding contributions of our employees.</li>
                                    </ul>
                                    <p>
                                        This achievement belongs to every member of the NAAP community. Your dedication and hard work have placed our institution among the elite agencies in the country with this level of HR maturity.
                                    </p>
                                    <p>
                                        Let this milestone inspire us to continue serving with integrity, excellence, and dedication.
                                    </p>
                                    <p className="mt-8">
                                        Signed,<br />
                                        <br />
                                        <span className="font-bold text-lg font-sans not-italic">Dr. Rolando A. Solis, Ph.D.</span><br />
                                        <span className="text-gray-500 text-xs uppercase tracking-wide">College President</span>
                                    </p>
                                </div>
                            </div>

                            <div className="mt-12">
                                <h3 className="text-xl font-bold text-[#193153] mb-6">Event Highlights</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div
                                        className="rounded-xl overflow-hidden shadow-md border border-gray-100 group cursor-pointer"
                                        onClick={() => openLightbox("/images/news-event-1.jpg")}
                                    >
                                        <img
                                            src="/images/news-event-1.jpg"
                                            alt="MOA Signing Event"
                                            className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="p-4 bg-white">
                                            <p className="text-sm text-gray-600 font-medium">Official MOA Signing Ceremony</p>
                                        </div>
                                    </div>
                                    <div
                                        className="rounded-xl overflow-hidden shadow-md border border-gray-100 group cursor-pointer"
                                        onClick={() => openLightbox("/images/news-event-2.jpg")}
                                    >
                                        <img
                                            src="/images/news-event-2.jpg"
                                            alt="Assessment and Review"
                                            className="w-full h-64 object-cover transform group-hover:scale-105 transition-transform duration-500"
                                        />
                                        <div className="p-4 bg-white">
                                            <p className="text-sm text-gray-600 font-medium">CSC Assessment and Compliance Review</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* LIGHTBOX MODAL */}
                            {lightboxOpen && (
                                <div
                                    className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4 backdrop-blur-sm transition-opacity"
                                    onClick={closeLightbox}
                                >
                                    <div className="relative max-w-5xl w-full max-h-screen flex flex-col items-center">
                                        <button
                                            onClick={closeLightbox}
                                            className="absolute -top-12 right-0 text-white hover:text-[#ffdd59] transition-colors p-2"
                                        >
                                            <span className="sr-only">Close</span>
                                            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                        </button>
                                        <img
                                            src={currentImage}
                                            alt="Enlarged view"
                                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl border border-white/10"
                                            onClick={(e) => e.stopPropagation()} // Prevent closing when clicking image
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Share & Actions */}
                            <div className="mt-12 pt-8 border-t border-gray-100 flex items-center justify-between">
                                <Link
                                    href="/"
                                    className="inline-flex items-center text-gray-500 hover:text-[#193153] font-medium transition-colors"
                                >
                                    <ChevronLeft className="mr-1 h-5 w-5" />
                                    Back to Home
                                </Link>

                                <div className="flex items-center gap-2">
                                    <button className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors">
                                        <Share2 className="h-5 w-5" />
                                    </button>
                                    <span className="text-xs text-gray-400 font-medium uppercase">Share this post</span>
                                </div>
                            </div>

                        </div>
                    </article>
                </main>

                {/* --- RIGHT SIDEBAR (Related) --- */}
                <aside className="w-full lg:w-80 flex-shrink-0">
                    <div className="sticky top-24 space-y-8">

                        {/* Trending / Related */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="font-bold text-[#193153] mb-6 flex items-center gap-2">
                                <Star className="h-4 w-4 text-[#ffdd59] fill-current" />
                                Related News
                            </h3>
                            <div className="space-y-6">
                                {filteredNews.length > 0 ? (
                                    filteredNews.map((news) => (
                                        <Link key={news.id} href={`/hr-news/${news.id}`} className="block group cursor-pointer">
                                            <span className="text-[10px] font-bold text-blue-500 uppercase tracking-wider">{news.category}</span>
                                            <h4 className="font-semibold text-gray-800 leading-snug group-hover:text-[#193153] transition-colors mt-1 mb-2">
                                                {news.title}
                                            </h4>
                                            <span className="text-xs text-gray-400">{news.date}</span>
                                        </Link>
                                    ))
                                ) : (
                                    <p className="text-gray-500 text-sm italic">No recent news found.</p>
                                )}
                            </div>
                            <Link href="/hr-news" className="w-full mt-6 text-sm text-[#193153] font-bold hover:underline block text-center">
                                View Archive
                            </Link>
                        </div>

                        {/* Ad / Promo */}
                        <div className="bg-gradient-to-br from-[#193153] to-[#0f1e33] rounded-xl p-6 text-white text-center">
                            <h3 className="font-bold text-lg mb-2">Job Openings</h3>
                            <p className="text-sm text-blue-200 mb-6">We are looking for talented individuals to join our growing team.</p>
                            <Link href="/jobs">
                                <button className="w-full py-2 bg-[#ffdd59] text-[#193153] font-bold rounded hover:bg-yellow-400 transition-colors">
                                    Apply Now
                                </button>
                            </Link>
                        </div>
                    </div>
                </aside>

            </div>

            <footer className="bg-gray-900 text-gray-400 py-12 mt-12">
                <div className="container mx-auto px-4 text-center">
                    <p className="text-sm">© 2026 National Aviation Academy of the Philippines. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default NewsDashboard;
