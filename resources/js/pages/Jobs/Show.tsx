import { Link, router } from '@inertiajs/react';
import { ArrowLeft, MapPin, Briefcase, Clock, Calendar, Users, CheckCircle, Upload, TrendingUp, Shield, ShieldCheck, Edit, Plus, Trash2, ExternalLink } from 'lucide-react';
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
import { formatApplicantFullName } from '@/lib/utils';

interface JobDetailsProps {
    id: string;
    auth: { user: any };
    job: any;
    application?: any;
    interview?: any;
    restriction?: {
        type: 'hired' | 'active_app' | 'cooldown';
        jobTitle?: string;
        daysLeft?: number;
        unlockDate?: string;
        message: string;
    } | null;
}

const parseArrayField = (field: any): any[] => {
    if (!field) return [];
    if (Array.isArray(field)) return field;
    if (typeof field === 'string') {
        try {
            const parsed = JSON.parse(field);
            if (Array.isArray(parsed)) return parsed;
            return [field];
        } catch (e) {
            return field.split('\n').map(s => s.trim()).filter(Boolean);
        }
    }
    return [];
};

const formatTime = (timeStr?: string | null) => {
    if (!timeStr) return 'TBA';
    const str = String(timeStr).trim();
    if (/am|pm/i.test(str)) return str;
    const match = str.match(/^(\d{1,2}):(\d{2})(?::\d{2})?$/);
    if (!match) return str;
    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    if (hours === 0) hours = 12;
    return `${hours}:${minutes} ${ampm}`;
};

