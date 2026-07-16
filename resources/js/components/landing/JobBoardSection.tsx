import { Link, usePage, router } from '@inertiajs/react';
import { Search, Filter, MapPin, Briefcase, Clock, Bookmark, ArrowRight } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getJobs, SALARY_GRADE_MAP } from '@/data/mockData';

export default function JobBoardSection() {
    const { auth } = usePage().props as any;
    const user = auth?.user;
    const [jobs, setJobs] = useState<any[]>([]);

    useEffect(() => {
        const fetchJobs = async () => {
            try {
                const response = await axios.get('/api/open-jobs');
                if (response.data && response.data.length > 0) {
                    setJobs(response.data);
                } else {
                    setJobs(getJobs());
                }
            } catch (e) {
                console.error("Failed to load open jobs from database", e);
                setJobs(getJobs());
            }
        };
        fetchJobs();

        const handleSync = (e: StorageEvent) => {
            if (e.key === 'mock_jobs_custom') {
                setJobs(getJobs());
            }
        };
        window.addEventListener('storage', handleSync);
        return () => window.removeEventListener('storage', handleSync);
    }, []);

    // Filter Logic
    const departments = Array.from(new Set(jobs.map(j => j.department)));
    const employmentTypes = Array.from(new Set(jobs.map(j => j.employmentType)));
    const locations = Array.from(new Set(jobs.map(j => j.location).filter(Boolean)));

    const [searchTerm, setSearchTerm] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('all');
    const [employmentFilter, setEmploymentFilter] = useState('all');
    const [locationFilter, setLocationFilter] = useState('all');
    const [savedJobIds, setSavedJobIds] = useState<any[]>([]);

    useEffect(() => {
        if (user) {
            const saved = localStorage.getItem(`saved_jobs_${user.id}`);
            if (saved) {
                try {
                    setSavedJobIds(JSON.parse(saved));
                } catch (e) { console.error(e); }
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
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.department.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description.toLowerCase().includes(searchTerm.toLowerCase());

        const matchesDepartment = departmentFilter === 'all' || job.department === departmentFilter;
        const matchesEmployment = employmentFilter === 'all' || job.employmentType === employmentFilter;
        const matchesLocation = locationFilter === 'all' || job.location === locationFilter;

        return matchesSearch && matchesDepartment && matchesEmployment && matchesLocation && job.status === 'Open';
    });

    return (
        <section id="job-board" className="py-20 px-4 bg-gray-50">
            <div className="container mx-auto max-w-7xl">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-bold text-[#193153]">Career Opportunities</h2>
                    <p className="text-gray-500 mt-4 text-lg">Browse our latest openings and find your place in the sky.</p>
                </div>

                {/* Filters */}
                <Card className="mb-8 shadow-md border-0">
                    <CardContent className="p-6">
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="md:col-span-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                <Input
                                    placeholder="Search keywords..."
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="pl-10 border-gray-200 focus:border-[#193153] focus:ring-[#193153]"
                                />
                            </div>
                            <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                                <SelectTrigger className="border-gray-200">
                                    <SelectValue placeholder="Department" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Departments</SelectItem>
                                    {departments.map(dept => (
                                        <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={employmentFilter} onValueChange={setEmploymentFilter}>
                                <SelectTrigger className="border-gray-200">
                                    <SelectValue placeholder="Type" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Types</SelectItem>
                                    {employmentTypes.map(type => (
                                        <SelectItem key={type} value={type}>{type}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select value={locationFilter} onValueChange={setLocationFilter}>
                                <SelectTrigger className="border-gray-200">
                                    <SelectValue placeholder="Location" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="all">All Locations</SelectItem>
                                    {locations.map(loc => (
                                        <SelectItem key={loc} value={loc}>{loc}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* Results Info */}
                <div className="flex items-center justify-between mb-6 px-2">
                    <p className="text-gray-600 font-medium">
                        Showing <span className="text-[#193153] font-bold">{filteredJobs.length}</span> positions
                    </p>
                    {(departmentFilter !== 'all' || employmentFilter !== 'all' || locationFilter !== 'all' || searchTerm) && (
                        <Button
                            variant="link"
                            className="text-[#193153] p-0 h-auto"
                            onClick={() => {
                                setSearchTerm('');
                                setDepartmentFilter('all');
                                setEmploymentFilter('all');
                                setLocationFilter('all');
                            }}
                        >
                            Clear Filters
                        </Button>
                    )}
                </div>

                {/* Job Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredJobs.length === 0 ? (
                        <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-xl border border-dashed border-gray-300">
                            <Briefcase className="h-12 w-12 mx-auto text-gray-300 mb-3" />
                            <p className="text-lg">No positions match your search criteria.</p>
                            <Button variant="link" onClick={() => {
                                setSearchTerm('');
                                setDepartmentFilter('all');
                                setEmploymentFilter('all');
                                setLocationFilter('all');
                            }}>Clear all filters</Button>
                        </div>
                    ) : (
                        filteredJobs.map((job) => (
                            <div key={job.id} className="group relative">
                                <Card className="h-full border border-gray-200 hover:border-[#193153] hover:shadow-xl transition-all duration-300 flex flex-col">
                                    <CardContent className="p-6 flex flex-col h-full">
                                        <div className="flex justify-between items-start mb-4">
                                            <Badge variant="secondary" className="bg-blue-50 text-[#193153] hover:bg-blue-100">
                                                {job.employmentType}
                                            </Badge>
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className={`h-8 w-8 rounded-full ${savedJobIds.includes(job.id) ? 'text-[#ffdd59]' : 'text-gray-300 hover:text-[#193153]'}`}
                                                onClick={(e) => toggleSaveJob(e, job.id)}
                                            >
                                                <Bookmark className={`h-5 w-5 ${savedJobIds.includes(job.id) ? 'fill-[#ffdd59]' : ''}`} />
                                            </Button>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#193153] transition-colors line-clamp-2">
                                            {job.title}
                                        </h3>

                                        <div className="space-y-2 mb-6">
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Briefcase className="h-4 w-4 mr-2 text-gray-400" />
                                                {job.department}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                                                {job.location}
                                            </div>
                                            {job.salaryGrade && (
                                                <div className="flex items-center text-xs font-semibold text-green-700 bg-green-50 px-2 py-1 rounded w-fit mt-2">
                                                    SG {job.salaryGrade} • ₱{SALARY_GRADE_MAP[job.salaryGrade]?.toLocaleString()}
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
                                            <span className="text-xs text-gray-500 flex items-center">
                                                <Clock className="h-3 w-3 mr-1" />
                                                {new Date(job.postedDate).toLocaleDateString()}
                                            </span>
                                            <Link href={`/jobs/${job.id}`}>
                                                <Button size="sm" className="bg-transparent text-[#193153] hover:bg-blue-50 border border-[#193153]">
                                                    Details
                                                </Button>
                                            </Link>
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </section>
    );
}
