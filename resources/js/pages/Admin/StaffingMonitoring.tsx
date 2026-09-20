import { Link, router } from '@inertiajs/react';
import {
    Users, Briefcase, FileText, Award, LogOut, Shield,
    Search, Filter, MapPin, Plus, ArrowRight, CheckCircle,
    XCircle, AlertCircle, Building2, Layout, Trash2, Calendar
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { SALARY_GRADE_MAP } from '@/data/mockData';
import AdminLayout from '@/layouts/AdminLayout';

export default function StaffingMonitoring({ auth, staffingData: serverStaffing }: { auth: any, staffingData: any[] }) {
    const admin = auth?.user || { name: 'Admin' };
    const [staffingData, setStaffingData] = useState(serverStaffing || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    
    // Add New Position Modal State with Full Job Specs
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [formState, setFormState] = useState({
        office: '',
        position: '',
        plantilla_item: '',
        sg: 19,
        customSalary: '',
        employment_type: 'Full-time',
        location: 'Villamor Air Base, Pasay City',
        status: 'Unfilled',
        qs_education: "Bachelor's Degree relevant to the job",
        qs_experience: "Two (2) years of Relevant Experience",
        qs_eligibility: "Career Service Professional/ Second level eligibility",
        qs_training: "Eight (8) Hours of Relevant Training",
        description: '',
        competency: '',
        responsibilities: '',
        deadline: '',
        custom_file_requirements: [] as { id: number; label: string }[],
    });

    const [newCustomRequirement, setNewCustomRequirement] = useState('');

    // Custom Delete & Clear Dialog state
    const [deleteItemTarget, setDeleteItemTarget] = useState<any | null>(null);
    const [isClearAllDialogOpen, setIsClearAllDialogOpen] = useState(false);

    React.useEffect(() => {
        if (serverStaffing) {
            setStaffingData(serverStaffing);
        }
    }, [serverStaffing]);

    const handleAddCustomAttachment = () => {
        if (!newCustomRequirement.trim()) return;
        setFormState((prev) => ({
            ...prev,
            custom_file_requirements: [
                ...prev.custom_file_requirements,
                { id: Date.now(), label: newCustomRequirement.trim() },
            ],
        }));
        setNewCustomRequirement('');
    };

    const handleRemoveCustomAttachment = (id: number) => {
        setFormState((prev) => ({
            ...prev,
            custom_file_requirements: prev.custom_file_requirements.filter((r) => r.id !== id),
        }));
    };

    const handleAddPositionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formState.office.trim() || !formState.position.trim()) {
            toast.error('Please fill in required fields (Office/Department and Position Title).');
            return;
        }

        router.post('/admin/staffing', {
            office: formState.office.trim(),
            position: formState.position.trim(),
            plantilla_item: formState.plantilla_item.trim(),
            sg: Number(formState.sg) || 19,
            status: formState.status,
            employment_type: formState.employment_type,
            location: formState.location,
            qs_education: formState.qs_education,
            qs_experience: formState.qs_experience,
            qs_eligibility: formState.qs_eligibility,
            qs_training: formState.qs_training,
            description: formState.description,
            competency: formState.competency,
            responsibilities: formState.responsibilities,
            deadline: formState.deadline || null,
            custom_file_requirements: formState.custom_file_requirements,
            campus: formState.location
        }, {
            onSuccess: () => {
                toast.success(`Position "${formState.position}" saved successfully!`);
                setIsAddModalOpen(false);
                setFormState({
                    office: '',
                    position: '',
                    plantilla_item: '',
                    sg: 19,
                    customSalary: '',
                    employment_type: 'Full-time',
                    location: 'Villamor Air Base, Pasay City',
                    status: 'Unfilled',
                    qs_education: "Bachelor's Degree relevant to the job",
                    qs_experience: "Two (2) years of Relevant Experience",
                    qs_eligibility: "Career Service Professional/ Second level eligibility",
                    qs_training: "Eight (8) Hours of Relevant Training",
                    description: '',
                    competency: '',
                    responsibilities: '',
                    deadline: '',
                    custom_file_requirements: [],
                });
            },
            onError: () => {
                toast.error('Failed to save position.');
            }
        });
    };

    const confirmDeleteSingle = () => {
        if (!deleteItemTarget) return;
        router.delete(`/admin/staffing/${deleteItemTarget.id}`, {
            onSuccess: () => {
                toast.success(`Position "${deleteItemTarget.position}" deleted.`);
                setDeleteItemTarget(null);
            },
            onError: () => {
                toast.error('Failed to delete position.');
                setDeleteItemTarget(null);
            }
        });
    };

    const confirmClearAll = () => {
        router.post('/admin/staffing/clear-all', {}, {
            onSuccess: () => {
                setStaffingData([]);
                toast.success('All staffing positions cleared successfully!');
                setIsClearAllDialogOpen(false);
            },
            onError: () => {
                toast.error('Failed to clear positions.');
                setIsClearAllDialogOpen(false);
            }
        });
    };

    const filteredData = staffingData.filter(item => {
        const matchesSearch = item.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.office.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreateJob = (item: any) => {
        toast.info(`Posting job vacancy for ${item.position}...`);
        router.post(`/admin/staffing/${item.id}/post-job`, {}, {
            onSuccess: () => {
                toast.success(`Job vacancy for "${item.position}" posted automatically!`);
            },
            onError: () => {
                toast.error('Failed to post job vacancy.');
            }
        });
    };

    const stats = {
        total: staffingData.length,
        filled: staffingData.filter(i => i.status === 'Filled').length,
        unfilled: staffingData.filter(i => i.status === 'Unfilled').length,
        onProcess: staffingData.filter(i => i.status === 'On-process').length,
    };

    return (
        <AdminLayout user={admin}>
            <div className="space-y-6">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Staffing Monitoring</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            Track and manage staffing requirements and plantilla inventory for NAAP.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        {staffingData.length > 0 && (
                            <Button
                                variant="outline"
                                className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 font-medium shadow-sm"
                                onClick={() => setIsClearAllDialogOpen(true)}
                            >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Clear All Positions
                            </Button>
                        )}
                        <Button
                            className="bg-[#193153] hover:bg-[#193153]/90 text-white font-medium shadow-sm"
                            onClick={() => setIsAddModalOpen(true)}
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add New Position
                        </Button>
                    </div>
                </div>

                {/* Stat Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <Card className="shadow-sm border-l-4 border-l-blue-600">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Total Positions</p>
                                    <h3 className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</h3>
                                </div>
                                <div className="p-2.5 bg-blue-50 rounded-xl">
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-l-4 border-l-green-600">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Filled</p>
                                    <h3 className="text-2xl font-bold text-green-700 mt-1">{stats.filled}</h3>
                                </div>
                                <div className="p-2.5 bg-green-50 rounded-xl">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-l-4 border-l-red-600">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">Unfilled</p>
                                    <h3 className="text-2xl font-bold text-red-700 mt-1">{stats.unfilled}</h3>
                                </div>
                                <div className="p-2.5 bg-red-50 rounded-xl">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-l-4 border-l-yellow-600">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs uppercase font-semibold text-gray-500 tracking-wider">On-Process</p>
                                    <h3 className="text-2xl font-bold text-yellow-700 mt-1">{stats.onProcess}</h3>
                                </div>
                                <div className="p-2.5 bg-yellow-50 rounded-xl">
                                    <AlertCircle className="w-5 h-5 text-yellow-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters and Table */}
                <Card className="shadow-md border-0 overflow-hidden">
                    <CardHeader className="bg-white border-b px-6 py-4">
                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Search position or office..."
                                    className="pl-10"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                <div className="flex items-center gap-2">
                                    <Filter className="w-4 h-4 text-gray-500" />
                                    <select
                                        className="text-sm border-gray-200 rounded-md py-1.5 focus:ring-blue-500"
                                        value={statusFilter}
                                        onChange={(e) => setStatusFilter(e.target.value)}
                                    >
                                        <option value="All">All Status</option>
                                        <option value="Filled">Filled</option>
                                        <option value="Unfilled">Unfilled</option>
                                        <option value="On-process">On-process</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider">
                                    <tr>
                                        <th className="px-6 py-4 font-semibold border-b">Office</th>
                                        <th className="px-6 py-4 font-semibold border-b">Position</th>
                                        <th className="px-6 py-4 font-semibold border-b">SG</th>
                                        <th className="px-6 py-4 font-semibold border-b">Status</th>
                                        <th className="px-6 py-4 font-semibold border-b text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 bg-white">
                                    {filteredData.length > 0 ? (
                                        filteredData.map((item) => (
                                            <tr key={item.id} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-4 text-sm font-medium text-gray-700">{item.office}</td>
                                                <td className="px-6 py-4 text-sm text-gray-800 font-semibold">{item.position}</td>
                                                <td className="px-6 py-4 text-sm text-gray-600">SG {item.sg}</td>
                                                <td className="px-6 py-4">
                                                    <Badge
                                                        className={`text-[10px] ${item.status === 'Filled' ? 'bg-green-100 text-green-700 hover:bg-green-100/80' :
                                                            item.status === 'Unfilled' ? 'bg-red-100 text-red-700 hover:bg-red-100/80' :
                                                                'bg-yellow-100 text-yellow-700 hover:bg-yellow-100/80'
                                                            }`}
                                                        variant="outline"
                                                    >
                                                        {item.status}
                                                    </Badge>
                                                </td>
                                                <td className="px-6 py-4 text-right flex items-center justify-end gap-2">
                                                    {item.status === 'Unfilled' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50 font-medium"
                                                            onClick={() => handleCreateJob(item)}
                                                        >
                                                            <Plus className="w-3 h-3 mr-1" /> Post Job
                                                        </Button>
                                                    )}
                                                    <Button
                                                        size="sm"
                                                        variant="ghost"
                                                        className="text-xs text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5"
                                                        onClick={() => setDeleteItemTarget(item)}
                                                        title="Delete Position"
                                                    >
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    ) : (
                                        <tr>
                                            <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                                No staffing items found matching your filters.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Add New Position Modal (Full Job Specifications Form) */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
                            <Building2 className="h-5 w-5 text-blue-600" />
                            Add New Position
                        </DialogTitle>
                        <DialogDescription>
                            Enter full position details and qualification standards to save in NAAP Staffing Inventory.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddPositionSubmit} className="space-y-5 py-2">
                        {/* Section 1: Position Details */}
                        <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl space-y-4">
                            <h4 className="text-xs uppercase font-bold text-[#193153] tracking-wider flex items-center gap-2">
                                <Briefcase className="h-4 w-4 text-blue-600" />
                                1. Position Details
                            </h4>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="position" className="text-xs font-semibold text-gray-700">Position Title *</Label>
                                    <Input
                                        id="position"
                                        value={formState.position}
                                        onChange={(e) => setFormState({ ...formState, position: e.target.value })}
                                        placeholder="e.g. Information Technology Officer I"
                                        className="mt-1 text-sm bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="plantilla_item" className="text-xs font-semibold text-gray-700">Item No.</Label>
                                    <Input
                                        id="plantilla_item"
                                        value={formState.plantilla_item}
                                        onChange={(e) => setFormState({ ...formState, plantilla_item: e.target.value })}
                                        placeholder="e.g. PSCAB-ITO1-36-2023"
                                        className="mt-1 text-sm bg-white"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="office" className="text-xs font-semibold text-gray-700">Place of Assignment / Department *</Label>
                                    <Input
                                        id="office"
                                        value={formState.office}
                                        onChange={(e) => setFormState({ ...formState, office: e.target.value })}
                                        placeholder="e.g. ICT UNIT, VAB CAMPUS - PASAY CITY"
                                        className="mt-1 text-sm bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="sg" className="text-xs font-semibold text-gray-700">Salary / Job / Pay Grade *</Label>
                                    <div className="flex items-center space-x-2 mt-1">
                                        <Select
                                            value={String(formState.sg)}
                                            onValueChange={(value) => {
                                                const sg = Number(value);
                                                const defaultAmount = SALARY_GRADE_MAP[sg] ? SALARY_GRADE_MAP[sg].toLocaleString() : '';
                                                setFormState({ ...formState, sg, customSalary: defaultAmount });
                                            }}
                                        >
                                            <SelectTrigger id="sg" className="w-[120px] shrink-0 bg-white">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {Object.keys(SALARY_GRADE_MAP).map((grade) => (
                                                    <SelectItem key={grade} value={grade}>
                                                        SG {grade}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="relative flex-1">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-500">₱</span>
                                            <Input
                                                type="text"
                                                className="pl-7 pr-12 text-xs font-bold text-blue-900 bg-white border-blue-200 focus:border-blue-500"
                                                value={formState.customSalary !== undefined && formState.customSalary !== ''
                                                    ? formState.customSalary
                                                    : (SALARY_GRADE_MAP[formState.sg] ? SALARY_GRADE_MAP[formState.sg].toLocaleString() : '')}
                                                onChange={(e) => setFormState({ ...formState, customSalary: e.target.value })}
                                                placeholder="Monthly Salary"
                                            />
                                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-medium text-gray-400">/mo</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                <div>
                                    <Label htmlFor="employment_type" className="text-xs font-semibold text-gray-700">Employment Type</Label>
                                    <Select value={formState.employment_type} onValueChange={(value) => setFormState({ ...formState, employment_type: value })}>
                                        <SelectTrigger className="mt-1 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Full-time">Full-time</SelectItem>
                                            <SelectItem value="Contract of Service (COS)">Contract of Service (COS)</SelectItem>
                                            <SelectItem value="Job Order (JO)">Job Order (JO)</SelectItem>
                                            <SelectItem value="Part-time">Part-time</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div>
                                    <Label htmlFor="location" className="text-xs font-semibold text-gray-700">Location / Campus</Label>
                                    <Input
                                        id="location"
                                        value={formState.location}
                                        onChange={(e) => setFormState({ ...formState, location: e.target.value })}
                                        placeholder="e.g. Villamor Air Base, Pasay City"
                                        className="mt-1 text-sm bg-white"
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="status" className="text-xs font-semibold text-gray-700">Initial Status</Label>
                                    <Select value={formState.status} onValueChange={(value) => setFormState({ ...formState, status: value })}>
                                        <SelectTrigger className="mt-1 bg-white">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Unfilled">Unfilled</SelectItem>
                                            <SelectItem value="Filled">Filled</SelectItem>
                                            <SelectItem value="On-process">On-process</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        {/* Section 2: Qualification Standards */}
                        <div className="bg-blue-50/60 border border-blue-200 p-4 rounded-xl space-y-4">
                            <div className="flex items-center justify-between">
                                <h4 className="text-xs uppercase font-bold text-blue-900 tracking-wider flex items-center gap-2">
                                    <Shield className="h-4 w-4 text-blue-600" />
                                    2. Qualification Standards
                                </h4>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="qs_education" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                        🎓 Education Requirement *
                                    </Label>
                                    <Input
                                        id="qs_education"
                                        value={formState.qs_education}
                                        onChange={(e) => setFormState({ ...formState, qs_education: e.target.value })}
                                        placeholder="e.g. Bachelor's Degree relevant to the job"
                                        className="mt-1 text-sm bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="qs_experience" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                        💼 Work Experience Requirement *
                                    </Label>
                                    <Input
                                        id="qs_experience"
                                        value={formState.qs_experience}
                                        onChange={(e) => setFormState({ ...formState, qs_experience: e.target.value })}
                                        placeholder="e.g. Two (2) years of Relevant Experience"
                                        className="mt-1 text-sm bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="qs_eligibility" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                        📜 Eligibility / License Requirement *
                                    </Label>
                                    <Input
                                        id="qs_eligibility"
                                        value={formState.qs_eligibility}
                                        onChange={(e) => setFormState({ ...formState, qs_eligibility: e.target.value })}
                                        placeholder="e.g. Career Service Professional/ Second level eligibility"
                                        className="mt-1 text-sm bg-white"
                                        required
                                    />
                                </div>
                                <div>
                                    <Label htmlFor="qs_training" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                        🏋️ Training & L&D Requirement *
                                    </Label>
                                    <Input
                                        id="qs_training"
                                        value={formState.qs_training}
                                        onChange={(e) => setFormState({ ...formState, qs_training: e.target.value })}
                                        placeholder="e.g. Eight (8) Hours of Relevant Training"
                                        className="mt-1 text-sm bg-white"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Job Description */}
                        <div>
                            <Label htmlFor="description" className="text-xs font-semibold text-gray-700">Job Description *</Label>
                            <Textarea
                                id="description"
                                rows={3}
                                value={formState.description}
                                onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                placeholder="Brief description of the position..."
                                className="mt-1 text-sm bg-white"
                            />
                        </div>

                        {/* Competencies */}
                        <div>
                            <Label htmlFor="competency" className="text-xs font-semibold text-gray-700">Competencies / Core Skills</Label>
                            <Textarea
                                id="competency"
                                rows={2}
                                value={formState.competency}
                                onChange={(e) => setFormState({ ...formState, competency: e.target.value })}
                                placeholder="e.g. Accountability, Customer Service Excellence, Strategic Thinking, Leadership skills"
                                className="mt-1 text-sm bg-white"
                            />
                        </div>

                        {/* Key Responsibilities */}
                        <div>
                            <Label htmlFor="responsibilities" className="text-xs font-semibold text-gray-700">Key Responsibilities (one per line) *</Label>
                            <Textarea
                                id="responsibilities"
                                rows={3}
                                value={formState.responsibilities}
                                onChange={(e) => setFormState({ ...formState, responsibilities: e.target.value })}
                                placeholder="e.g., Manage campus network infrastructure&#10;Implement cybersecurity safeguards"
                                className="mt-1 text-sm bg-white"
                            />
                        </div>

                        {/* Required Document Attachments */}
                        <div className="space-y-3 pt-1">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-semibold text-gray-700">Required Document Attachments</Label>
                                <div className="flex items-center gap-2">
                                    <Input
                                        type="text"
                                        placeholder="Add Custom Document (e.g., Flying Logbook)"
                                        value={newCustomRequirement}
                                        onChange={(e) => setNewCustomRequirement(e.target.value)}
                                        className="h-8 text-xs w-64 bg-white"
                                    />
                                    <Button
                                        type="button"
                                        size="sm"
                                        variant="outline"
                                        onClick={handleAddCustomAttachment}
                                        className="h-8 text-xs bg-white text-blue-700 border-blue-200 hover:bg-blue-50"
                                    >
                                        <Plus className="h-3.5 w-3.5 mr-1" /> Add
                                    </Button>
                                </div>
                            </div>

                            {formState.custom_file_requirements.length > 0 && (
                                <div className="flex flex-wrap gap-2 pt-1">
                                    {formState.custom_file_requirements.map((req) => (
                                        <span
                                            key={req.id}
                                            className="inline-flex items-center gap-1.5 bg-blue-50 border border-blue-200 text-blue-800 px-2.5 py-1 rounded-md text-xs font-medium"
                                        >
                                            📄 {req.label}
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCustomAttachment(req.id)}
                                                className="hover:text-red-600 font-bold ml-1"
                                            >
                                                ×
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}

                            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-600">
                                📑 Standard attachments (PDS Form 212, TOR, Eligibility Certificate, PRC/CAAP License) are automatically requested from applicants.
                            </div>
                        </div>

                        {/* Application Closing Date */}
                        <div className="pt-1">
                            <Label htmlFor="deadline" className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                                <Calendar className="h-3.5 w-3.5 text-blue-600" />
                                Application Closing Date / Deadline *
                            </Label>
                            <Input
                                id="deadline"
                                type="date"
                                value={formState.deadline}
                                onChange={(e) => setFormState({ ...formState, deadline: e.target.value })}
                                className="mt-1 text-sm bg-white sm:w-64"
                            />
                        </div>

                        <DialogFooter className="pt-4 border-t mt-6">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setIsAddModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="bg-[#193153] hover:bg-[#193153]/90 text-white font-medium"
                            >
                                Save Position
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Delete Single Item Modal */}
            <Dialog open={!!deleteItemTarget} onOpenChange={(open) => !open && setDeleteItemTarget(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-2">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-center text-lg font-bold text-gray-900">
                            Delete Staffing Position?
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm text-gray-500 mt-1">
                            Are you sure you want to delete <span className="font-semibold text-gray-800">"{deleteItemTarget?.position}"</span> ({deleteItemTarget?.office})? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setDeleteItemTarget(null)}
                            className="w-28"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white font-medium w-36 shadow-sm"
                            onClick={confirmDeleteSingle}
                        >
                            Delete Position
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Clear All Items Modal */}
            <Dialog open={isClearAllDialogOpen} onOpenChange={setIsClearAllDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-2">
                            <AlertCircle className="h-6 w-6 text-red-600" />
                        </div>
                        <DialogTitle className="text-center text-lg font-bold text-gray-900">
                            Clear All Staffing Positions?
                        </DialogTitle>
                        <DialogDescription className="text-center text-sm text-gray-500 mt-1">
                            Are you sure you want to wipe <span className="font-semibold text-red-600">ALL {staffingData.length} positions</span> from the database? This action will reset your staffing table to zero.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="sm:justify-center gap-2 pt-4">
                        <Button
                            variant="outline"
                            onClick={() => setIsClearAllDialogOpen(false)}
                            className="w-28"
                        >
                            Cancel
                        </Button>
                        <Button
                            className="bg-red-600 hover:bg-red-700 text-white font-medium w-36 shadow-sm"
                            onClick={confirmClearAll}
                        >
                            Yes, Clear All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