export default function JobDetails({ id, auth, job: serverJob, application, interview, restriction }: JobDetailsProps) {
    const user = auth?.user;
    const isAdmin = !!(user && (user.is_admin || user.role === 'super_admin' || user.role === 'hr_admin' || user.role === 'hr_staff' || user.email === 'admin@naap.edu.ph'));
    const job = serverJob;
    const isExpired = job?.status === 'Closed' || (job?.deadline ? new Date(job.deadline).setHours(23, 59, 59, 999) < new Date().getTime() : false);

    const safeResponsibilities = Array.from(new Set(parseArrayField(job?.responsibilities)));
    const safeRequirements = Array.from(new Set(parseArrayField(job?.requirements)));
    const safeCustomFiles = parseArrayField(job?.custom_file_requirements).map((req, idx) => {
        if (typeof req === 'string') {
            return { id: `custom-${idx}`, label: req };
        }
        return { id: req?.id || `custom-${idx}`, label: req?.label || req?.name || String(req || '') };
    });
    const [hasApplied, setHasApplied] = useState(application !== null && application !== undefined);
    const [localApp, setLocalApp] = useState<any>(null);
    const activeApp = application || localApp;
    const appData = activeApp;

    const [isApplyOpen, setIsApplyOpen] = useState(false);
    const [isDetailsOpen, setIsDetailsOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [uploadingDocLabel, setUploadingDocLabel] = useState<string | null>(null);
    const [profileImage, setProfileImage] = useState<string | null>(null);

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const params = new URLSearchParams(window.location.search);
            if (params.get('viewSubmitted') === '1' || params.get('viewDetails') === '1') {
                setIsDetailsOpen(true);
            }
        }
    }, []);

    useEffect(() => {
        if (user && typeof window !== 'undefined') {
            const pData = (user as any)?.profile_data || {};
            const isRemoved = pData.photo_removed || (pData.avatar_url === null && pData.photo === null && pData.avatar === null && !(user as any)?.avatar_url);
            if (isRemoved) {
                localStorage.removeItem(`user_profile_image_${user.id}`);
                setProfileImage(null);
                return;
            }
            const serverPhoto = (user as any)?.avatar_url || pData.avatar_url || pData.photo || pData.avatar || (user as any)?.avatar;
            if (serverPhoto) {
                setProfileImage(serverPhoto);
            } else {
                const savedData = localStorage.getItem(`user_profile_data_${user.id}`);
                if (savedData) {
                    try {
                        const parsed = JSON.parse(savedData);
                        if (parsed && parsed.email && parsed.email.toLowerCase() !== user.email.toLowerCase()) {
                            localStorage.removeItem(`user_profile_data_${user.id}`);
                            localStorage.removeItem(`user_profile_image_${user.id}`);
                            setProfileImage(null);
                            return;
                        }
                    } catch (e) {}
                }
                setProfileImage(localStorage.getItem(`user_profile_image_${user.id}`));
            }
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
        sex: 'male',
        civilStatus: 'single',
        religion: '',
        isIP: 'No',
        isPWD: 'No',
        source: 'naap_website',
        contactNumber: '',
        alternateContact: '',
        address: '',
        openToOthers: 'yes',
        // CS Form No. 212 Gov IDs (PDS Sec I)
        gsisNo: '',
        sssNo: '',
        tinNo: '',
        pagibigNo: '',
        philhealthNo: '',
        // Education Details (PDS Sec II)
        schoolName: '',
        degreeCourse: '',
        yearGraduated: '',
        // Eligibility License (PDS Sec III)
        licenseNo: '',
        // Experience Details (PDS Sec IV)
        recentPositionTitle: '',
        recentEmployer: '',
        // Training Details (PDS Sec VI)
        recentTrainingTitle: '',
        // Skills (PDS Sec VII)
        skills: [] as string[],
        // AI Scoring fields
        educationLevel: '' as any,
        yearsOfExperience: '0',
        awards: [] as ('national' | 'csc' | 'president' | 'ngo')[],
        trainingHours: '0'
    });

    const [attachedDocs, setAttachedDocs] = useState<Record<string, boolean>>({});
    const [toFollowDocs, setToFollowDocs] = useState<Record<string, boolean>>({});
    const [customFiles, setCustomFiles] = useState<Record<string, File | null>>({});
    const [selectedEligibilities, setSelectedEligibilities] = useState<string[]>([]);
    const [otherEligibilityText, setOtherEligibilityText] = useState<string>('');
    const [extraCustomDocs, setExtraCustomDocs] = useState<{ id: number, label: string, file: File | null }[]>([]);
    const [swornOathAgreed, setSwornOathAgreed] = useState<boolean>(false);
    // Auto-fill from Profile
    // Update the useEffect hook to populate form data from local storage when the application form (isApplyOpen) is opened.
    // This ensures that users don't have to re-enter their information if they have already saved it in their dashboard.
    useEffect(() => {
        if (isApplyOpen && typeof window !== 'undefined' && user) {
            const savedProfileStr = localStorage.getItem(`user_profile_data_${user.id}`);
            if (savedProfileStr) {
                try {
                    const profile = JSON.parse(savedProfileStr);
                    if (profile && profile.email && profile.email.toLowerCase() !== user.email.toLowerCase()) {
                        localStorage.removeItem(`user_profile_data_${user.id}`);
                        localStorage.removeItem(`user_profile_image_${user.id}`);
                        return;
                    }
                    const rawCivil = (profile.civilStatus || 'single').toLowerCase();
                    const civilStatusVal = rawCivil === 'other' ? 'others' : rawCivil;

                    setFormData(prev => ({
                        ...prev,
                        email: user.email,
                    lastName: profile.lastName || prev.lastName,
                    firstName: profile.firstName || prev.firstName,
                    middleName: profile.middleName || prev.middleName || '',
                    extensionName: profile.extensionName || prev.extensionName || '',
                    age: profile.age || prev.age || '',
                    sex: profile.sex ? profile.sex.toLowerCase() : (prev.sex || 'male'),
                    civilStatus: civilStatusVal,
                    religion: profile.religion || prev.religion || '',
                    isIP: profile.ipGroup || prev.isIP || 'No',
                    isPWD: profile.pwd || prev.isPWD || 'No',
                    source: profile.source || prev.source || 'naap_website',
                    contactNumber: profile.phone || prev.contactNumber || '',
                    alternateContact: profile.alternateContact || prev.alternateContact || '',
                    address: profile.address || prev.address || '',
                    // CS Form No. 212 Gov IDs (PDS Sec I)
                    gsisNo: profile.gsisNo || prev.gsisNo || '',
                    sssNo: profile.sssNo || prev.sssNo || '',
                    tinNo: profile.tinNo || prev.tinNo || '',
                    pagibigNo: profile.pagibigNo || prev.pagibigNo || '',
                    philhealthNo: profile.philhealthNo || prev.philhealthNo || '',
                    // Education Details (PDS Sec II)
                    educationLevel: profile.educationLevel !== undefined ? profile.educationLevel : '',
                    schoolName: profile.schoolName || prev.schoolName || '',
                    degreeCourse: profile.degreeCourse || prev.degreeCourse || '',
                    yearGraduated: profile.yearGraduated || prev.yearGraduated || '',
                    // Eligibility License (PDS Sec III)
                    licenseNo: profile.licenseNo || prev.licenseNo || '',
                    // Work Experience Details (PDS Sec IV)
                    yearsOfExperience: String(profile.yearsOfExperience || prev.yearsOfExperience || '0'),
                    recentPositionTitle: profile.recentPositionTitle || prev.recentPositionTitle || '',
                    recentEmployer: profile.recentEmployer || prev.recentEmployer || '',
                    // Training Details (PDS Sec VI)
                    trainingHours: String(profile.trainingHours || prev.trainingHours || '0'),
                    recentTrainingTitle: profile.recentTrainingTitle || prev.recentTrainingTitle || '',
                    // Skills & Awards (PDS Sec VII)
                    skills: Array.isArray(profile.skills) && profile.skills.length > 0 ? profile.skills : prev.skills,
                    awards: Array.isArray(profile.awards) ? profile.awards : (prev.awards || [])
                }));

                if (profile.eligibilities && Array.isArray(profile.eligibilities) && profile.eligibilities.length > 0) {
                    setSelectedEligibilities(profile.eligibilities);
                }
            } catch (e) {}
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
                } catch (storageErr) {
                    console.warn("localStorage quota reached, using sessionStorage fallback", storageErr);
                    try {
                        sessionStorage.setItem(`content_${user?.id}_${docName}`, dataUrl);
                    } catch (sessionErr) {}
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
                const foundApp = localApps.find((app: any) =>
                    (app.applicantEmail === user.email || app.email === user.email) &&
                    (String(app.jobId) === String(job.id) || (app.jobTitle && app.jobTitle.toLowerCase() === job.title?.toLowerCase()))
                );

                if (foundApp || application) {
                    setHasApplied(true);
                    if (foundApp) setLocalApp(foundApp);
                }
            };

            checkApplicationStatus();
        }
    }, [user, job, application]);

    const handleApplyClick = () => {
        if (isExpired) return;
        if (!user) {
            router.visit('/login');
            return;
        }
        if (restriction) {
            toast.error(restriction.message);
            return;
        }
        setIsApplyOpen(true);
    };

    const handleSubmitApplication = (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.lastName.trim() || !formData.firstName.trim()) {
            toast.error("Please fill in your complete name.");
            return;
        }
        if (!formData.contactNumber.trim()) {
            toast.error("Please enter your contact number.");
            return;
        }
        if (!formData.address.trim()) {
            toast.error("Please enter your residential address.");
            return;
        }
        if (selectedEligibilities.includes("Other") && !otherEligibilityText.trim()) {
            toast.error("Please specify your custom eligibility in the field provided.");
            return;
        }
        if (!swornOathAgreed) {
            toast.error("Please read and check the Sworn Declaration under CS Form No. 212 before submitting.");
            return;
        }

        setIsSubmitting(true);

        const fullName = formatApplicantFullName(formData);

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
            if (!user?.id) return null;
            const isUploaded = localStorage.getItem(`doc_${user.id}_${docName}`) === 'uploaded' || localStorage.getItem(`profile_doc_${user.id}_${docName}`) === 'uploaded';
            if (!isUploaded) return null;
            const fileName = localStorage.getItem(`file_${user.id}_${docName}`) || localStorage.getItem(`profile_file_${user.id}_${docName}`);
            if (!fileName) return null;
            const content = localStorage.getItem(`content_${user.id}_${docName}`) || localStorage.getItem(`profile_content_${user.id}_${docName}`) || '';
            return {
                name: docName,
                fileName: fileName,
                url: content // Base64 data URL
            };
        }).filter(Boolean);

        // Build realistic experience summary from exact applicant inputs
        let experienceDescription = "";
        if (formData.recentPositionTitle || formData.recentEmployer) {
            experienceDescription = `Worked as ${formData.recentPositionTitle || 'Staff'} at ${formData.recentEmployer || 'Previous Agency'} for ${formData.yearsOfExperience || 0} years.`;
        } else {
            experienceDescription = `${formData.yearsOfExperience || 0} years of total work experience declared.`;
        }

        if (formData.recentTrainingTitle || formData.trainingHours) {
            experienceDescription += ` Completed ${formData.trainingHours || 0} hours of training (${formData.recentTrainingTitle || 'Seminars & Workshops'}).`;
        }

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
                schoolName: formData.schoolName,
                degreeCourse: formData.degreeCourse,
                yearGraduated: formData.yearGraduated,
                licenseNo: formData.licenseNo,
                yearsOfExperience: formData.yearsOfExperience,
                recentPositionTitle: formData.recentPositionTitle,
                recentEmployer: formData.recentEmployer,
                trainingHours: formData.trainingHours,
                recentTrainingTitle: formData.recentTrainingTitle,
                awards: formData.awards,
                skills: formData.skills && formData.skills.length > 0 ? formData.skills : [],
                experience: experienceDescription,
                documents: uploadedDocs,
                religion: formData.religion,
                isIP: formData.isIP,
                isPWD: formData.isPWD,
                gsisNo: formData.gsisNo,
                sssNo: formData.sssNo,
                tinNo: formData.tinNo,
                pagibigNo: formData.pagibigNo,
                philhealthNo: formData.philhealthNo,
                alternateContact: formData.alternateContact,
                source: formData.source,
                openToOthers: formData.openToOthers,
                eligibilities: selectedEligibilities.map(e => {
                    if (e === 'Other' && otherEligibilityText.trim()) {
                        return `Other: ${otherEligibilityText.trim()}`;
                    }
                    return e;
                })
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

    const handleUploadToFollowDocument = (documentLabel: string, file: File) => {
        if (!application?.id || !file) return;

        try {
            setUploadingDocLabel(documentLabel);
            const toastId = toast.loading(`Uploading '${documentLabel}'...`);

            const formDataPayload = new FormData();
            formDataPayload.append('document_label', documentLabel);
            formDataPayload.append('file', file);

            router.post(`/applications/${application.id}/upload-to-follow`, formDataPayload, {
                onSuccess: () => {
                    setUploadingDocLabel(null);
                    toast.dismiss(toastId);
                    toast.success(`'${documentLabel}' uploaded successfully!`, {
                        description: "Your document has been received and synced with your application."
                    });
                },
                onError: (errors) => {
                    setUploadingDocLabel(null);
                    toast.dismiss(toastId);
                    const firstErr = Object.values(errors)[0] as string;
                    toast.error(`Failed to upload document: ${firstErr || 'Unknown error'}`);
                },
                onFinish: () => {
                    setUploadingDocLabel(null);
                }
            });
        } catch (err: any) {
            setUploadingDocLabel(null);
            toast.error(`Failed to initiate upload: ${err?.message || 'Error occurred'}`);
        }
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
                        <div className="flex items-center gap-2.5 bg-[#244066]/80 border border-blue-300/30 rounded-full pl-1.5 pr-4 py-1 shadow-xs mb-4">
                            <div className="w-8 h-8 rounded-full bg-[#ffdd59] flex items-center justify-center text-[#193153] font-bold text-xs overflow-hidden ring-2 ring-white/50 shrink-0">
                                {profileImage || user.avatar_url || user.profile_data?.avatar_url || user.profile_data?.photo ? (
                                    <img src={profileImage || user.avatar_url || user.profile_data?.avatar_url || user.profile_data?.photo} alt="Profile" className="w-full h-full object-cover" />
                                ) : (
                                    user.name.charAt(0).toUpperCase()
                                )}
                            </div>
                            <span className="text-sm font-bold text-[#ffdd59] max-w-xs truncate">{user.name}</span>
                        </div>
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
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200">
                                                {job.employmentType || 'Full-time'}
                                            </Badge>
                                            {job.plantilla_item && (
                                                <Badge variant="outline" className="border-indigo-300 text-indigo-800 bg-indigo-50 font-mono text-xs">
                                                    Item No. {job.plantilla_item}
                                                </Badge>
                                            )}
                                        </div>
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

                                {job.competency && (
                                    <section className="mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Core & Functional Competencies</h3>
                                        <p className="text-gray-700 leading-relaxed whitespace-pre-line">{job.competency}</p>
                                    </section>
                                )}

                                {safeResponsibilities.length > 0 && (
                                    <section className="mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Key Responsibilities</h3>
                                        <ul className="space-y-2">
                                            {safeResponsibilities.map((resp: any, index: number) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-blue-600 mr-2">•</span>
                                                    <span className="text-gray-700">{typeof resp === 'string' ? resp : (resp?.title || resp?.name || JSON.stringify(resp))}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                {safeRequirements.length > 0 && (
                                    <section className="mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Qualification Standards</h3>
                                        <ul className="space-y-2">
                                            {safeRequirements.map((req: any, index: number) => (
                                                <li key={index} className="flex items-start">
                                                    <span className="text-blue-600 mr-2">✓</span>
                                                    <span className="text-gray-700">{typeof req === 'string' ? req : (req?.title || req?.name || JSON.stringify(req))}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </section>
                                )}

                                {safeCustomFiles.length > 0 && (
                                    <section className="mb-8">
                                        <h3 className="text-xl font-bold text-gray-900 mb-4">Required Document Attachments</h3>
                                        <div className="flex flex-wrap gap-2">
                                            {safeCustomFiles.map((customReq: any, index: number) => (
                                                <Badge key={customReq.id || index} variant="outline" className="border-blue-300 bg-blue-50 text-blue-900 py-1 px-3 text-xs flex items-center">
                                                    <Upload className="w-3 h-3 mr-1.5 text-blue-600" />
                                                    {customReq.label}
                                                </Badge>
                                            ))}
                                        </div>
                                    </section>
                                )}
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
                                    (hasApplied || activeApp) ? (
                                        <div className="space-y-3 mb-3">
                                            <Button
                                                className="w-full bg-green-600 text-white font-bold transition-colors cursor-default"
                                                size="lg"
                                                disabled
                                            >
                                                <CheckCircle className="w-5 h-5 mr-2" />
                                                Applied
                                            </Button>
                                            <Button
                                                onClick={() => setIsDetailsOpen(true)}
                                                className="w-full bg-[#193153] hover:bg-[#ffdd59] hover:text-[#193153] font-bold transition-colors"
                                                size="lg"
                                            >
                                                View Submitted Details
                                            </Button>
                                        </div>
                                    ) : isExpired ? (
                                        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-3 text-center">
                                            <p className="text-sm text-red-800 font-bold">
                                                Applications Closed
                                            </p>
                                            <p className="text-xs text-red-600 mt-1">
                                                The application deadline for this position has passed.
                                            </p>
                                        </div>
                                    ) : user ? (
                                        restriction ? (
                                            <div className="space-y-3 mb-3">
                                                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-900 leading-relaxed">
                                                    <div className="font-bold flex items-center gap-1.5 text-amber-950 mb-1">
                                                        <span>⚠️</span> CSC Application Policy Notice
                                                    </div>
                                                    <p className="text-[11px] text-amber-800">{restriction.message}</p>
                                                </div>
                                                <Button
                                                    disabled
                                                    className="w-full bg-slate-200 text-slate-500 font-bold cursor-not-allowed border-0 shadow-none"
                                                    size="lg"
                                                >
                                                    Application Restricted
                                                </Button>
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
                                    <Select value={formData.sex || 'male'} onValueChange={(val) => setFormData({ ...formData, sex: val })}>
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
                                    <Select value={formData.civilStatus === 'other' ? 'others' : (formData.civilStatus || 'single')} onValueChange={(val) => setFormData({ ...formData, civilStatus: val })}>
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

                        {/* 2. Demographics & Government Identification Numbers */}
                        <div className="space-y-4">
                            <h3 className="font-bold text-lg text-[#193153] border-b pb-2">Demographics & Government Identification</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label>Are you a member of any Indigenous Group?</Label>
                                    <Select value={formData.isIP || 'No'} onValueChange={(val) => setFormData({ ...formData, isIP: val })}>
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
                                    <Select value={formData.isPWD || 'No'} onValueChange={(val) => setFormData({ ...formData, isPWD: val })}>
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
                            <h3 className="font-bold text-lg text-[#193153] border-b pb-2">Eligibilities & Professional Licenses</h3>
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
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                                <div className="space-y-1.5">
                                    <Label htmlFor="licenseNo" className="text-xs font-semibold text-gray-700">License / Registration No. <span className="text-[11px] text-gray-400 font-normal">(PRC / CAAP / CSC, Optional)</span></Label>
                                    <Input 
                                        id="licenseNo"
                                        type="text"
                                        placeholder="e.g. PRC License No. 0123456"
                                        value={formData.licenseNo}
                                        onChange={(e) => setFormData({ ...formData, licenseNo: e.target.value })}
                                        className="h-9 text-xs"
                                    />
                                </div>

                                {selectedEligibilities.includes("Other") && (
                                    <div className="space-y-1.5">
                                        <Label htmlFor="other-eligibility-input" className="text-xs font-semibold text-[#193153]">
                                            Specify Other Eligibility / Rating: <span className="text-red-500">*</span>
                                        </Label>
                                        <Input 
                                            id="other-eligibility-input"
                                            type="text"
                                            placeholder="e.g. CAAP Commercial Pilot License, CPA, PMP"
                                            value={otherEligibilityText}
                                            onChange={(e) => setOtherEligibilityText(e.target.value)}
                                            className="h-9 text-xs border-blue-300 focus:border-[#193153]"
                                        />
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
                                    <Select value={formData.source || 'naap_website'} onValueChange={(val) => setFormData({ ...formData, source: val })}>
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
                                    <Select value={formData.educationLevel || undefined} onValueChange={(val) => setFormData({ ...formData, educationLevel: (val === 'none' ? '' : val) as any })}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="-- Select Highest Education Attained --" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="none">-- Select Highest Education Attained --</SelectItem>
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

                                {/* School / University Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="schoolName">School / College / University <span className="text-[11px] text-gray-400 font-normal">(PDS Sec II)</span></Label>
                                    <Input
                                        id="schoolName"
                                        type="text"
                                        value={formData.schoolName}
                                        onChange={(e) => setFormData({ ...formData, schoolName: e.target.value })}
                                        placeholder="e.g. NAAP Pasay Campus / PUP"
                                        className="bg-white text-xs"
                                    />
                                </div>

                                {/* Degree / Course Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="degreeCourse">Degree / Course Title <span className="text-[11px] text-gray-400 font-normal">(PDS Sec II)</span></Label>
                                    <Input
                                        id="degreeCourse"
                                        type="text"
                                        value={formData.degreeCourse}
                                        onChange={(e) => setFormData({ ...formData, degreeCourse: e.target.value })}
                                        placeholder="e.g. BS Aeronautical Engineering / Public Admin"
                                        className="bg-white text-xs"
                                    />
                                </div>

                                {/* Year Graduated */}
                                <div className="space-y-2">
                                    <Label htmlFor="yearGraduated">Year Graduated <span className="text-[11px] text-gray-400 font-normal">(PDS Sec II)</span></Label>
                                    <Input
                                        id="yearGraduated"
                                        type="text"
                                        value={formData.yearGraduated}
                                        onChange={(e) => setFormData({ ...formData, yearGraduated: e.target.value })}
                                        placeholder="e.g. 2022"
                                        className="bg-white text-xs"
                                    />
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

                                {/* Recent Position Title */}
                                <div className="space-y-2">
                                    <Label htmlFor="recentPositionTitle">Most Recent Position / Designation <span className="text-[11px] text-gray-400 font-normal">(PDS Sec IV)</span></Label>
                                    <Input
                                        id="recentPositionTitle"
                                        type="text"
                                        value={formData.recentPositionTitle}
                                        onChange={(e) => setFormData({ ...formData, recentPositionTitle: e.target.value })}
                                        placeholder="e.g. Air Traffic Specialist II"
                                        className="bg-white text-xs"
                                    />
                                </div>

                                {/* Recent Employer */}
                                <div className="space-y-2">
                                    <Label htmlFor="recentEmployer">Most Recent Employer / Agency <span className="text-[11px] text-gray-400 font-normal">(PDS Sec IV)</span></Label>
                                    <Input
                                        id="recentEmployer"
                                        type="text"
                                        value={formData.recentEmployer}
                                        onChange={(e) => setFormData({ ...formData, recentEmployer: e.target.value })}
                                        placeholder="e.g. CAAP / NAAP Pasay"
                                        className="bg-white text-xs"
                                    />
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

                                {/* Recent Training Title */}
                                <div className="space-y-2 md:col-span-2">
                                    <Label htmlFor="recentTrainingTitle">Most Recent Seminar / Training Title <span className="text-[11px] text-gray-400 font-normal">(PDS Sec VI)</span></Label>
                                    <Input
                                        id="recentTrainingTitle"
                                        type="text"
                                        value={formData.recentTrainingTitle}
                                        onChange={(e) => setFormData({ ...formData, recentTrainingTitle: e.target.value })}
                                        placeholder="e.g. Advanced Aviation Safety & Public Service Excellence Seminar (2026)"
                                        className="bg-white text-xs"
                                    />
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


                        {/* 7. Requirements */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <h3 className="font-bold text-lg text-[#193153] flex items-center gap-2">
                                    <Upload className="w-5 h-5 text-[#193153]" /> Requirements
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="border-dashed border-blue-400 text-blue-700 hover:bg-blue-50 font-bold gap-1 text-xs h-8 px-2.5 shadow-2xs cursor-pointer"
                                    onClick={() => {
                                        setExtraCustomDocs(prev => [
                                            ...prev,
                                            { id: Date.now(), label: '', file: null }
                                        ]);
                                    }}
                                >
                                    <Plus className="w-3.5 h-3.5 text-blue-600" />
                                    Add Other Document
                                </Button>
                            </div>
                            <p className="text-xs text-gray-500">Please upload valid PDF or Image files for all required documents.</p>

                            {/* Job Required Files Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {(() => {
                                    const defaultCoreDocs = [
                                        "Letter of Intent",
                                        "Personal Data Sheet (CS Form No. 212, Rev. 2026)",
                                        "Work Experience Sheet (WES)",
                                        "Certificate of Eligibility",
                                        "Transcript of Records (TOR)",
                                        "Relevant Training Certificates",
                                        "Performance Rating (IPCR/OPCR)"
                                    ];

                                    const reqList = safeCustomFiles.length > 0
                                        ? safeCustomFiles
                                        : defaultCoreDocs.map((label, idx) => ({ id: `core-${idx}`, label }));

                                    return reqList.map((req, i) => {
                                        const reqLabel = typeof req === 'string' ? req : req.label;
                                        const isToFollow = toFollowDocs[reqLabel] || false;
                                        return (
                                            <div key={req.id || i} className="p-3 bg-gray-50/80 border border-gray-200 rounded-xl space-y-2 shadow-2xs">
                                                <div className="flex items-center justify-between gap-2">
                                                    <Label htmlFor={`req-${i}`} className="text-xs font-semibold text-[#193153] leading-snug block">
                                                        {reqLabel} {!isToFollow && <span className="text-red-500">*</span>}
                                                    </Label>

                                                    <div className="flex items-center space-x-1.5 shrink-0 bg-white px-2 py-0.5 rounded border border-gray-200 shadow-2xs">
                                                        <Checkbox
                                                            id={`to-follow-${i}`}
                                                            checked={isToFollow}
                                                            onCheckedChange={(checked) => {
                                                                setToFollowDocs(prev => ({ ...prev, [reqLabel]: !!checked }));
                                                            }}
                                                        />
                                                        <Label htmlFor={`to-follow-${i}`} className="text-[11px] font-medium text-gray-600 cursor-pointer select-none">
                                                            To Follow
                                                        </Label>
                                                    </div>
                                                </div>

                                                {isToFollow ? (
                                                    <div className="text-[11px] text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-lg font-medium">
                                                        ⏳ Marked as "To Follow". You may submit this document later.
                                                    </div>
                                                ) : (
                                                    <Input
                                                        id={`req-${i}`}
                                                        type="file"
                                                        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                        onChange={(e) => handleCustomFileChange(reqLabel, e.target.files?.[0] || null)}
                                                        className="h-9 text-xs bg-white border-gray-200 focus:border-[#193153] cursor-pointer"
                                                        required={!isToFollow}
                                                    />
                                                )}
                                            </div>
                                        );
                                    });
                                })()}
                            </div>

                            {/* Extra Custom Supporting Documents Upload List */}
                            {extraCustomDocs.length > 0 && (
                                <div className="space-y-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center justify-between">
                                        <Label className="font-bold text-xs text-[#193153] flex items-center gap-1.5">
                                            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                            Additional Supporting Documents ({extraCustomDocs.length})
                                        </Label>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                        {extraCustomDocs.map((doc, idx) => (
                                            <div key={doc.id} className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-2 relative shadow-xs animate-in fade-in duration-200">
                                                <div className="flex justify-between items-center gap-2">
                                                    <Label className="text-xs font-bold text-[#193153]">Other Document #{idx + 1}</Label>
                                                    <button
                                                        type="button"
                                                        className="text-red-500 hover:text-red-700 p-1 text-[11px] font-bold flex items-center gap-1 cursor-pointer"
                                                        onClick={() => {
                                                            setExtraCustomDocs(prev => prev.filter(d => d.id !== doc.id));
                                                            if (doc.label) {
                                                                const newFiles = { ...customFiles };
                                                                delete newFiles[doc.label];
                                                                setCustomFiles(newFiles);
                                                            }
                                                        }}
                                                    >
                                                        <Trash2 className="w-3 h-3" /> Remove
                                                    </button>
                                                </div>
                                                <Input 
                                                    type="text"
                                                    placeholder="Document Name (e.g. Flight Logbook, Medical Cert, NBI Clearance)"
                                                    value={doc.label}
                                                    onChange={(e) => {
                                                        const newLabel = e.target.value;
                                                        setExtraCustomDocs(prev => prev.map(d => d.id === doc.id ? { ...d, label: newLabel } : d));
                                                        if (doc.file && newLabel) {
                                                            setCustomFiles(prev => ({ ...prev, [newLabel]: doc.file }));
                                                        }
                                                    }}
                                                    className="text-xs bg-white border-blue-200 focus:border-[#193153]"
                                                />
                                                <Input 
                                                    type="file"
                                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                    onChange={(e) => {
                                                        const file = e.target.files?.[0] || null;
                                                        setExtraCustomDocs(prev => prev.map(d => d.id === doc.id ? { ...d, file } : d));
                                                        if (doc.label) {
                                                            setCustomFiles(prev => ({ ...prev, [doc.label]: file }));
                                                        }
                                                    }}
                                                    className="bg-white text-xs h-9 border-blue-200 cursor-pointer"
                                                />
                                             </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* 8. Sworn Declaration / CS Form 212 Oath */}
                        <div className="space-y-3 bg-[#193153] text-white p-4.5 rounded-xl border border-slate-700 shadow-sm mt-6">
                            <div className="flex items-center gap-2 text-[#ffdd59] font-bold text-sm">
                                <ShieldCheck className="w-5 h-5 text-[#ffdd59]" />
                                <span>CS Form No. 212 (Revised 2026) - Sworn Declaration & Attestation</span>
                            </div>
                            <p className="text-xs text-slate-200 leading-relaxed italic">
                                "I declare under oath that the information provided in this Personal Data Sheet (CS Form No. 212) and all attached documents is true, correct, and complete to the best of my knowledge and belief. I acknowledge that any misrepresentation or deliberate omission of material facts may subject me to administrative, civil, or criminal liability under Philippine laws."
                            </p>
                            <div className="flex items-start space-x-2.5 pt-2 border-t border-slate-700/80">
                                <Checkbox
                                    id="sworn-oath-check"
                                    checked={swornOathAgreed}
                                    onCheckedChange={(checked) => setSwornOathAgreed(!!checked)}
                                    className="mt-0.5 border-slate-400 bg-white data-[state=checked]:bg-[#ffdd59] data-[state=checked]:text-[#193153]"
                                />
                                <Label htmlFor="sworn-oath-check" className="text-xs font-bold text-white cursor-pointer select-none leading-snug">
                                    I hereby certify and swear under oath that all details above are true, accurate, and snapshot from my official Personal Data Sheet (PDS). <span className="text-[#ffdd59]">*</span>
                                </Label>
                            </div>
                        </div>
                    </div>

                        <DialogFooter className="p-4 border-t shrink-0 bg-gray-50 flex items-center justify-end gap-3">
                            <Button type="button" variant="outline" onClick={() => setIsApplyOpen(false)} disabled={isSubmitting}>
                                Cancel
                            </Button>
                            <Button 
                                type="submit" 
                                className={`font-bold transition-all ${
                                    swornOathAgreed 
                                        ? 'bg-[#193153] hover:bg-[#ffdd59] hover:text-[#193153] text-white cursor-pointer' 
                                        : 'bg-gray-300 text-gray-500 cursor-not-allowed border-0'
                                }`} 
                                disabled={isSubmitting || !swornOathAgreed}
                            >
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

                    {appData ? (
                        <div className="overflow-y-auto flex-1 pr-2 my-2 space-y-6">
                                {/* 1. Status Tracker */}
                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                    <h4 className="font-bold text-[#193153] text-sm mb-3 flex items-center gap-1.5">
                                        <Clock className="w-4 h-4 text-blue-600" />
                                        Application Status: <span className="underline ml-1 font-extrabold text-[#193153]">{appData.status}</span>
                                    </h4>
                                
                                {/* Timeline Steps */}
                                <div className="flex items-center justify-between max-w-md mx-auto pt-2 pb-4">
                                    {[
                                        { label: 'Applied', active: true },
                                        { label: 'Review', active: ['Under Review', 'Interview Scheduled', 'Interview', 'Hired', 'Rejected'].includes(appData.status) },
                                        { label: 'Interview', active: ['Interview Scheduled', 'Interview', 'Hired', 'Rejected'].includes(appData.status) },
                                        { label: 'Result', active: ['Hired', 'Rejected'].includes(appData.status), isEnd: true }
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

                            {appData.status === 'Rejected' && (
                                <div className="bg-red-50 border border-red-200 text-red-950 p-4 rounded-lg flex flex-col gap-1.5 shadow-sm">
                                    <span className="font-bold text-sm flex items-center gap-1.5 text-red-700">
                                        ❌ Rejection Details
                                    </span>
                                    <p className="text-xs font-semibold leading-relaxed">
                                        Feedback from HR: <span className="font-normal text-red-800">{appData.dynamic_responses?.rejection_reason || 'Minimum education or experience requirements not met.'}</span>
                                    </p>
                                </div>
                            )}

                            {/* 2. Scheduled Interview Details (If interview is loaded) */}
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
                                            <span className="font-bold text-white mt-0.5">{formatTime(interview.time)}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-blue-200 text-xs font-medium">Venue / Platform</span>
                                            <span className="font-bold text-white mt-0.5">{interview.venue}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-blue-200 text-xs font-medium">Interview Panel Members</span>
                                            <span className="font-bold text-white mt-0.5">{interview.panelMembers || interview.panel_members || 'HR Committee Panel'}</span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* 3. Academic & Professional Summary */}
                            <div className="space-y-4">
                                <h4 className="font-bold text-[#193153] text-sm border-b pb-1">Professional & Educational Credentials</h4>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                                    <div className="flex flex-col bg-gray-50 p-2.5 rounded border border-gray-100">
                                        <span className="text-gray-500 font-medium">Highest Education Level</span>
                                        <span className="font-bold text-gray-900 mt-1">
                                            {(() => {
                                                const rawEd = appData.dynamic_responses?.educationLevel || appData.education || '';
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
                                        <span className="text-gray-500 font-medium">Degree / Course Title</span>
                                        <span className="font-bold text-gray-900 mt-1">{appData.dynamic_responses?.degreeCourse || 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col bg-gray-50 p-2.5 rounded border border-gray-100">
                                        <span className="text-gray-500 font-medium">School / University</span>
                                        <span className="font-bold text-gray-900 mt-1">{appData.dynamic_responses?.schoolName || 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col bg-gray-50 p-2.5 rounded border border-gray-100">
                                        <span className="text-gray-500 font-medium">Years of Experience</span>
                                        <span className="font-bold text-gray-900 mt-1">
                                            {appData.dynamic_responses?.yearsOfExperience || 0} years
                                        </span>
                                    </div>
                                    <div className="flex flex-col bg-gray-50 p-2.5 rounded border border-gray-100">
                                        <span className="text-gray-500 font-medium">Recent Position Title</span>
                                        <span className="font-bold text-gray-900 mt-1">{appData.dynamic_responses?.recentPositionTitle || 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col bg-gray-50 p-2.5 rounded border border-gray-100">
                                        <span className="text-gray-500 font-medium">Recent Employer / Agency</span>
                                        <span className="font-bold text-gray-900 mt-1">{appData.dynamic_responses?.recentEmployer || 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col bg-gray-50 p-2.5 rounded border border-gray-100">
                                        <span className="text-gray-500 font-medium">Training Hours Completed</span>
                                        <span className="font-bold text-gray-900 mt-1">
                                            {appData.dynamic_responses?.trainingHours || 0} hours
                                        </span>
                                    </div>
                                    <div className="flex flex-col bg-gray-50 p-2.5 rounded border border-gray-100">
                                        <span className="text-gray-500 font-medium">License / Registration No.</span>
                                        <span className="font-bold text-gray-900 mt-1">{appData.dynamic_responses?.licenseNo || 'N/A'}</span>
                                    </div>
                                    <div className="flex flex-col bg-gray-50 p-2.5 rounded border border-gray-100">
                                        <span className="text-gray-500 font-medium">Open to other positions?</span>
                                        <span className="font-bold text-gray-900 mt-1 capitalize">
                                            {appData.dynamic_responses?.openToOthers || 'Yes'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* 4. Personal Info Submitted */}
                            {(() => {
                                const nameParts = (appData?.applicant_name || appData?.applicant?.name || '').trim().split(/\s+/);
                                const parsedFirstName = appData.dynamic_responses?.firstName || nameParts[0] || 'N/A';
                                const parsedLastName = appData.dynamic_responses?.lastName || (nameParts.length > 1 ? nameParts[nameParts.length - 1] : 'N/A');
                                const parsedMiddleName = appData.dynamic_responses?.middleName || (nameParts.length > 2 ? nameParts.slice(1, -1).join(' ') : 'N/A');
                                const parsedContact = appData.dynamic_responses?.contactNumber || appData.phone_number || 'N/A';

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
                                                    {appData.dynamic_responses?.age ? `${appData.dynamic_responses.age} yrs old` : 'N/A'} / {appData.dynamic_responses?.sex || 'N/A'}
                                                </span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-500">Civil Status</span>
                                                <span className="font-semibold text-gray-900 mt-0.5 capitalize">{appData.dynamic_responses?.civilStatus || 'N/A'}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-500">Religion</span>
                                                <span className="font-semibold text-gray-900 mt-0.5">{appData.dynamic_responses?.religion || 'N/A'}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-500">Indigenous Group Member (IP)?</span>
                                                <span className="font-semibold text-gray-900 mt-0.5">{appData.dynamic_responses?.isIP || 'No'}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-500">Person with Disability (PWD)?</span>
                                                <span className="font-semibold text-gray-900 mt-0.5">{appData.dynamic_responses?.isPWD || 'No'}</span>
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-gray-500">Contact Number</span>
                                                <span className="font-semibold text-gray-900 mt-0.5">{parsedContact}</span>
                                            </div>
                                            <div className="flex flex-col col-span-2 md:col-span-3">
                                                <span className="text-gray-500">Residential Address</span>
                                                <span className="font-semibold text-gray-900 mt-0.5 leading-relaxed">{appData.dynamic_responses?.address || 'N/A'}</span>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* 5. Eligibilities */}
                            {appData.dynamic_responses?.eligibilities && appData.dynamic_responses.eligibilities.length > 0 && (
                                <div className="space-y-3">
                                    <h4 className="font-bold text-[#193153] text-sm border-b pb-1">Eligibilities & Licenses</h4>
                                    <ul className="list-disc list-inside space-y-1 text-xs text-gray-700 pl-1">
                                        {appData.dynamic_responses.eligibilities.map((elig: string, index: number) => (
                                            <li key={index} className="font-medium text-gray-800">{elig}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* 6. Submitted Application Documents */}
                            <div className="space-y-3 pt-2">
                                <h4 className="font-bold text-[#193153] text-sm border-b pb-1 flex items-center gap-1.5">
                                    📁 Submitted Requirements & Attachments
                                </h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                                    {(() => {
                                        const defaultCoreDocs = [
                                            "Letter of Intent",
                                            "Personal Data Sheet (CS Form No. 212, Rev. 2026)",
                                            "Work Experience Sheet (WES)",
                                            "Certificate of Eligibility",
                                            "Transcript of Records (TOR)",
                                            "Relevant Training Certificates",
                                            "Performance Rating (IPCR/OPCR)"
                                        ];

                                        // Get job requirements
                                        const reqList = safeCustomFiles.length > 0
                                            ? safeCustomFiles.map((req: any) => typeof req === 'string' ? req : req.label)
                                            : defaultCoreDocs;

                                        // Get submitted custom files
                                        const customResponses: Record<string, any> = appData.custom_file_responses 
                                            || appData.dynamic_responses?.custom_files 
                                            || customFiles 
                                            || {};

                                        // Get submitted to-follow docs
                                        const toFollowList: string[] = Array.isArray(appData.to_follow_docs)
                                            ? appData.to_follow_docs
                                            : (Array.isArray(appData.toFollowDocs)
                                                ? appData.toFollowDocs
                                                : (appData.dynamic_responses?.to_follow_docs || Object.keys(toFollowDocs).filter(k => toFollowDocs[k])));

                                        // Gather legacy documents if any
                                        const rawDocs = appData.dynamic_responses?.documents || appData.documents || [];
                                        let legacyDocsMap: Record<string, string> = {};
                                        if (Array.isArray(rawDocs)) {
                                            rawDocs.forEach((d: any) => {
                                                if (typeof d === 'string') legacyDocsMap[d] = d;
                                                else if (d?.name && d?.fileName) legacyDocsMap[d.name] = d.fileName;
                                            });
                                        } else if (rawDocs && typeof rawDocs === 'object') {
                                            legacyDocsMap = rawDocs;
                                        }

                                        const renderedKeys = new Set<string>();

                                        return (
                                            <>
                                                {reqList.map((reqLabel: string, idx: number) => {
                                                    renderedKeys.add(reqLabel);

                                                    // Check if uploaded
                                                    const fileObj = customResponses[reqLabel] || legacyDocsMap[reqLabel];
                                                    const isToFollow = toFollowList.includes(reqLabel) || !!toFollowDocs[reqLabel];
                                                    const isUploaded = !!fileObj || (!!attachedDocs[reqLabel] && !isToFollow);

                                                    let fileDisplay = '';
                                                    let fileUrl: string | null = null;
                                                    if (fileObj) {
                                                        if (typeof fileObj === 'string') {
                                                            fileDisplay = fileObj.split('/').pop() || fileObj;
                                                            fileUrl = fileObj.startsWith('http') || fileObj.startsWith('/storage')
                                                                ? fileObj
                                                                : `/storage/${fileObj}`;
                                                        } else if (fileObj?.name) {
                                                            fileDisplay = fileObj.name;
                                                        } else {
                                                            fileDisplay = 'Uploaded File';
                                                        }
                                                    } else if (isUploaded) {
                                                        fileDisplay = 'Attached Document';
                                                    }

                                                    return (
                                                        <div key={idx} className="flex items-center justify-between p-2.5 bg-gray-50 border border-gray-200 rounded-md hover:border-blue-200 transition-colors">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <span className="text-blue-600 font-bold text-xs">📄</span>
                                                                <div className="truncate">
                                                                    <p className="font-semibold text-gray-800 text-[11px] truncate">{reqLabel}</p>
                                                                    {fileUrl ? (
                                                                        <a
                                                                            href={fileUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-[10px] text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1 truncate"
                                                                        >
                                                                            <span>{fileDisplay}</span>
                                                                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                                                        </a>
                                                                    ) : (
                                                                        <p className="text-[10px] text-gray-400 truncate">
                                                                            {isUploaded ? (fileDisplay || 'Attached Document') : (isToFollow ? 'Marked as "To Follow"' : 'Pending')}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            {isUploaded ? (
                                                                <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] shrink-0 font-semibold">
                                                                    Uploaded & Received
                                                                </Badge>
                                                            ) : isToFollow ? (
                                                                <div className="flex items-center gap-1.5 shrink-0">
                                                                    <Badge className="bg-amber-100 text-amber-800 border-amber-200 text-[10px] font-semibold">
                                                                        To Follow
                                                                    </Badge>
                                                                    <label className="cursor-pointer">
                                                                        <input
                                                                            type="file"
                                                                            className="hidden"
                                                                            accept=".pdf,.jpg,.jpeg,.png"
                                                                            disabled={uploadingDocLabel === reqLabel}
                                                                            onChange={(e) => {
                                                                                const selectedFile = e.target.files?.[0];
                                                                                if (selectedFile) {
                                                                                    handleUploadToFollowDocument(reqLabel, selectedFile);
                                                                                    e.target.value = '';
                                                                                }
                                                                            }}
                                                                        />
                                                                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm transition-colors ${
                                                                            uploadingDocLabel === reqLabel 
                                                                                ? 'bg-gray-400 cursor-not-allowed' 
                                                                                : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
                                                                        }`}>
                                                                            {uploadingDocLabel === reqLabel ? (
                                                                                <span>Uploading...</span>
                                                                            ) : (
                                                                                <>
                                                                                    <Upload className="w-2.5 h-2.5 mr-1" />
                                                                                    Upload Now
                                                                                </>
                                                                            )}
                                                                        </span>
                                                                    </label>
                                                                </div>
                                                            ) : (
                                                                <Badge className="bg-gray-100 text-gray-600 border-gray-200 text-[10px] shrink-0 font-semibold">
                                                                    Pending
                                                                </Badge>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                {/* Extra Supporting Documents Uploaded */}
                                                {Object.keys(customResponses).filter(k => !renderedKeys.has(k)).map((extraKey: string, idx: number) => {
                                                    const fileObj = customResponses[extraKey];
                                                    const fileDisplay = typeof fileObj === 'string' ? fileObj.split('/').pop() : (fileObj?.name || 'Attached File');
                                                    const fileUrl = typeof fileObj === 'string'
                                                        ? (fileObj.startsWith('http') || fileObj.startsWith('/storage') ? fileObj : `/storage/${fileObj}`)
                                                        : null;
                                                    return (
                                                        <div key={`extra-${idx}`} className="flex items-center justify-between p-2.5 bg-blue-50/60 border border-blue-200 rounded-md hover:border-blue-300 transition-colors">
                                                            <div className="flex items-center gap-2 overflow-hidden">
                                                                <span className="text-blue-600 font-bold text-xs">📎</span>
                                                                <div className="truncate">
                                                                    <p className="font-semibold text-[#193153] text-[11px] truncate">{extraKey} <span className="text-[10px] text-blue-600 font-normal">(Extra Doc)</span></p>
                                                                    {fileUrl ? (
                                                                        <a
                                                                            href={fileUrl}
                                                                            target="_blank"
                                                                            rel="noopener noreferrer"
                                                                            className="text-[10px] text-blue-600 hover:text-blue-800 font-medium hover:underline flex items-center gap-1 truncate"
                                                                        >
                                                                            <span>{fileDisplay}</span>
                                                                            <ExternalLink className="w-2.5 h-2.5 shrink-0" />
                                                                        </a>
                                                                    ) : (
                                                                        <p className="text-[10px] text-gray-500 truncate">{fileDisplay}</p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                            <Badge className="bg-emerald-100 text-emerald-800 border-emerald-200 text-[10px] shrink-0 font-semibold">
                                                                Uploaded & Received
                                                            </Badge>
                                                        </div>
                                                    );
                                                })}
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>
                        </div>
                    ) : null}

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
