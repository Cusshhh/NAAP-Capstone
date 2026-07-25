import { Link, router } from '@inertiajs/react';
import { ArrowLeft, MapPin, Briefcase, Clock, Calendar, Users, CheckCircle, Upload, TrendingUp, Shield, Edit } from 'lucide-react';
 import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from "@/components/ui/checkbox"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Separator } from '@/components/ui/separator';
import { Textarea } from "@/components/ui/textarea"
import { mockJobs, SALARY_GRADE_MAP, getJobs } from '@/data/mockData';
import { calculateAIScore } from '@/utils/aiScoring';

interface JobDetailsProps {
    id: string;
    auth: { user: any };
    job: any;
    application?: any;
    interview?: any;
}

export default function JobDetails({ id, auth, job: serverJob, application, interview }: JobDetailsProps) {
    const user = auth?.user;
    const isAdmin = !!(user && (user.is_admin || user.role === 'super_admin' || user.role === 'hr_admin' || user.role === 'hr_staff' || user.email === 'admin@naap.edu.ph'));
    const job = serverJob;
    const isExpired = job.status === 'Closed' || (job.deadline ? new Date(job.deadline).setHours(23, 59, 59, 999) < new Date().getTime() : false);
    const [hasApplied, setHasApplied] = useState(application !== null && application !== undefined);
    const [isApplyOpen, setIsApplyOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        if (user && typeof window !== 'undefined') {
            setProfileImage(localStorage.getItem(`user_profile_image_${user.id}`));
        }
    }, [user]);

    // Form State
    const [formData, setFormData] = useState({
        email: user?.email || '',
        lastName: user?.name?.split(' ').pop() || '',
        firstName: user?.name?.split(' ')[0] || '',
        middleName: '',
        extensionName: '',
        age: '',
        sex: '',
        civilStatus: '',
        religion: '',
        isIP: 'No',
        isPWD: 'No',
        source: '',
        contactNumber: '',
        alternateContact: '',
        address: '',
        openToOthers: 'yes',
        // AI Scoring fields
        educationLevel: 'bachelor' as 'bachelor' | 'masters' | 'doctoral_graduate' | 'doctoral_27+' | 'doctoral_18-24' | 'doctoral_15-18' | 'doctoral_9-15',
        yearsOfExperience: '0',
        awards: [] as ('national' | 'csc' | 'president' | 'ngo')[],
        trainingHours: '0'
    });



    const [attachedDocs, setAttachedDocs] = useState<Record<string, boolean>>({});
    const [toFollowDocs, setToFollowDocs] = useState<Record<string, boolean>>({});
    const [customFiles, setCustomFiles] = useState<Record<string, File | null>>({});
    const [selectedEligibilities, setSelectedEligibilities] = useState<string[]>([]);
    // Auto-fill from Profile
    // Update the useEffect hook to populate form data from local storage when the application form (isApplyOpen) is opened.
    // This ensures that users don't have to re-enter their information if they have already saved it in their dashboard.
    useEffect(() => {
        if (isApplyOpen && typeof window !== 'undefined') {
            const savedProfile = localStorage.getItem(`user_profile_data_${user?.id}`);
            if (savedProfile) {
                const profile = JSON.parse(savedProfile);
                setFormData(prev => ({
                    ...prev,
                    lastName: profile.lastName || prev.lastName,
                    firstName: profile.firstName || prev.firstName,
                    middleName: profile.middleName || '',
                    extensionName: profile.extensionName || '',
                    age: profile.age || '',
                    sex: profile.sex ? profile.sex.toLowerCase() : '',
                    civilStatus: profile.civilStatus ? profile.civilStatus.toLowerCase() : '',
                    religion: profile.religion || '',
                    isIP: profile.ipGroup || 'No',
                    isPWD: profile.pwd || 'No',
                    contactNumber: profile.phone || '',
                    address: profile.address || '',
                    email: profile.email || prev.email
                }));
            }

            // Check for attached docs
            const docMap: Record<string, boolean> = {};
            [
                "Letter of Intent",
                "Personal Data Sheet (PDS)", // Mapped from Dashboard name
                "Work Experience Sheet",
                "Certificate of Eligibility",
                "Transcript of Records (TOR)",
                "Training Certificates", // Mapped from Dashboard
                "Performance Rating"
            ].forEach(doc => {
                const status = localStorage.getItem(`doc_${user?.id}_${doc}`);
                const hasContent = localStorage.getItem(`content_${user?.id}_${doc}`);
                const profileStatus = localStorage.getItem(`profile_doc_${user?.id}_${doc}`);

                // Only consider it manually loaded if content exists
                if ((status === 'uploaded' && hasContent) || profileStatus === 'uploaded') {
                    docMap[doc] = true;
                }
            });
            setAttachedDocs(docMap);
        }
    }, [isApplyOpen]);

    // Simulate File Upload
    // Simulate File Upload with Data URL storage for preview
    const handleFileUpload = (docName: string, file: File) => {
        // Limit file size for localStorage (e.g. 2MB)
        if (file.size > 2 * 1024 * 1024) {
            toast.error("File too large for demo storage (Limit: 2MB). Please use a smaller file.");
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const dataUrl = e.target?.result as string;

            // Simulating a slight delay
            setTimeout(() => {
                localStorage.setItem(`doc_${user?.id}_${docName}`, 'uploaded');
                localStorage.setItem(`file_${user?.id}_${docName}`, file.name);
                try {
                    localStorage.setItem(`content_${user?.id}_${docName}`, dataUrl);
                } catch (e) {
                    console.error("Storage full", e);
                    toast.error("Local storage full. Cannot save file content for preview.");
                }

                setAttachedDocs(prev => ({ ...prev, [docName]: true }));
                toast.success(`${docName} attached successfully`);
            }, 500);
        };
        reader.readAsDataURL(file);
    };

    // Check if user has already applied
    useEffect(() => {
        if (user && job) {
            const checkApplicationStatus = () => {
                // Get local custom applications
                const localApps = JSON.parse(localStorage.getItem('mock_applications_custom') || '[]');

                // Check if any application matches user email AND (job ID or job Title)
                const hasAppliedLocally = localApps.some((app: any) =>
                    app.applicantEmail === user.email &&
                    (String(app.jobId) === String(job.id) || app.jobTitle === job.title)
                );

                if (hasAppliedLocally) {
                    setHasApplied(true);
                }
            };

            checkApplicationStatus();
        }
    }, [user, job]);

    const handleApplyClick = () => {
        if (isExpired) return;
        if (!user) {
            router.visit('/login');
            return;
        }
        setIsApplyOpen(true);
    };

    const handleSubmitApplication = (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        const fullName = `${formData.firstName} ${formData.middleName ? formData.middleName + ' ' : ''}${formData.lastName}${formData.extensionName ? ' ' + formData.extensionName : ''}`.trim();

        // Gather uploaded documents from localStorage (including base64 contents)
        const docNames = [
            "Letter of Intent",
            "Personal Data Sheet (PDS)",
            "Work Experience Sheet",
            "Certificate of Eligibility",
            "Transcript of Records (TOR)",
            "Training Certificates",
            "Performance Rating"
        ];
        const uploadedDocs = docNames.map(docName => {
            const isUploaded = localStorage.getItem(`doc_${user?.id}_${docName}`) === 'uploaded' || localStorage.getItem(`profile_doc_${user?.id}_${docName}`) === 'uploaded';
            if (!isUploaded) return null;
            const fileName = localStorage.getItem(`file_${user?.id}_${docName}`) || localStorage.getItem(`profile_file_${user?.id}_${docName}`) || `${docName.toLowerCase().replace(/[^a-z0-9]/g, '_')}.pdf`;
            const content = localStorage.getItem(`content_${user?.id}_${docName}`) || localStorage.getItem(`profile_content_${user?.id}_${docName}`) || '';
            return {
                name: docName,
                fileName: fileName,
                url: content // Base64 data URL
            };
        }).filter(Boolean);

        // Generate job-specific skills based on job title
        const mockSkillsList = ['CPL', 'Instrument', 'Safety Management', 'AMT License', 'Troubleshooting', 'Logbook', 'MS Office', 'Organization', 'Communication', 'Customer Service', 'Public Speaking', 'Aviation Law', 'Project Management', 'Team Leadership'];
        const seed = job.title.charCodeAt(0) + job.title.charCodeAt(job.title.length - 1);
        const skills = [
            mockSkillsList[seed % mockSkillsList.length],
            mockSkillsList[(seed + 3) % mockSkillsList.length],
            mockSkillsList[(seed + 7) % mockSkillsList.length]
        ];

        const experienceDescription = `${formData.yearsOfExperience} years of relevant experience in ${job.title} fields. Completed ${formData.trainingHours} hours of training and seminars.`;

        const getEducationLabel = (level: string) => {
            if (level === 'bachelor') return "Bachelor's Degree";
            if (level === 'masters') return "Master's Degree";
            if (level === 'doctoral_9-15') return "Doctoral (9-15 units)";
            if (level === 'doctoral_15-18') return "Doctoral (15-18 units)";
            if (level === 'doctoral_18-24') return "Doctoral (18-24 units)";
            if (level === 'doctoral_27+') return "Doctoral (27+ units)";
            if (level === 'doctoral_graduate') return "Doctoral Graduate";
            if (level.includes('doctoral')) return "Doctoral / Ph.D. Degree";
            if (level.includes('master')) return "Master's Degree";
            if (level.includes('bachelor')) return "Bachelor's Degree";
            if (level.includes('vocational')) return "Vocational / Technical Diploma";
            if (level.includes('highschool')) return "High School Graduate";
            return level || "Bachelor's Degree";
        };

        router.post('/applications', {
            job_id: job.id,
            job_title: job.title,
            email: formData.email,
            applicant_name: fullName,
            phone_number: formData.contactNumber,
            education: getEducationLabel(formData.educationLevel),
            to_follow_docs: Object.keys(toFollowDocs).filter(k => toFollowDocs[k]),
            custom_files: customFiles,
            dynamic_responses: {
                firstName: formData.firstName,
                lastName: formData.lastName,
                middleName: formData.middleName,
                extensionName: formData.extensionName,
                contactNumber: formData.contactNumber,
                address: formData.address,
                age: formData.age,
                sex: formData.sex,
                civilStatus: formData.civilStatus,
                educationLevel: formData.educationLevel,
                yearsOfExperience: formData.yearsOfExperience,
                trainingHours: formData.trainingHours,
                awards: formData.awards,
                skills: skills,
                experience: experienceDescription,
                documents: uploadedDocs,
                religion: formData.religion,
                isIP: formData.isIP,
                isPWD: formData.isPWD,
                alternateContact: formData.alternateContact,
                source: formData.source,
                openToOthers: formData.openToOthers,
                eligibilities: selectedEligibilities
            }
        }, {
            onSuccess: () => {
                setIsSubmitting(false);
                setIsApplyOpen(false);
                setHasApplied(true);
                toast.success("Application submitted successfully!", {
                    description: "We have received your documents and will review them shortly."
                });
            },
            onError: (errors) => {
                setIsSubmitting(false);
                const firstError = Object.values(errors)[0] as string;
                toast.error("Failed to submit application: " + firstError);
            }
        });
    };

    const handleCustomFileChange = (label: string, file: File | null) => {
        setCustomFiles(prev => ({
            ...prev,
            [label]: file
        }));
    };



    if (!job) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center p-8 bg-white rounded-lg shadow-md">
                    <h1 className="text-2xl font-bold mb-4 text-[#193153]">Job Not Found</h1>
                    <p className="text-gray-500 mb-6">The job posting you are looking for does not exist or has been removed.</p>
                    <Link href="/jobs">
                        <Button>Back to Job Listings</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 font-sans">
            {/* Header */}
            <div className="bg-[#193153] text-white py-6">
                <div className="container mx-auto px-4 flex justify-between items-center">
                    <Link href={isAdmin ? "/admin/dashboard" : (user ? "/dashboard" : "/")}>
                        <Button
                            variant="ghost"
                            className="text-white hover:bg-white/10 hover:text-[#ffdd59] mb-4"
                        >
                            <ArrowLeft className="mr-2 h-4 w-4" />
                            {user ? "Go back to Dashboard" : "Go back to Home"}
                        </Button>
                    </Link>

                    {user && (
                        <Link href="/dashboard" className="flex items-center gap-3 mb-4 text-white group hover:bg-white/10 rounded-full py-1 px-3 transition-all">
                            <div className="w-8 h-8 rounded-full bg-[#ffdd59] flex items-center justify-center text-[#193153] font-bold text-xs overflow-hidden border border-white group-hover:scale-105 transition-transform">
                                {profileImage ? (
                                    <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user.name.charAt(0)
                                )}
                            </div>
                            <span className="text-sm font-medium group-hover:text-[#ffdd59] transition-colors">{user.name}</span>
                        </Link>
                    )}
                </div>
            </div>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Content */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader>
                                <div className="flex justify-between items-start">
                                    <div>
                                        <CardTitle className="text-3xl text-[#193153] font-bold mb-3">{job.title}</CardTitle>
                                        <div className="flex flex-wrap gap-4 text-gray-600 mb-4">
                                            <div className="flex items-center">
                                                <Briefcase className="h-4 w-4 mr-2" />
                                                {job.department}
                                            </div>
                                            <div className="flex items-center">
                                                <MapPin className="h-4 w-4 mr-2" />
                                                {job.location}
                                            </div>
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-2" />
                                                {job.applicantCount} applicants
                                            </div>
                                        </div>
                                        <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                            {job.employmentType}
                                        </Badge>
                                        <p className="mt-4 text-lg font-semibold text-[#193153] flex items-center">
                                            <TrendingUp className="h-5 w-5 mr-2 text-blue-600" />
                                            Salary Grade {job.salaryGrade || 'N/A'}
                                            {job.salaryGrade && SALARY_GRADE_MAP?.[job.salaryGrade] && (
                                                <span className="ml-2 text-sm font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded border border-blue-100">
                                                    ₱{SALARY_GRADE_MAP[job.salaryGrade].toLocaleString()} / month
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </CardHeader>
                            <Separator />
                            <CardContent className="pt-6">
                                <section className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Job Description</h3>
                                    <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.description}</p>
                                </section>

                                <section className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Key Responsibilities</h3>
                                    <ul className="space-y-2">
                                        {job.responsibilities?.map((resp: string, index: number) => (
                                            <li key={index} className="flex items-start">
                                                <span className="text-blue-600 mr-2">•</span>
                                                <span className="text-gray-700">{resp}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>

                                <section className="mb-8">
                                    <h3 className="text-xl font-bold text-gray-900 mb-4">Requirements</h3>
                                    <ul className="space-y-2">
                                        {job.requirements?.map((req: string, index: number) => (
                                            <li key={index} className="flex items-start">
                                                <span className="text-blue-600 mr-2">✓</span>
                                                <span className="text-gray-700">{req}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <div>
                        <Card className="sticky top-4 shadow-lg border-0">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-4 text-[#193153]">Application Details</h3>

                                <div className="space-y-4 mb-6">
                                    <div>
                                        <div className="flex items-center text-gray-600 mb-1">
                                            <Clock className="h-4 w-4 mr-2" />
                                            <span className="text-sm">Posted</span>
                                        </div>
                                        <p className="font-semibold">
                                            {job.postedDate && !isNaN(new Date(job.postedDate).getTime()) ? new Date(job.postedDate).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'Recently'}
                                        </p>
                                    </div>

                                    <div>
                                        <div className="flex items-center text-gray-600 mb-1">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            <span className="text-sm">Deadline</span>
                                        </div>
                                        <p className="font-semibold text-red-600">
                                            {job.deadline && !isNaN(new Date(job.deadline).getTime()) ? new Date(job.deadline).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'N/A'}
                                        </p>
                                    </div>
                                </div>

                                <Separator className="my-4" />

                                {isAdmin ? (
                                    // ADMIN VIEW
                                    <div className="flex flex-col gap-3">
                                        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-2">
                                            <p className="text-sm text-[#193153] font-semibold flex items-center font-bold">
                                                <Shield className="w-4 h-4 mr-2" />
                                                Admin View
                                            </p>
                                            <p className="text-xs text-gray-600 mt-1">
                                                You are logged in as an administrator.
                                            </p>
                                        </div>
                                        {(user && (user.is_super_admin || user.role === 'super_admin' || user.email === 'admin@naap.edu.ph' || String(job.campus_id) === String(user.campus_id))) ? (
                                            <Link href={`/admin/jobs?edit=${job.id}`}>
                                                <Button
                                                    className="w-full bg-[#193153] hover:bg-[#ffdd59] hover:text-[#193153] mb-3 font-bold transition-colors"
                                                    size="lg"
                                                >
                                                    <Edit className="w-4 h-4 mr-2" />
                                                    Edit Job Details
                                                </Button>
                                            </Link>
                                        ) : (
                                            <div className="bg-amber-50 border border-amber-200 rounded-md p-3 mb-2">
                                                <p className="text-xs text-amber-800">
                                                    This job is managed by another campus.
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    // APPLICANT VIEW
                                    isExpired ? (
                                        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-3 text-center">
                                            <p className="text-sm text-red-800 font-bold">
                                                Applications Closed
                                            </p>
                                            <p className="text-xs text-red-600 mt-1">
                                                The application deadline for this position has passed.
                                            </p>
                                        </div>
                                    ) : user ? (
                                        (hasApplied || application) ? (
                                            <div className="space-y-3 mb-3">
                                                <Button
                                                    className="w-full bg-green-600 text-white font-bold transition-colors cursor-default"
                                                    size="lg"
                                                    disabled
                                                >
                                                    <CheckCircle className="w-5 h-5 mr-2" />
                                                    Applied
                                                </Button>
                                                {application && (
                                                    <Button
                                                        onClick={() => setIsDetailsOpen(true)}
                                                        className="w-full bg-[#193153] hover:bg-[#ffdd59] hover:text-[#193153] font-bold transition-colors"
                                                        size="lg"
                                                    >
                                                        View Submitted Details
                                                    </Button>
                                                )}
                                            </div>
                                        ) : (
                                            <Button
                                                onClick={handleApplyClick}
                                                className="w-full bg-[#193153] hover:bg-[#ffdd59] hover:text-[#193153] mb-3 font-bold transition-colors"
                                                size="lg"
                                            >
                                                Apply Now
                                            </Button>
                                        )
                                    ) : (
                                        <Link href={`/login`}>
                                            <Button
                                                className="w-full bg-[#193153] hover:bg-[#ffdd59] hover:text-[#193153] mb-3 font-bold transition-colors"
                                                size="lg"
                                            >
                                                Apply Now
                                            </Button>
                                        </Link>
                                    )
                                )}
 
                                <Link href={isAdmin ? "/admin/jobs" : "/jobs"} className="block w-full">
                                    <Button
                                        variant="outline"
                                        className="w-full border-gray-300 text-gray-600 hover:text-[#193153] hover:border-[#193153]"
                                    >
                                        {isAdmin ? "Back to Job Management" : "Back to Listings"}
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>

                        <Card className="mt-4 shadow-md border-0">
                            <CardContent className="p-6">
                                <h3 className="font-bold text-lg mb-3 text-[#193153]">About NAAP</h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    The National Aviation Academy of the Philippines is a premier institution
                                    dedicated to aviation education and training. We are committed to excellence
                                    in developing the next generation of aviation professionals.
                                </p>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Application Modal */}
            <Dialog open={isApplyOpen} onOpenChange={setIsApplyOpen}>
                <DialogContent className="max-w-4xl h-[90vh] max-h-[90vh] flex flex-col p-0 overflow-hidden w-full gap-0">
                    <DialogHeader className="p-6 border-b shrink-0 bg-white">
                        <DialogTitle className="text-2xl font-bold text-[#193153]">Application Form</DialogTitle>
                        <DialogDescription>
                            Applying for <span className="font-bold text-[#193153]">{job.title}</span>. Please complete all fields below.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleSubmitApplication} className="flex flex-col flex-1 overflow-hidden min-h-0">
                        <div className="p-6 overflow-y-auto flex-1 space-y-6">

                        {/* 1. Personal Information */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-[#193153] border-b pb-2">Personal Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 items-end">
                                <div className="flex flex-col justify-end space-y-2">
                                    <Label htmlFor="email">Email</Label>
                                    <Input id="email" value={formData.email} readOnly className="bg-gray-50" />
                                </div>
                                <div className="flex flex-col justify-end space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} required />
                                </div>
                                <div className="flex flex-col justify-end space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} required />
                                </div>
                                <div className="flex flex-col justify-end space-y-2">
                                    <Label htmlFor="middleName" className="truncate">Middle Name <span className="text-[11px] text-gray-400 font-normal">(Optional)</span></Label>
                                    <Input id="middleName" placeholder="N/A if none" value={formData.middleName} onChange={(e) => setFormData({ ...formData, middleName: e.target.value })} />
                                </div>
                                <div className="flex flex-col justify-end space-y-2">
                                    <Label htmlFor="extensionName">Extension Name</Label>
                                    <Input id="extensionName" placeholder="" value={formData.extensionName} onChange={(e) => setFormData({ ...formData, extensionName: e.target.value })} />
                                </div>
                                <div className="flex flex-col justify-end space-y-2">
                                    <Label htmlFor="age">Age</Label>
                                    <Input id="age" type="number" value={formData.age} onChange={(e) => setFormData({ ...formData, age: e.target.value })} required />
                                </div>
                                <div className="flex flex-col justify-end space-y-2">
                                    <Label htmlFor="sex">Sex</Label>
                                    <Select value={formData.sex} onValueChange={(val) => setFormData({ ...formData, sex: val })} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="male">Male</SelectItem>
                                            <SelectItem value="female">Female</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col justify-end space-y-2">
                                    <Label htmlFor="civilStatus">Civil Status</Label>
                                    <Select value={formData.civilStatus} onValueChange={(val) => setFormData({ ...formData, civilStatus: val })} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="single">Single</SelectItem>
                                            <SelectItem value="married">Married</SelectItem>
                                            <SelectItem value="widowed">Widowed</SelectItem>
                                            <SelectItem value="separated">Separated</SelectItem>
                                            <SelectItem value="others">Others</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex flex-col justify-end space-y-2">
                                    <Label htmlFor="religion">Religion</Label>
                                    <Input id="religion" value={formData.religion} onChange={(e) => setFormData({ ...formData, religion: e.target.value })} required />
                                </div>
                            </div>
                        </div>

                        {/* 2. Demographics */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-[#193153] border-b pb-2">Demographics</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Are you a member of any Indigenous Group?</Label>
                                    <Select value={formData.isIP} onValueChange={(val) => setFormData({ ...formData, isIP: val })} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Yes">Yes</SelectItem>
                                            <SelectItem value="No">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Are you a Person with Disability (PWD)?</Label>
                                    <Select value={formData.isPWD} onValueChange={(val) => setFormData({ ...formData, isPWD: val })} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Yes">Yes</SelectItem>
                                            <SelectItem value="No">No</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* 3. Eligibilities */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-[#193153] border-b pb-2">Eligibilities</h3>
                            <p className="text-sm text-gray-500">Please tick all the eligibilities you have.</p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {[
                                    "Career Service (CS) Professional",
                                    "Career Service (CS) Sub Professional",
                                    "Bar/Board Eligibility (RA1080)",
                                    "Barangay Health Worker (RA 7883)",
                                    "Barangay Nutrition Scholar Eligibility (PD 1569)",
                                    "Barangay Official Eligibility (RA 7160)",
                                    "Electronic Data Processing Specialist Eligibility (CSC Res. 90-083)",
                                    "Foreign School Honor Graduate Eligibility (CSC Res. 90-083)",
                                    "Honor Graduate Eligibility (PD 907)",
                                    "Sanggunian Member Eligibility (RA 10156)",
                                    "Scientific and Technological Specialist Eligibility (PD 997)",
                                    "Skills Eligibility Category II (CSC MC 11, s. 1996, as Amended)",
                                    "Veteran Preference Rating (EO 132/790)",
                                    "Other"
                                ].map((eligibility, i) => (
                                    <div key={i} className="flex items-start space-x-2">
                                        <Checkbox 
                                            id={`civil-${i}`} 
                                            className="mt-1" 
                                            checked={selectedEligibilities.includes(eligibility)}
                                            onCheckedChange={(checked) => {
                                                if (checked) {
                                                    setSelectedEligibilities([...selectedEligibilities, eligibility]);
                                                } else {
                                                    setSelectedEligibilities(selectedEligibilities.filter(e => e !== eligibility));
                                                }
                                            }}
                                        />
                                        <Label htmlFor={`civil-${i}`} className="leading-snug cursor-pointer font-normal text-gray-700">
                                            {eligibility}
                                        </Label>
                                    </div>
                                ))}

                                {job.custom_file_requirements && job.custom_file_requirements.length > 0 && (
                                    <div className="space-y-4 pt-4 border-t border-gray-100">
                                        <h4 className="font-bold text-[#193153] text-sm">Additional Required Files</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {job.custom_file_requirements.map((req: { id: number, label: string }) => (
                                                <div key={req.id}>
                                                    <Label htmlFor={`custom-${req.id}`} className="text-xs font-medium text-gray-700 mb-1 block">
                                                        {req.label} *
                                                    </Label>
                                                    <Input
                                                        id={`custom-${req.id}`}
                                                        type="file"
                                                        onChange={(e) => handleCustomFileChange(req.label, e.target.files?.[0] || null)}
                                                        className="h-9 text-xs"
                                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                        required
                                                    />
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3. Contact & Address */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-[#193153] border-b pb-2">Contact Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="contactNumber">Contact Number</Label>
                                    <Input id="contactNumber" type="tel" value={formData.contactNumber} onChange={(e) => setFormData({ ...formData, contactNumber: e.target.value })} required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="alternateContact">Alternate Contact No. (Optional)</Label>
                                    <Input id="alternateContact" type="tel" value={formData.alternateContact} onChange={(e) => setFormData({ ...formData, alternateContact: e.target.value })} />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="address">Residential Address</Label>
                                    <Textarea id="address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} placeholder="House No., Street, Barangay, City, Province" required />
                                </div>
                            </div>
                        </div>

                        {/* 4. Additional Info */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-[#193153] border-b pb-2">Additional Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>How did you find this position?</Label>
                                    <Select onValueChange={(val) => setFormData({ ...formData, source: val })} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select Source" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="social_media">Social Media (Facebook, LinkedIn)</SelectItem>
                                            <SelectItem value="naap_website">NAAP Website</SelectItem>
                                            <SelectItem value="referral">Referral</SelectItem>
                                            <SelectItem value="job_fair">Job Fair</SelectItem>
                                            <SelectItem value="other">Other</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label>Open to be considered for other positions?</Label>
                                    <div className="flex gap-4 pt-2">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="openToOthers" className="accent-[#193153]" checked={formData.openToOthers === 'yes'} onChange={() => setFormData({ ...formData, openToOthers: 'yes' })} /> Yes
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name="openToOthers" className="accent-[#193153]" checked={formData.openToOthers === 'no'} onChange={() => setFormData({ ...formData, openToOthers: 'no' })} /> No
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* 5. AI Scoring Information */}
                        <div className="space-y-4 bg-blue-50 p-4 rounded-lg border border-blue-200">
                            <h3 className="font-bold text-lg text-[#193153] border-b border-blue-300 pb-2 flex items-center gap-2">
                                <TrendingUp className="w-5 h-5" /> Qualification Assessment
                            </h3>
                            <p className="text-sm text-gray-600">This information helps us match you with the right opportunities.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Education Level */}
                                <div className="space-y-2">
                                    <Label htmlFor="educationLevel">Highest Educational Attainment *</Label>
                                    <Select value={formData.educationLevel} onValueChange={(val) => setFormData({ ...formData, educationLevel: val as any })} required>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select education level" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="bachelor">Bachelor's Degree</SelectItem>
                                            <SelectItem value="masters">Master's Degree</SelectItem>
                                            <SelectItem value="doctoral_9-15">Doctoral Studies (9-15 units)</SelectItem>
                                            <SelectItem value="doctoral_15-18">Doctoral Studies (15-18 units)</SelectItem>
                                            <SelectItem value="doctoral_18-24">Doctoral Studies (18-24 units)</SelectItem>
                                            <SelectItem value="doctoral_27+">Doctoral Studies (27+ units)</SelectItem>
                                            <SelectItem value="doctoral_graduate">Doctoral Degree Graduate</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Years of Experience */}
                                <div className="space-y-2">
                                    <Label htmlFor="yearsOfExperience">Years of Relevant Work Experience *</Label>
                                    <Input
                                        id="yearsOfExperience"
                                        type="number"
                                        min="0"
                                        max="50"
                                        value={formData.yearsOfExperience}
                                        onChange={(e) => setFormData({ ...formData, yearsOfExperience: e.target.value })}
                                        placeholder="0"
                                        required
                                    />
                                    <p className="text-xs text-gray-500">Enter total years in related field</p>
                                </div>

                                {/* Training Hours */}
                                <div className="space-y-2">
                                    <Label htmlFor="trainingHours">Total Training Hours (Relevant) *</Label>
                                    <Input
                                        id="trainingHours"
                                        type="number"
                                        min="0"
                                        max="1000"
                                        value={formData.trainingHours}
                                        onChange={(e) => setFormData({ ...formData, trainingHours: e.target.value })}
                                        placeholder="0"
                                        required
                                    />
                                    <p className="text-xs text-gray-500">Include seminars, workshops, certifications</p>
                                </div>

                                {/* Awards/Accomplishments */}
                                <div className="space-y-2">
                                    <Label>Awards & Recognition (Optional)</Label>
                                    <div className="space-y-2 pt-1">
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="award-national"
                                                checked={formData.awards.includes('national')}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setFormData({ ...formData, awards: [...formData.awards, 'national'] });
                                                    } else {
                                                        setFormData({ ...formData, awards: formData.awards.filter(a => a !== 'national') });
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="award-national" className="font-normal cursor-pointer">National Award</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="award-csc"
                                                checked={formData.awards.includes('csc')}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setFormData({ ...formData, awards: [...formData.awards, 'csc'] });
                                                    } else {
                                                        setFormData({ ...formData, awards: formData.awards.filter(a => a !== 'csc') });
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="award-csc" className="font-normal cursor-pointer">Civil Service Commission Award</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="award-president"
                                                checked={formData.awards.includes('president')}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setFormData({ ...formData, awards: [...formData.awards, 'president'] });
                                                    } else {
                                                        setFormData({ ...formData, awards: formData.awards.filter(a => a !== 'president') });
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="award-president" className="font-normal cursor-pointer">President's Award</Label>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Checkbox
                                                id="award-ngo"
                                                checked={formData.awards.includes('ngo')}
                                                onCheckedChange={(checked) => {
                                                    if (checked) {
                                                        setFormData({ ...formData, awards: [...formData.awards, 'ngo'] });
                                                    } else {
                                                        setFormData({ ...formData, awards: formData.awards.filter(a => a !== 'ngo') });
                                                    }
                                                }}
                                            />
                                            <Label htmlFor="award-ngo" className="font-normal cursor-pointer">NGO/Accredited Organization Award</Label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        {/* 7. Documents */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-[#193153] border-b pb-2 flex items-center gap-2">
                                <Upload className="w-5 h-5" /> Requirements
                            </h3>
                            <p className="text-sm text-gray-500">Please upload valid PDF or Image files.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {[
                                    "Letter of Intent",
                                    "Personal Data Sheet (PDS) with Work Experience",
                                    "Work Experience Sheet (Separate)",
                                    "Certificate of Eligibility",
                                    "Transcript of Records (TOR)",
                                    "Relevant Training Certificates",
                                    "Performance Rating (IPCR/OPCR)"
                                ].map((docLabel, i) => {
                                    // Mapping document names to storage keys
                                    let storageKey = docLabel;
                                    if (docLabel.includes("PDS")) storageKey = "Personal Data Sheet (PDS)";
                                    else if (docLabel.includes("Work Experience")) storageKey = "Work Experience Sheet";
                                    else if (docLabel.includes("Training")) storageKey = "Training Certificates";
                                    else if (docLabel.includes("Performance")) storageKey = "Performance Rating";
                                    else if (docLabel.includes("Letter of Intent")) storageKey = "Letter of Intent";
                                    else if (docLabel.includes("Certificate of Eligibility")) storageKey = "Certificate of Eligibility";
                                    else if (docLabel.includes("Transcript of Records")) storageKey = "Transcript of Records (TOR)";

                                    const isAttached = attachedDocs[storageKey];

                                    // Check for manual upload WITH content
                                    const hasManualContent = localStorage.getItem(`doc_${user?.id}_${storageKey}`) === 'uploaded' && localStorage.getItem(`content_${user?.id}_${storageKey}`);
                                    const isProfileAvailable = localStorage.getItem(`profile_doc_${user?.id}_${storageKey}`) === 'uploaded';

                                    return (
                                        <div key={i} className={`space-y-2 border p-3 rounded-lg ${isAttached ? 'bg-green-50 border-green-200' : 'bg-gray-50'}`}>
                                            <div className="flex justify-between items-start">
                                                <Label className="font-semibold text-gray-700">{docLabel} <span className="text-red-500">*</span></Label>
                                                <div className="flex items-center gap-2">
                                                    {isAttached && !toFollowDocs[storageKey] && (
                                                        <span className="text-[10px] font-bold text-green-700 bg-white px-2 py-0.5 rounded border border-green-200 flex items-center gap-1">
                                                            <CheckCircle className="w-3 h-3" /> {hasManualContent ? 'Attached' : 'From Profile'}
                                                        </span>
                                                    )}
                                                    <div className="flex items-center space-x-1">
                                                        <Checkbox
                                                            id={`to-follow-${i}`}
                                                            checked={toFollowDocs[storageKey] || false}
                                                            disabled={isAttached}
                                                            onCheckedChange={(checked) => {
                                                                setToFollowDocs(prev => ({ ...prev, [storageKey]: !!checked }));
                                                            }}
                                                        />
                                                        <Label htmlFor={`to-follow-${i}`} className="text-xs text-gray-500 cursor-pointer">To Follow</Label>
                                                    </div>
                                                </div>
                                            </div>

                                            {!isAttached && !toFollowDocs[storageKey] ? (
                                                <Input
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.jpg,.png"
                                                    required={!toFollowDocs[storageKey]}
                                                    className="bg-white"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0];
                                                        if (file) {
                                                            handleFileUpload(storageKey, file);
                                                        }
                                                    }}
                                                />
                                            ) : (
                                                <div className="text-xs text-gray-500 italic pl-1 flex justify-between items-center bg-white/50 p-2 rounded">
                                                    <span>{toFollowDocs[storageKey] ? 'Marked as "To Follow".' : (hasManualContent ? 'Ready to upload.' : 'Using profile document.')}</span>
                                                    {!toFollowDocs[storageKey] && isAttached && (
                                                        <Button
                                                            type="button"
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-6 text-red-500 hover:text-red-700 hover:bg-red-50 text-[10px]"
                                                            onClick={() => {
                                                                localStorage.removeItem(`doc_${user?.id}_${storageKey}`);
                                                                localStorage.removeItem(`file_${user?.id}_${storageKey}`);
                                                                localStorage.removeItem(`content_${user?.id}_${storageKey}`);
                                                                const newDocs = { ...attachedDocs };
                                                                delete newDocs[storageKey];
                                                                setAttachedDocs(newDocs);
                                                                toast.info("Attachment removed.");
                                                            }}
                                                        >
                                                            {hasManualContent ? 'Remove' : 'Change'}
                                                        </Button>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                        </div>

                        <DialogFooter className="p-4 border-t shrink-0 bg-gray-50 flex items-center justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button type="submit" className="bg-[#193153] hover:bg-[#ffdd59] hover:text-[#193153] font-bold" disabled={isSubmitting}>
                                {isSubmitting ? "Submitting Application..." : "Submit Application"}
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Submitted Application Details Modal */}
            <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col w-full">
                    <DialogHeader className="border-b pb-4 shrink-0">
                        <DialogTitle className="text-2xl font-bold text-[#193153] flex items-center gap-2">
                            <Briefcase className="w-6 h-6 text-blue-600" />
                            Application & Interview Details
                        </DialogTitle>
                        <DialogDescription>
                            Your submitted application for <span className="font-bold text-[#193153]">{job.title}</span>.
                        </DialogDescription>
                    </DialogHeader>

                    {application && (
                        <div className="overflow-y-auto flex-1 pr-2 my-2 space-y-6">
                            {/* 1. Status Tracker */}
                            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                <h4 className="font-bold text-[#193153] text-sm mb-3 flex items-center gap-1.5">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    Application Status: <span className="underline ml-1 font-extrabold text-[#193153]">{application.status}</span>
                                </h4>
                                
                                {/* Timeline Steps */}
                                <div className="flex items-center justify-between max-w-md mx-auto pt-2 pb-4">
                                    {[
                                        { label: 'Applied', active: true },
                                        { label: 'Review', active: ['Under Review', 'Shortlisted', 'Hired', 'Rejected'].includes(application.status) },
                                        { label: 'Interview', active: ['Shortlisted', 'Hired', 'Rejected'].includes(application.status) },
                                        { label: 'Result', active: ['Hired', 'Rejected'].includes(application.status), isEnd: true }
                                    ].map((step, i) => (
                                        <div key={i} className="flex-1 flex items-center">
                                            <div className="flex flex-col items-center relative">
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border ${
                                                    step.active 
                                                        ? 'bg-blue-600 text-white border-blue-600' 
                                                        : 'bg-white text-gray-400 border-gray-300'
                                                }`}>
                                                    {i + 1}
                                                </div>
                                                <span className={`text-[10px] mt-1 font-medium ${step.active ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </span>
                                            </div>
                                            {!step.isEnd && (
                                                <div className={`flex-1 h-0.5 mx-2 -mt-4 ${step.active ? 'bg-blue-600' : 'bg-gray-200'}`} />
                                            )}
                                        </div>
                                    ))}
                                </div>
                                <div className="h-4" /> {/* Spacer for labels */}
                            </div>

                            {application.status === 'Rejected' && (
                                <div className="bg-red-50 border border-red-200 text-red-950 p-4 rounded-lg flex flex-col gap-1.5 shadow-sm">
                                    <span className="font-bold text-sm flex items-center gap-1.5 text-red-700">
                                        ❌ Rejection Details
                                    </span>
                                    <p className="text-xs font-semibold leading-relaxed">
                                        Feedback from HR: <span className="font-normal text-red-800">{application.dynamic_responses?.rejection_reason || 'Minimum education or experience requirements not met.'}</span>
                                    </p>
                                </div>
                            )}

                            {/* 2. Scheduled Interview Details (If status is shortlisted or interview is loaded) */}
                            {interview && (
                                <div className="bg-[#193153] text-white p-5 rounded-lg shadow-inner border border-blue-900 relative overflow-hidden">
                                    <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none transform translate-x-4 translate-y-4">
                                        <Calendar className="w-40 h-40" />
                                    </div>
                                    <h4 className="font-bold text-[#ffdd59] text-base mb-4 flex items-center gap-2 border-b border-blue-800 pb-2">
                                        <span className="flex items-center justify-center w-6 h-6 bg-[#ffdd59] text-[#193153] rounded-full text-xs font-black">🗓️</span>
                                        Scheduled Interview Details
                                    </h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                        <div className="flex flex-col">
                                            <span className="text-blue-200 text-xs font-medium">Date</span>
                                            <span className="font-bold text-white mt-0.5">{new Date(interview.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-blue-200 text-xs font-medium">Time</span>
                                            <span className="font-bold text-white mt-0.5">{interview.time}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-blue-200 text-xs font-medium">Venue / Platform</span>
                                            <span className="font-bold text-white mt-0.5">{interview.venue}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-blue-200 text-xs font-medium">Interview Panel Members</span>
                                            <span className="font-bold text-white mt-0.5">{interview.panelMembers || 'HR Committee Panel'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. Academic & Professional Summary */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-[#193153] text-sm border-b pb-1">Professional Credentials</h4>
                                <div className="grid grid-cols-2 gap-4 text-xs">
                                    <div className="flex flex-col bg-gray-50 p-2.5 rounded border border-gray-100">
                                        <span className="text-gray-500 font-medium">Highest Education Attained</span>
                                        <span className="font-bold text-gray-900 mt-1">
                                            {(() => {
                                                const rawEd = application.dynamic_responses?.educationLevel || application.education || '';
                                                if (rawEd.includes('doctoral')) return 'Doctoral / Ph.D. Degree';
                                                if (rawEd.includes('master')) return "Master's Degree";
                                                if (rawEd.includes('bachelor')) return "Bachelor's Degree";
                                                if (rawEd.includes('vocational')) return "Vocational / Technical Diploma";
                                                if (rawEd.includes('highschool')) return "High School Graduate";
                                                return rawEd || 'N/A';
                                            })()}
                                        </span>
                                    </div>
                                    <div className="flex flex-col bg-gray-50 p-2.5 rounded border border-gray-100">
                                        <span className="text-gray-500 font-medium">Years of Experience</span>
                                        <span className="font-bold text-gray-900 mt-1">
                                            {application.dynamic_responses?.yearsOfExperience || 0} years
                                        </span>
                                    </div>
                                    <div className="flex flex-col bg-gray-50 p-2.5 rounded border border-gray-100">
                                        <span className="text-gray-500 font-medium">Training Hours Completed</span>
                                        <span className="font-bold text-gray-900 mt-1">
                                            {application.dynamic_responses?.trainingHours || 0} hours
                                        </span>
                                    </div>
                                    <div className="flex flex-col bg-gray-50 p-2.5 rounded border border-gray-100">
                                        <span className="text-gray-500 font-medium">Open to other positions?</span>
                                        <span className="font-bold text-gray-900 mt-1 capitalize">
                                            {application.dynamic_responses?.openToOthers || 'Yes'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Personal Info Submitted */}
                            {(() => {
                                const nameParts = (application?.applicant_name || '').trim().split(/\s+/);
                                const parsedFirstName = application.dynamic_responses?.firstName || nameParts[0] || 'N/A';
                                const parsedLastName = application.dynamic_responses?.lastName || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'N/A');
                                const parsedMiddleName = application.dynamic_responses?.middleName || (nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : 'N/A');
                                const parsedContact = application.dynamic_responses?.contactNumber || application.phone_number || 'N/A';

                                return (
                                    <div className="space-y-4">
                                        <h4 className="font-bold text-[#193153] text-sm border-b pb-1">Personal Details</h4>
                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-xs">
                                            <div className="flex flex-col">
                                                <span className="text-gray-500">First Name</span>
                                                <span className="font-semibold text-gray-900 mt-0.5">{parsedFirstName}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-500">Middle Name</span>
                                                <span className="font-semibold text-gray-900 mt-0.5">{parsedMiddleName}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-500">Last Name</span>
                                                <span className="font-semibold text-gray-900 mt-0.5">{parsedLastName}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-500">Age / Sex</span>
                                                <span className="font-semibold text-gray-900 mt-0.5">
                                                    {application.dynamic_responses?.age ? `${application.dynamic_responses.age} yrs old` : 'N/A'} / {application.dynamic_responses?.sex || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-500">Civil Status</span>
                                                <span className="font-semibold text-gray-900 mt-0.5 capitalize">{application.dynamic_responses?.civilStatus || 'N/A'}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-500">Contact Number</span>
                                                <span className="font-semibold text-gray-900 mt-0.5">{parsedContact}</span>
                                            </div>
                                            <div className="flex flex-col col-span-2 md:grid-span-3">
                                                <span className="text-gray-500">Residential Address</span>
                                                <span className="font-semibold text-gray-900 mt-0.5 leading-relaxed">{application.dynamic_responses?.address || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* 5. Civil Service Board Eligibilities */}
                            {application.dynamic_responses?.eligibilities && application.dynamic_responses.eligibilities.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-bold text-[#193153] text-sm border-b pb-1">Eligibilities</h4>
                                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 pl-1">
                                        {application.dynamic_responses.eligibilities.map((elig: string, index: number) => (
                                            <li key={index}>{elig}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="border-t pt-4 shrink-0 mt-2">
                        <Button onClick={() => setIsDetailsOpen(false)} className="bg-[#193153] text-white hover:bg-[#ffdd59] hover:text-[#193153] font-bold">
                            Close Details
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
