import { Link, router, usePage } from '@inertiajs/react';
import { Search, Filter, MapPin, Briefcase, Clock, ArrowLeft, User, LogOut, LayoutDashboard, Bookmark, X } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { mockJobs, getJobs, SALARY_GRADE_MAP } from '@/data/mockData';
import CustomTooltip from '@/components/ui/custom-tooltip';

interface JobIndexProps {
    auth: {
        user: any;
    };
    jobs: any[];
}

export default function JobListings({ auth, jobs: serverJobs }: JobIndexProps) {
    const user = auth?.user;

    const handleLogout = () => {
        router.post('/logout');
    };

    const [jobs, setJobs] = useState<any[]>(serverJobs || []);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        if (user && typeof window !== 'undefined') {
            setProfileImage(localStorage.getItem(`user_profile_image_${user.id}`));
        }
    }, [user]);

    useEffect(() => {
        if (serverJobs) {
            setJobs(serverJobs);
        }
    }, [serverJobs]);

    const departments = Array.from(new Set(jobs.map(j => j.department)));
    const employmentTypes = Array.from(new Set(jobs.map(j => j.employmentType)));


    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [employmentFilter, setEmploymentFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [showSavedOnly, setShowSavedOnly] = useState(false);
    const [savedJobIds, setSavedJobIds] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            const saved = localStorage.getItem(`saved_jobs_${user.id}`);
            if (saved) {
                try {
                    setSavedJobIds(JSON.parse(saved));
                } catch (e) {
                    console.error('Failed to parse saved jobs', e);
                }
            } else {
                setSavedJobIds([]);
            }
        } else {
            setSavedJobIds([]);
        }
    }, [user]);

    const toggleSaveJob = (e: React.MouseEvent, id: any) => {
        e.preventDefault();
        e.stopPropagation();

        if (!user) {
            toast.error('Please log in first to save this job.');
            router.visit('/login');
            return;
        }

        const newSaved = savedJobIds.includes(id)
            ? savedJobIds.filter(sid => sid !== id)
            : [...savedJobIds, id];

        setSavedJobIds(newSaved);
        localStorage.setItem(`saved_jobs_${user.id}`, JSON.stringify(newSaved));
        toast.success(savedJobIds.includes(id) ? 'Job removed from saved' : 'Job saved successfully');
    };

    const filteredJobs = jobs.filter(job => {
        const matchesSearch =
            (job.title?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (job.department?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (job.description?.toLowerCase() || '').includes(searchTerm.toLowerCase());

        const matchesDepartment = departmentFilter === 'all' || job.department === departmentFilter;
        const matchesEmployment = employmentFilter === 'all' || job.employmentType === employmentFilter;
        const matchesStatus = statusFilter === 'all' || job.status === statusFilter;
        const matchesSaved = !showSavedOnly || savedJobIds.includes(job.id);

        return matchesSearch && matchesDepartment && matchesEmployment && matchesStatus && matchesSaved && (job.status === 'Open' || job.status === 'Closed');
    });

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-[#193153] text-white py-8">
                <div className="container mx-auto px-4">
                    {/* Navigation Bar */}
                    <div className="flex justify-between items-center mb-6">
                        <Link href="/">
                            <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-[#ffdd59]">
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Back to Home
                            </Button>
                        </Link>

                        {user ? (
                            <div className="flex items-center gap-4">

                                <Link href="/dashboard" className="flex items-center gap-3 group hover:bg-white/10 rounded-full py-1 px-3 transition-all">
                                    <div className="w-8 h-8 rounded-full bg-[#ffdd59] flex items-center justify-center text-[#193153] font-bold text-xs overflow-hidden border border-white group-hover:scale-105 transition-transform">
                                        {profileImage ? (
                                            <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                        ) : (
                                            user.name.charAt(0)
                                        )}
                                    </div>
                                    <span className="text-sm font-medium hidden sm:block group-hover:text-[#ffdd59] transition-colors">{user.name}</span>
                                </Link>
                                <Button onClick={handleLogout} size="sm" variant="ghost" className="text-white hover:bg-white/10 hover:text-[#ffdd59] p-2">
                                    <LogOut className="w-4 h-4" />
                                </Button>
                            </div>
                        ) : (
                            <div className="flex gap-3">
                                <Link href="/login">
                                    <Button variant="ghost" className="text-white hover:bg-white/10 hover:text-[#ffdd59]">
                                        Login/Register
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>

                    {user && user.email === 'admin@naap.edu.ph' ? (
                        <>
                            <h1 className="text-4xl font-bold mb-2">Job Listings Preview</h1>
                            <p className="text-blue-200">Viewing as Administrator</p>
                        </>
                    ) : (
                        <>
                            <h1 className="text-4xl font-bold mb-2">
                                Career Opportunities
                            </h1>
                            <p className="text-blue-200">
                                Explore open positions at National Aviation Academy of the Philippines
                            </p>
                        </>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                {/* Search and Filters */}
                <Card className="mb-8">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-2">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <Input
                                        placeholder="Search by job title, department, or keywords..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="pl-10"
                                    />
                                </div>
                            </div>
                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Departments" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map(dept => (
                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={employmentFilter} onValueChange={setEmploymentFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Types" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {employmentTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {/* Status Filter */}
                            <Select value={statusFilter} onValueChange={setStatusFilter}>
                                <SelectTrigger>
                                    <SelectValue placeholder="All Statuses" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Statuses</SelectItem>
                                    <SelectItem value="Open">Open</SelectItem>
                                    <SelectItem value="Closed">Closed</SelectItem>
                                </SelectContent>
                            </Select>
                            <Button
                                variant={showSavedOnly ? "default" : "outline"}
                                className={`w-full justify-start ${showSavedOnly ? 'bg-[#193153] text-white hover:bg-[#193153]/90 hover:text-[#ffdd59]' : 'hover:bg-[#193153] hover:text-[#ffdd59] hover:border-[#193153]'}`}
                                onClick={() => setShowSavedOnly(!showSavedOnly)}
                            >
                                <Bookmark className={`h-4 w-4 mr-2 ${showSavedOnly ? 'fill-[#ffdd59] text-[#ffdd59]' : ''}`} />
                                {showSavedOnly ? 'Showing Saved Jobs' : 'Show Saved Jobs'}
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Count */}
                <div className="flex items-center justify-between mb-6">
                    <p className="text-gray-600">
                        <span className="font-semibold text-gray-900">{filteredJobs.length}</span> positions found
                    </p>
                    {(departmentFilter !== 'all' || employmentFilter !== 'all' || statusFilter !== 'all' || searchTerm || showSavedOnly) && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="text-xs text-red-600 hover:text-red-700 hover:bg-red-50 flex items-center gap-1.5"
                            onClick={() => {
                                setSearchTerm('');
                                setDepartmentFilter('all');
                                setEmploymentFilter('all');
                                setStatusFilter('all');
                                setShowSavedOnly(false);
                            }}
                        >
                            <X className="h-3.5 w-3.5" />
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* Job Cards */}
                <div className="space-y-4">
                    {filteredJobs.length === 0 ? (
                        <Card>
                            <CardContent className="p-12 text-center">
                                <p className="text-gray-500 text-lg">No positions match your search criteria.</p>
                                <Button
                                    variant="outline"
                                    className="mt-4"
                                    onClick={() => {
                                        setSearchTerm('');
                                        setDepartmentFilter('all');
                                        setEmploymentFilter('all');
                                        setLocationFilter('all');
                                        setShowSavedOnly(false);
                                    }}
                                >
                                    Clear All Filters
                                </Button>
                            </CardContent>
                        </Card>
                    ) : (
                        filteredJobs.map((job) => (
                            <Card key={job.id} className="hover:shadow-lg transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex justify-between items-start mb-4">
                                        <div className="flex-1">
                                            <div className="mb-2">
                                                <h3 className="text-2xl font-bold text-[#193153] m-0">{job.title}</h3>
                                            </div>
                                            <div className="flex flex-wrap gap-3 mb-3">
                                                <div className="flex items-center text-gray-600">
                                                    <Briefcase className="h-4 w-4 mr-1" />
                                                    {job.department}
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <MapPin className="h-4 w-4 mr-1" />
                                                    {job.location}
                                                </div>
                                                <div className="flex items-center text-gray-600">
                                                    <Clock className="h-4 w-4 mr-1" />
                                                    Posted {new Date(job.postedDate).toLocaleDateString()}
                                                </div>
                                            </div>
                                            <Badge variant="secondary" className="bg-blue-50 text-[#193153] border border-blue-100">
                                                {job.employmentType}
                                            </Badge>
                                            {job.salaryGrade && (
                                                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                    SG {job.salaryGrade}: ₱{SALARY_GRADE_MAP[job.salaryGrade]?.toLocaleString()}
                                                </Badge>
                                            )}
                                        </div>
                                        <div className="flex flex-col items-end gap-3 ml-4">
                                            <CustomTooltip content={savedJobIds.includes(job.id) ? "Saved Job" : "Save Job"} side="top">
                                                <Button
                                                    variant="outline"
                                                    size="icon"
                                                    className={`h-10 w-10 rounded-full transition-all border shadow-xs cursor-pointer ${savedJobIds.includes(job.id) ? 'bg-[#193153] border-[#193153] text-[#ffdd59]' : 'bg-white border-gray-200 text-gray-400 hover:text-[#ffdd59] hover:border-[#193153] hover:bg-[#193153]'}`}
                                                    onClick={(e) => toggleSaveJob(e, job.id)}
                                                >
                                                    <Bookmark className={`h-5 w-5 ${savedJobIds.includes(job.id) ? 'fill-[#ffdd59]' : ''}`} />
                                                </Button>
                                            </CustomTooltip>
                                            <Badge variant="outline" className="text-xs text-gray-500 font-normal border-gray-200 bg-gray-50">
                                                {job.applicantCount} applicants
                                            </Badge>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 mb-4 line-clamp-2">{job.description}</p>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 flex-wrap">
                                            <p className="text-sm text-gray-500">
                                                Deadline: {job.deadline ? new Date(job.deadline).toLocaleDateString() : 'N/A'}
                                            </p>
                                            {job.status === 'Closed' && (
                                                <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border border-red-200 text-[10px] font-bold py-0.5 px-2">
                                                    Closed
                                                </Badge>
                                            )}
                                        </div>
                                        <Link href={`/jobs/${job.id}`}>
                                            <Button className="bg-[#193153] text-white hover:bg-[#193153]/90 hover:text-[#ffdd59] shadow-md">
                                                View Details
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}