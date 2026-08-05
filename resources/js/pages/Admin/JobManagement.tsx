import { Link, router } from '@inertiajs/react';
import { 
  Shield, LogOut, Plus, Edit, Archive, Eye, Users, Briefcase, Layout, Search,
  Folder, FileText, ChevronRight, Grid, List, Home, DollarSign, Building2, CheckCircle2, Clock, Calendar, Table as TableIcon,
  FolderPlus, Trash2
} from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { mockJobs, getJobs, SALARY_GRADE_MAP } from '@/data/mockData';
import AdminLayout from '@/layouts/AdminLayout';

export default function JobManagement({ auth, jobs: serverJobs, dbDepartments: serverDbDepartments, campuses }: { auth: any, jobs: any[], dbDepartments?: any[], campuses?: any[] }) {
  const admin = auth?.user || { name: 'Admin' };
  const [jobs, setJobs] = useState<any[]>(serverJobs || []);
  const [dbDepartments, setDbDepartments] = useState<any[]>(serverDbDepartments || []);
  const [deleteConfirmJob, setDeleteConfirmJob] = useState<{ id: string; title: string } | null>(null);

  // Department Folder Management States
  const [isCreatingDept, setIsCreatingDept] = useState(false);
  const [newDeptName, setNewDeptName] = useState('');
  const [deleteConfirmDept, setDeleteConfirmDept] = useState<any | null>(null);

  // Explorer View States
  const [viewMode, setViewMode] = useState<'explorer' | 'table'>('explorer');
  const [explorerLayout, setExplorerLayout] = useState<'grid' | 'details'>('grid');
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>(null);
  const [selectedJob, setSelectedJob] = useState<any | null>(null);

  const isJobExpired = (job: any) => {
    return !!(job.deadline && new Date(job.deadline).setHours(23, 59, 59, 999) < new Date().getTime());
  };

  // Sync with server data when it changes
  useEffect(() => {
    if (serverJobs) {
      setJobs(serverJobs);
    }
  }, [serverJobs]);

  useEffect(() => {
    if (serverDbDepartments) {
      setDbDepartments(serverDbDepartments);
    }
  }, [serverDbDepartments]);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('create') === 'true' || params.get('createFromStaffing') === 'true') {
      toast.info("Opening job creation dialog...");
      if (params.get('createFromStaffing') === 'true') {
        const title = params.get('title') || '';
        const dept = params.get('department') || '';
        const campus = params.get('campus') || '';

        setNewJob(prev => ({
          ...prev,
          title,
          department: dept,
          staffing_id: params.get('staffingId'),
          location: 'Villamor Air Base, Pasay City'
        }));
      }
      setIsCreating(true);
      // Clean up URL without reload
      window.history.replaceState({}, '', window.location.pathname);
    }

    const editId = params.get('edit');
    if (editId) {
      const allJobs = getJobs();
      const jobToEdit = allJobs.find((j: any) => String(j.id) === String(editId));
      if (jobToEdit) {
        // We need to wait a tick or call handleEdit directly, but handleEdit relies on state defined below?
        // Actually, handleEdit is defined below this useEffect. We should move this logic or duplicated it.
        // It is safer to duplicate the setting logic here to avoid hoisting issues dependent on definition order 
        // or simply move the useEffect to after handleEdit definition.
        // However, React function components hoist standard function definitions but consts are not hoisted.
        // Let's just set the state directly here mirroring handleEdit.
        setNewJob({
          staffing_id: null,
          title: jobToEdit.title,
          department: jobToEdit.department,
          employmentType: jobToEdit.employmentType,
          location: jobToEdit.location,
          description: jobToEdit.description || '',
          requirements: Array.isArray(jobToEdit.requirements) ? jobToEdit.requirements.join('\n') : (jobToEdit.requirements || ''),
          responsibilities: Array.isArray(jobToEdit.responsibilities) ? jobToEdit.responsibilities.join('\n') : (jobToEdit.responsibilities || ''),
          salaryGrade: jobToEdit.salaryGrade || 1,
          deadline: jobToEdit.deadline || '',
          status: jobToEdit.status || 'Open',
          campus_id: jobToEdit.campus_id || '',
          custom_file_requirements: Array.isArray(jobToEdit.custom_file_requirements) ? jobToEdit.custom_file_requirements : [],
          uploads: {
            license: null,
            certificates: null,
            prc: null,
            coe: null,
          }
        });
        setEditingId(jobToEdit.id);
        setIsCreating(true);
        window.history.replaceState({}, '', window.location.pathname);
      }
    }
  }, []);
  const [newJob, setNewJob] = useState({
    staffing_id: '' as string | null,
    title: '',
    department: '',
    employmentType: 'Full-time',
    location: 'Villamor Air Base, Pasay City',
    description: '',
    requirements: '',
    responsibilities: '',
    salaryGrade: 1,
    deadline: '',
    status: 'Open',
    campus_id: '' as string | number,
    custom_file_requirements: [] as { id: number, label: string }[],
    uploads: {
      license: null as File | null,
      certificates: null as File | null,
      prc: null as File | null,
      coe: null as File | null,
    }
  });

  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [campusFilter, setCampusFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [employmentTypeFilter, setEmploymentTypeFilter] = useState('all');

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof newJob.uploads) => {
    const file = e.target.files ? e.target.files[0] : null;
    setNewJob({ ...newJob, uploads: { ...newJob.uploads, [field]: file } });
  };

  const handleCreateJob = () => {
    // Basic Validation
    if (!newJob.title || !newJob.department || !newJob.description) {
      toast.error("Please fill in all required fields (Title, Department, Description).");
      return;
    }

    // Auto-calculate campus_id from location if not present
    let finalCampusId = newJob.campus_id;
    if (!finalCampusId) {
      if (newJob.location.includes('Mactan') || newJob.location.includes('Cebu')) {
        finalCampusId = 2; // Cebu
      } else if (newJob.location.includes('Davao')) {
        finalCampusId = 3; // Davao
      } else {
        finalCampusId = 1; // Villamor
      }
    }

    const payload = {
      ...newJob,
      campus_id: finalCampusId,
      requirements: newJob.requirements.split('\n').filter(r => r.trim() !== ''),
      responsibilities: newJob.responsibilities.split('\n').filter(r => r.trim() !== ''),
    };

    if (editingId) {
      // Update Existing Job
      router.put(`/admin/jobs/${editingId}`, payload, {
        onSuccess: () => {
          toast.success("Job updated successfully!");
          setIsCreating(false);
          resetForm();
        },
        onError: (errors) => {
          toast.error("Failed to update job: " + Object.values(errors)[0]);
        }
      });
    } else {
      // Create New Job
      router.post('/admin/jobs', payload, {
        onSuccess: () => {
          toast.success("Job posted successfully!");
          setIsCreating(false);
          resetForm();
        },
        onError: (errors) => {
          toast.error("Failed to post job: " + Object.values(errors)[0]);
        }
      });
    }
  };

  const handleEdit = (job: any) => {
    setNewJob({
      staffing_id: job.staffing_id || null,
      title: job.title,
      department: job.department,
      employmentType: job.employmentType,
      location: job.location,
      description: job.description || '',
      requirements: Array.isArray(job.requirements) ? job.requirements.join('\n') : (job.requirements || ''),
      responsibilities: Array.isArray(job.responsibilities) ? job.responsibilities.join('\n') : (job.responsibilities || ''),
      salaryGrade: job.salaryGrade || 1,
      deadline: job.deadline || '',
      status: job.status || 'Open',
      campus_id: job.campus_id || '',
      custom_file_requirements: Array.isArray(job.custom_file_requirements) ? job.custom_file_requirements : [],
      uploads: {
        license: null,
        certificates: null,
        prc: null,
        coe: null,
      }
    });
    setEditingId(job.id);
    setIsCreating(true);
  };

  const handleDelete = (job: any) => {
    setDeleteConfirmJob({ id: String(job.id), title: job.title });
  };

  const confirmDeleteJob = () => {
    if (!deleteConfirmJob) return;
    router.delete(`/admin/jobs/${deleteConfirmJob.id}`, {
      onSuccess: () => {
        toast.success("Job deleted successfully.");
        setDeleteConfirmJob(null);
      },
      onError: () => {
        toast.error("Failed to delete job.");
        setDeleteConfirmJob(null);
      }
    });
  };

  const handleCreateDepartment = () => {
    if (!newDeptName.trim()) return;
    router.post('/admin/departments', { name: newDeptName.trim() }, {
      onSuccess: () => {
        toast.success(`Department folder '${newDeptName.trim()}' created successfully!`);
        setIsCreatingDept(false);
        setNewDeptName('');
      },
      onError: (errors) => {
        toast.error("Failed to create department: " + (Object.values(errors)[0] || 'Already exists'));
      }
    });
  };

  const confirmDeleteDepartment = () => {
    if (!deleteConfirmDept) return;
    
    // Find department object if we only have the name string
    const targetDept = typeof deleteConfirmDept === 'object' && deleteConfirmDept.id
      ? deleteConfirmDept
      : dbDepartments.find((d: any) => d.name === deleteConfirmDept);

    if (!targetDept || !targetDept.id) {
      toast.error("Cannot delete system default folder directly.");
      setDeleteConfirmDept(null);
      return;
    }

    router.delete(`/admin/departments/${targetDept.id}`, {
      onSuccess: () => {
        toast.success(`Department folder '${targetDept.name}' deleted successfully!`);
        setDeleteConfirmDept(null);
        if (selectedDepartment === targetDept.name) {
          setSelectedDepartment(null);
        }
      },
      onError: (errors) => {
        toast.error("Failed to delete department folder.");
        setDeleteConfirmDept(null);
      }
    });
  };

  const resetForm = () => {
    setNewJob({
      staffing_id: null,
      title: '',
      department: '',
      employmentType: 'Full-time',
      location: 'NAAP - Villamor Campus',
      description: '',
      requirements: '',
      responsibilities: '',
      salaryGrade: 1,
      deadline: '',
      status: 'Open',
      campus_id: '',
      custom_file_requirements: [],
      uploads: {
        license: null,
        certificates: null,
        prc: null,
        coe: null,
      }
    });
    setEditingId(null);
  };

  const addCustomFileRequirement = () => {
    setNewJob({
      ...newJob,
      custom_file_requirements: [
        ...newJob.custom_file_requirements,
        { id: Date.now(), label: '' }
      ]
    });
  };

  const removeCustomFileRequirement = (id: number) => {
    setNewJob({
      ...newJob,
      custom_file_requirements: newJob.custom_file_requirements.filter(r => r.id !== id)
    });
  };

  const updateCustomFileRequirement = (id: number, label: string) => {
    setNewJob({
      ...newJob,
      custom_file_requirements: newJob.custom_file_requirements.map(r =>
        r.id === id ? { ...r, label } : r
      )
    });
  };




  // Combine departments from database model and job postings
  const departments = Array.from(
    new Set([
      ...(dbDepartments || []).map((d: any) => d.name),
      ...jobs.map((j: any) => j.department)
    ])
  ).filter(Boolean) as string[];

  // Filter jobs based on search, filters, and selected department folder
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.department.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCampus = campusFilter === 'all' || String(job.campus_id) === String(campusFilter);
    const effectiveStatus = (job.status === 'Closed' || isJobExpired(job)) ? 'Closed' : (job.status || 'Draft');
    const matchesStatus = statusFilter === 'all' || effectiveStatus === statusFilter;
    const matchesEmploymentType = employmentTypeFilter === 'all' || job.employmentType === employmentTypeFilter;
    const matchesDepartment = !selectedDepartment || job.department === selectedDepartment;
    return matchesSearch && matchesCampus && matchesStatus && matchesEmploymentType && matchesDepartment;
  });

  return (
    <AdminLayout auth={auth}>
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Job Listings Management</h1>
            <p className="text-gray-600">Managing career opportunities as <span className="text-[#193153] font-bold">{admin.name}</span></p>
          </div>
          <div className="flex items-center gap-3">
            <Dialog open={isCreating} onOpenChange={setIsCreating}>
              <DialogTrigger asChild>
                <Button 
                  onClick={() => resetForm()}
                  className="bg-[#193153] hover:bg-[#12243e] text-white font-semibold shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Create New Job
                </Button>
              </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Job Posting" : "Create New Job Posting"}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={newJob.title}
                      onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                      placeholder="e.g., Flight Instructor"
                    />
                  </div>
                  <div>
                    <Label htmlFor="department">Department *</Label>
                    <Input
                      id="department"
                      value={newJob.department}
                      onChange={(e) => setNewJob({ ...newJob, department: e.target.value })}
                      placeholder="e.g., Flight Training"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="salaryGrade">Salary Grade *</Label>
                    <div className="flex items-center space-x-2">
                      <Select
                        value={String(newJob.salaryGrade)}
                        onValueChange={(value) => setNewJob({ ...newJob, salaryGrade: Number(value) })}
                      >
                        <SelectTrigger id="salaryGrade">
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
                      <div className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-2 rounded border border-blue-100 whitespace-nowrap">
                        ₱{SALARY_GRADE_MAP[newJob.salaryGrade]?.toLocaleString()}
                      </div>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="employmentType">Employment Type</Label>

                    <Select value={newJob.employmentType} onValueChange={(value) => setNewJob({ ...newJob, employmentType: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Full-time">Full-time</SelectItem>
                        <SelectItem value="Part-time">Part-time</SelectItem>
                        <SelectItem value="Contract">Contract</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={newJob.location}
                      onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                      placeholder="e.g. Villamor Air Base, Pasay City"
                    />
                  </div>
                  <div>
                    <Label htmlFor="status">Job Status</Label>
                    <Select value={newJob.status} onValueChange={(value) => setNewJob({ ...newJob, status: value })}>
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Open">Open</SelectItem>
                        <SelectItem value="Closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Job Description *</Label>
                  <Textarea
                    id="description"
                    rows={4}
                    value={newJob.description}
                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                    placeholder="Describe the position..."
                  />
                </div>

                <div>
                  <Label htmlFor="requirements">Requirements (one per line)</Label>
                  <Textarea
                    id="requirements"
                    rows={4}
                    value={newJob.requirements}
                    onChange={(e) => setNewJob({ ...newJob, requirements: e.target.value })}
                    placeholder="List any other requirements..."
                  />
                </div>


                {/* Upload Boxes */}
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="license">Upload License</Label>
                    <Input
                      type="file"
                      id="license"
                      onChange={(e) => handleFileChange(e, 'license')}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                  <div>
                    <Label htmlFor="certificates">Upload Certificates</Label>
                    <Input
                      type="file"
                      id="certificates"
                      onChange={(e) => handleFileChange(e, 'certificates')}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                  <div>
                    <Label htmlFor="prc">Upload PRC License</Label>
                    <Input
                      type="file"
                      id="prc"
                      onChange={(e) => handleFileChange(e, 'prc')}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                  <div>
                    <Label htmlFor="coe">Upload COE</Label>
                    <Input
                      type="file"
                      id="coe"
                      onChange={(e) => handleFileChange(e, 'coe')}
                      accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="responsibilities">Responsibilities (one per line) *</Label>
                  <Textarea
                    id="responsibilities"
                    rows={4}
                    value={newJob.responsibilities}
                    onChange={(e) => setNewJob({ ...newJob, responsibilities: e.target.value })}
                    placeholder="e.g., Conduct training sessions"
                  />
                </div>

                  {/* Custom File Requirements */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <Label>Custom Document Attachments Required</Label>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addCustomFileRequirement}
                        className="text-xs"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Custom File
                      </Button>
                    </div>

                    {newJob.custom_file_requirements.length > 0 ? (
                      <div className="space-y-2">
                        {newJob.custom_file_requirements.map((req) => (
                          <div key={req.id} className="flex gap-2 items-center">
                            <Input
                              placeholder="e.g. CAAP Class 1 Medical Certificate"
                              value={req.label}
                              onChange={(e) => updateCustomFileRequirement(req.id, e.target.value)}
                              className="text-xs"
                            />
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeCustomFileRequirement(req.id)}
                              className="text-red-500 hover:text-red-700"
                            >
                              <Archive className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-4 border border-dashed border-blue-200 rounded text-gray-400 text-xs">
                        No custom file requirements added
                      </div>
                    )}
                  </div>

                  <div>
                    <Label htmlFor="deadline">Application Deadline *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={newJob.deadline}
                      onChange={(e) => setNewJob({ ...newJob, deadline: e.target.value })}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1 bg-[#193153] hover:bg-[#12243e] text-white"
                      onClick={handleCreateJob}
                      disabled={!newJob.title || !newJob.department || !newJob.description}
                    >
                      {editingId ? "Update Job Posting" : "Create Job Posting"}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => setIsCreating(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Overview Quick Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Jobs</p>
                  <p className="text-3xl font-bold text-[#193153]">{jobs.length}</p>
                </div>
                <div className="p-3 bg-blue-50 rounded-xl text-[#193153]">
                  <Briefcase className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Open Positions</p>
                  <p className="text-3xl font-bold text-emerald-600">
                    {jobs.filter(j => j.status === 'Open' && !isJobExpired(j)).length}
                  </p>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-slate-200 shadow-sm">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-xs font-semibold uppercase tracking-wider mb-1">Total Applicants</p>
                  <p className="text-3xl font-bold text-purple-600">
                    {jobs.reduce((sum, job) => sum + job.applicantCount, 0)}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
                  <Users className="h-7 w-7" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>        {/* MAIN INTEGRATED PAGE LAYOUT (LIGHT THEME) */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-6">
          
          {/* Breadcrumbs, Search & Toolbar */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-3 shadow-2xs flex flex-wrap items-center justify-between gap-3">
            
            {/* Breadcrumb Path */}
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white border border-gray-200 px-3 py-1.5 rounded-lg flex-1 min-w-[220px]">
              <button 
                onClick={() => { setSelectedDepartment(null); setSelectedJob(null); }}
                className="hover:text-[#193153] flex items-center gap-1 font-medium text-gray-500 transition-colors cursor-pointer"
              >
                <Home className="h-3.5 w-3.5 text-[#193153]" />
                <span>NAAP</span>
              </button>
              <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
              <button 
                onClick={() => { setSelectedDepartment(null); setSelectedJob(null); }}
                className={`hover:text-[#193153] font-medium transition-colors cursor-pointer ${!selectedDepartment ? 'text-[#193153] font-bold' : 'text-gray-500'}`}
              >
                Jobs
              </button>
              {selectedDepartment && (
                <>
                  <ChevronRight className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-amber-800 font-bold bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    📁 {selectedDepartment}
                  </span>
                </>
              )}
            </div>

            {/* Search & Layout Actions */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="h-3.5 w-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search jobs & departments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8 pr-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs text-gray-800 placeholder:text-gray-400 focus:outline-none focus:border-[#193153] w-44 sm:w-56"
                />
              </div>

              {/* Status Filter */}
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="h-8 text-xs w-32 border-gray-200 bg-white">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="Open">Open</SelectItem>
                  <SelectItem value="Closed">Closed</SelectItem>
                </SelectContent>
              </Select>

              {/* Employment Type Filter */}
              <Select value={employmentTypeFilter} onValueChange={setEmploymentTypeFilter}>
                <SelectTrigger className="h-8 text-xs w-32 border-gray-200 bg-white">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Full-time">Full-time</SelectItem>
                  <SelectItem value="Part-time">Part-time</SelectItem>
                  <SelectItem value="Contract">Contract</SelectItem>
                </SelectContent>
              </Select>

              {/* Layout Mode Toggles */}
              <div className="bg-gray-200/80 border border-gray-300 p-0.5 rounded-lg flex items-center text-gray-600">
                <button
                  type="button"
                  onClick={() => setExplorerLayout('grid')}
                  title="Grid View"
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    explorerLayout === 'grid' ? 'bg-white text-[#193153] font-bold shadow-2xs' : 'hover:text-gray-900'
                  }`}
                >
                  <Grid className="h-3.5 w-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() => setExplorerLayout('details')}
                  title="Details List View"
                  className={`p-1.5 rounded-md transition-all cursor-pointer ${
                    explorerLayout === 'details' ? 'bg-white text-[#193153] font-bold shadow-2xs' : 'hover:text-gray-900'
                  }`}
                >
                  <List className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* 3-Column Integrated Workspace */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* 1. Left Explorer Sidebar Tree (3 cols) */}
            <div className="lg:col-span-3 bg-gray-50 border border-gray-200 rounded-xl p-4 shadow-2xs space-y-5">
              
              {/* Quick Access Section */}
              <div>
                <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2 px-1">
                  Quick Access
                </h4>
                <div className="space-y-1 text-xs font-medium">
                  <button
                    onClick={() => { setSelectedDepartment(null); setStatusFilter('all'); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      !selectedDepartment && statusFilter === 'all'
                        ? 'bg-blue-50 text-[#193153] font-bold border border-blue-200'
                        : 'text-gray-700 hover:bg-gray-200/60'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Briefcase className="h-3.5 w-3.5 text-[#193153]" />
                      All Jobs
                    </span>
                    <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-mono font-bold">
                      {jobs.length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setSelectedDepartment(null); setStatusFilter('Open'); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      !selectedDepartment && statusFilter === 'Open'
                        ? 'bg-emerald-50 text-emerald-700 font-bold border border-emerald-200'
                        : 'text-gray-700 hover:bg-gray-200/60'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      Open Vacancies
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-md font-mono font-bold">
                      {jobs.filter((j: any) => j.status === 'Open' && !isJobExpired(j)).length}
                    </span>
                  </button>

                  <button
                    onClick={() => { setSelectedDepartment(null); setStatusFilter('Closed'); }}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                      !selectedDepartment && statusFilter === 'Closed'
                        ? 'bg-red-50 text-red-700 font-bold border border-red-200'
                        : 'text-gray-700 hover:bg-gray-200/60'
                    }`}
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="h-3.5 w-3.5 text-red-600" />
                      Closed / Expired
                    </span>
                    <span className="text-[10px] bg-red-100 text-red-800 px-2 py-0.5 rounded-md font-mono font-bold">
                      {jobs.filter((j: any) => j.status === 'Closed' || isJobExpired(j)).length}
                    </span>
                  </button>
                </div>
              </div>

              {/* Department Folders Section */}
              <div>
                <div className="flex items-center justify-between mb-2 px-1">
                  <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">
                    Departments (Folders)
                  </h4>
                  <button
                    onClick={() => setIsCreatingDept(true)}
                    className="text-[11px] text-amber-600 hover:text-amber-700 font-bold flex items-center gap-1 cursor-pointer"
                    title="Add New Department Folder"
                  >
                    <FolderPlus className="h-3 w-3" />
                    + Folder
                  </button>
                </div>
                <div className="space-y-1 text-xs font-medium">
                  {departments.map((dept: any) => {
                    const deptJobsCount = jobs.filter((j: any) => j.department === dept).length;
                    const isSelected = selectedDepartment === dept;
                    const dbObj = dbDepartments.find((d: any) => d.name === dept);

                    return (
                      <div
                        key={dept}
                        className={`group flex items-center justify-between px-3 py-2 rounded-lg transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-amber-50 text-amber-900 font-bold border border-amber-300 shadow-2xs'
                            : 'text-gray-700 hover:bg-gray-200/60'
                        }`}
                      >
                        <button
                          onClick={() => { setSelectedDepartment(isSelected ? null : dept); setSelectedJob(null); }}
                          className="flex-1 flex items-center gap-2 truncate pr-2 text-left"
                        >
                          <Folder className={`h-3.5 w-3.5 shrink-0 ${isSelected ? 'text-amber-600 fill-amber-300' : 'text-amber-500'}`} />
                          <span className="truncate">{dept}</span>
                        </button>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] bg-gray-200 text-gray-700 px-2 py-0.5 rounded-md font-mono">
                            {deptJobsCount}
                          </span>
                          {dbObj && deptJobsCount === 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirmDept(dbObj); }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity"
                              title={`Delete ${dept} folder`}
                            >
                              <Trash2 className="h-3 w-3" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* 2. Center Content Canvas */}
            <div className={`${selectedJob ? 'lg:col-span-5' : 'lg:col-span-9'} space-y-6 transition-all duration-200`}>
              
              {/* Department Folders Section (when at root) */}
              {!selectedDepartment && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
                      <Folder className="h-4 w-4 text-amber-500" />
                      Department Folders ({departments.length})
                    </h3>
                    <button
                      onClick={() => setIsCreatingDept(true)}
                      className="text-xs text-amber-700 hover:text-amber-800 font-bold flex items-center gap-1 cursor-pointer"
                    >
                      <FolderPlus className="h-3.5 w-3.5" />
                      + Add New Folder
                    </button>
                  </div>
                  <div className={`grid gap-3 ${selectedJob ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4'}`}>
                    {departments.map((dept: any) => {
                      const deptCount = jobs.filter((j: any) => j.department === dept).length;
                      const dbObj = dbDepartments.find((d: any) => d.name === dept);

                      return (
                        <div
                          key={dept}
                          onClick={() => { setSelectedDepartment(dept); setSelectedJob(null); }}
                          className="group relative bg-white hover:bg-amber-50/40 border border-gray-200 hover:border-amber-300 p-4 rounded-xl cursor-pointer transition-all duration-200 shadow-2xs hover:shadow-sm flex items-center gap-3.5"
                        >
                          <div className="p-3 bg-amber-100/70 rounded-xl group-hover:scale-105 transition-transform text-amber-700">
                            <Folder className="h-6 w-6 text-amber-600 fill-amber-200" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-gray-900 group-hover:text-amber-800 truncate transition-colors">
                              {dept}
                            </h4>
                            <p className="text-[11px] text-gray-500 mt-0.5 font-medium">
                              {deptCount} {deptCount === 1 ? 'Job posting' : 'Job postings'}
                            </p>
                          </div>
                          {dbObj && deptCount === 0 && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setDeleteConfirmDept(dbObj); }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-600 transition-opacity absolute top-2 right-2"
                              title={`Delete ${dept} folder`}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Job Items List / Grid */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-xs uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1.5">
                    <FileText className="h-4 w-4 text-blue-600" />
                    {selectedDepartment ? `${selectedDepartment} Jobs` : 'Job Files'} ({filteredJobs.length})
                  </h3>
                  {selectedDepartment && (
                    <button
                      onClick={() => setSelectedDepartment(null)}
                      className="text-xs text-[#193153] hover:underline flex items-center gap-1 font-bold cursor-pointer"
                    >
                      ← View all folders
                    </button>
                  )}
                </div>

                {filteredJobs.length === 0 ? (
                  <div className="py-16 text-center border border-dashed border-gray-300 rounded-xl bg-gray-50">
                    <Folder className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-gray-700">No jobs found in this directory</p>
                    <p className="text-xs text-gray-400 mt-1">Try clearing filters or search terms</p>
                  </div>
                ) : explorerLayout === 'grid' ? (
                  /* Grid View (Clean Light Cards) */
                  <div className={`grid gap-3 ${selectedJob ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3'}`}>
                    {filteredJobs.map((job: any) => {
                      const isSelected = selectedJob?.id === job.id;
                      const isExpired = isJobExpired(job);
                      const displayStatus = (job.status === 'Closed' || isExpired) ? 'Closed' : (job.status || 'Open');

                      return (
                        <div
                          key={job.id}
                          onClick={() => setSelectedJob(job)}
                          onDoubleClick={() => handleEdit(job)}
                          className={`group bg-white hover:bg-slate-50/80 border p-4 rounded-xl cursor-pointer transition-all duration-150 flex flex-col justify-between shadow-2xs ${
                            isSelected
                              ? 'border-[#193153] shadow-md ring-2 ring-[#193153]/20 bg-blue-50/30'
                              : 'border-gray-200 hover:border-blue-300'
                          }`}
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2.5">
                              <div className="p-2 bg-blue-50 rounded-lg text-[#193153] group-hover:scale-105 transition-transform border border-blue-100">
                                <FileText className="h-5 w-5" />
                              </div>
                              <Badge
                                className={`text-[10px] px-2 py-0.5 font-bold ${
                                  displayStatus === 'Open'
                                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                                    : 'bg-red-50 text-red-700 border border-red-200'
                                }`}
                              >
                                {displayStatus}
                              </Badge>
                            </div>

                            <h4 className="text-sm font-bold text-gray-900 group-hover:text-[#193153] transition-colors line-clamp-1">
                              {job.title}
                            </h4>
                            <p className="text-xs text-gray-500 mt-1 flex items-center gap-1 font-medium">
                              <Building2 className="h-3 w-3 text-gray-400" />
                              {job.department}
                            </p>
                          </div>

                          <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-600">
                            <span className="font-bold text-[#193153]">
                              SG {job.salaryGrade}
                              <span className="text-[10px] text-gray-500 ml-1 font-normal">
                                (₱{SALARY_GRADE_MAP[job.salaryGrade]?.toLocaleString()})
                              </span>
                            </span>

                            <span className="flex items-center gap-1 text-[11px] font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded-md">
                              <Users className="h-3 w-3 text-gray-400" />
                              {job.applicantCount}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Details List View (Table Light) */
                  <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
                    <table className="w-full text-xs text-left text-gray-700">
                      <thead className="bg-gray-50 text-gray-600 font-bold border-b border-gray-200 uppercase tracking-wider text-[11px]">
                        <tr>
                          <th className="p-3">Name</th>
                          <th className="p-3">Department</th>
                          <th className="p-3">Salary Grade</th>
                          <th className="p-3">Status</th>
                          <th className="p-3">Applicants</th>
                          <th className="p-3">Posted Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {filteredJobs.map((job: any) => {
                          const isSelected = selectedJob?.id === job.id;
                          const isExpired = isJobExpired(job);
                          const displayStatus = (job.status === 'Closed' || isExpired) ? 'Closed' : (job.status || 'Open');

                          return (
                            <tr
                              key={job.id}
                              onClick={() => setSelectedJob(job)}
                              onDoubleClick={() => handleEdit(job)}
                              className={`cursor-pointer transition-colors ${
                                isSelected ? 'bg-blue-50/80 font-semibold text-gray-900' : 'hover:bg-gray-50'
                              }`}
                            >
                              <td className="p-3 font-bold text-gray-900 flex items-center gap-2">
                                <FileText className="h-3.5 w-3.5 text-[#193153] shrink-0" />
                                <span className="truncate max-w-[180px]">{job.title}</span>
                              </td>
                              <td className="p-3 text-gray-600">{job.department}</td>
                              <td className="p-3 font-bold text-[#193153]">SG {job.salaryGrade}</td>
                              <td className="p-3">
                                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                                  displayStatus === 'Open' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'
                                }`}>
                                  {displayStatus}
                                </span>
                              </td>
                              <td className="p-3 text-gray-600 font-semibold">{job.applicantCount}</td>
                              <td className="p-3 text-gray-500">
                                {job.postedDate ? new Date(job.postedDate).toLocaleDateString() : 'N/A'}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* 3. Right Details Preview Panel (4 cols) */}
            {selectedJob && (
              <div className="lg:col-span-4 bg-gray-50/80 border border-gray-200 rounded-xl p-5 shadow-2xs space-y-5 sticky top-24">
                {/* Header Banner */}
                <div className="bg-white border border-gray-200 p-4 rounded-xl text-center relative overflow-hidden shadow-2xs">
                  <div className="w-12 h-12 mx-auto bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-[#193153] mb-2 shadow-2xs">
                    <FileText className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug">
                    {selectedJob.title}
                  </h3>
                  <p className="text-xs text-[#193153] font-bold mt-1">
                    {selectedJob.department}
                  </p>
                </div>

                {/* Metadata Detail List */}
                <div className="space-y-3 text-xs text-gray-700 bg-white p-3.5 rounded-xl border border-gray-200 shadow-2xs">
                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5 text-gray-400" />
                      Status
                    </span>
                    <Badge
                      className={`text-[10px] px-2 py-0.5 font-bold ${
                        selectedJob.status === 'Open' && !isJobExpired(selectedJob)
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-red-50 text-red-700 border border-red-200'
                      }`}
                    >
                      {selectedJob.status === 'Open' && !isJobExpired(selectedJob) ? 'Open' : 'Closed'}
                    </Badge>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium flex items-center gap-1.5">
                      <DollarSign className="h-3.5 w-3.5 text-[#193153]" />
                      Salary Grade
                    </span>
                    <span className="font-bold text-[#193153]">
                      SG {selectedJob.salaryGrade} (₱{SALARY_GRADE_MAP[selectedJob.salaryGrade]?.toLocaleString()}/mo)
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium flex items-center gap-1.5">
                      <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                      Employment Type
                    </span>
                    <span className="font-semibold text-gray-800">{selectedJob.employmentType}</span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-gray-400" />
                      Total Applicants
                    </span>
                    <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      {selectedJob.applicantCount} applicants
                    </span>
                  </div>

                  <div className="flex justify-between items-center pb-2 border-b border-gray-100">
                    <span className="text-gray-500 font-medium flex items-center gap-1.5">
                      <Calendar className="h-3.5 w-3.5 text-gray-400" />
                      Posted Date
                    </span>
                    <span className="text-gray-800 font-medium">
                      {selectedJob.postedDate ? new Date(selectedJob.postedDate).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-gray-500 font-medium flex items-center gap-1.5">
                      <Clock className="h-3.5 w-3.5 text-gray-400" />
                      Deadline
                    </span>
                    <span className="text-gray-800 font-medium">
                      {selectedJob.deadline ? new Date(selectedJob.deadline).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                </div>

                {/* Actions Toolbar */}
                <div className="space-y-2 pt-1">
                  <h4 className="text-[10px] uppercase font-bold text-gray-400 tracking-wider px-1">
                    Quick Actions
                  </h4>
                  <div className="grid grid-cols-2 gap-2">
                    <Link href={`/jobs/${selectedJob.id}`} className="w-full">
                      <Button variant="outline" size="sm" className="w-full bg-white border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold cursor-pointer">
                        <Eye className="h-3.5 w-3.5 mr-1.5 text-blue-600" />
                        Preview
                      </Button>
                    </Link>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEdit(selectedJob)}
                      className="w-full bg-white border-gray-200 hover:bg-gray-50 text-gray-700 text-xs font-semibold cursor-pointer"
                    >
                      <Edit className="h-3.5 w-3.5 mr-1.5 text-amber-600" />
                      Edit
                    </Button>
                  </div>

                  <Button
                    onClick={() => handleDelete(selectedJob)}
                    variant="outline"
                    size="sm"
                    className="w-full bg-red-50 hover:bg-red-100 border-red-200 text-red-700 text-xs font-semibold cursor-pointer"
                  >
                    <Archive className="h-3.5 w-3.5 mr-1.5 text-red-600" />
                    Delete Job Posting
                  </Button>
                </div>
              </div>
            )}

          </div>

          {/* Bottom Explorer Status Bar */}
          <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 flex items-center justify-between text-[11px] text-gray-500 font-medium">
            <span>
              {filteredJobs.length} {filteredJobs.length === 1 ? 'item' : 'items'}
              {selectedDepartment ? ` in "${selectedDepartment}"` : ''}
            </span>
            {selectedJob && (
              <span className="text-[#193153] font-bold truncate max-w-xs">
                Selected: {selectedJob.title}
              </span>
            )}
          </div>

        </div>
      </div>

      {/* Custom Delete Confirmation Dialog Modal */}
      <Dialog open={!!deleteConfirmJob} onOpenChange={(open) => !open && setDeleteConfirmJob(null)}>
        <DialogContent className="max-w-md bg-slate-900 border border-slate-800 text-white rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Archive className="h-5 w-5 text-red-500" />
              Delete Job Posting
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-slate-300 text-sm space-y-3">
            <p>
              Are you sure you want to delete <span className="font-semibold text-white">"{deleteConfirmJob?.title}"</span>?
            </p>
            <div className="text-xs text-red-400 font-medium bg-red-950/40 border border-red-900/40 p-3 rounded-lg flex items-start gap-2">
              <span className="text-sm leading-none">⚠️</span>
              <span>This action cannot be undone and will permanently remove this job posting and any associated applications.</span>
            </div>
          </div>
          <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end border-t border-slate-800 pt-3 mt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteConfirmJob(null)}
              className="bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-300 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={confirmDeleteJob}
              className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-white font-medium shadow-md shadow-red-900/30"
            >
              Yes, Delete Job
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Department Folder Modal */}
      <Dialog open={isCreatingDept} onOpenChange={setIsCreatingDept}>
        <DialogContent className="max-w-md bg-white border border-gray-200 text-gray-900 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <FolderPlus className="h-5 w-5 text-amber-600" />
              Create New Department Folder
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 space-y-3">
            <Label htmlFor="deptName" className="text-xs font-semibold text-gray-700">
              Department Name *
            </Label>
            <Input
              id="deptName"
              placeholder="e.g. Avionics & Radar"
              value={newDeptName}
              onChange={(e) => setNewDeptName(e.target.value)}
              className="border-gray-300"
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreateDepartment(); }}
            />
            <p className="text-xs text-gray-500 leading-relaxed">
              Creating a department folder saves it directly to your MySQL database so you can categorize job vacancies inside it.
            </p>
          </div>
          <DialogFooter className="flex gap-2 justify-end pt-2 border-t border-gray-100">
            <Button variant="outline" onClick={() => setIsCreatingDept(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleCreateDepartment}
              disabled={!newDeptName.trim()}
              className="bg-[#193153] hover:bg-[#12243e] text-white font-semibold cursor-pointer"
            >
              Create Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Department Folder Modal */}
      <Dialog open={!!deleteConfirmDept} onOpenChange={(open) => !open && setDeleteConfirmDept(null)}>
        <DialogContent className="max-w-md bg-white border border-gray-200 text-gray-900 rounded-xl shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Trash2 className="h-5 w-5 text-red-600" />
              Delete Department Folder
            </DialogTitle>
          </DialogHeader>
          <div className="py-3 text-gray-700 text-sm space-y-3">
            <p>
              Are you sure you want to delete the department folder <span className="font-bold text-gray-900">"{deleteConfirmDept?.name}"</span>?
            </p>
            <div className="text-xs text-red-700 font-medium bg-red-50 border border-red-200 p-3 rounded-lg flex items-start gap-2">
              <span className="text-sm leading-none">⚠️</span>
              <span>This folder will be permanently deleted from your MySQL database.</span>
            </div>
          </div>
          <DialogFooter className="flex gap-2 justify-end pt-2 border-t border-gray-100">
            <Button variant="outline" onClick={() => setDeleteConfirmDept(null)}>
              Cancel
            </Button>
            <Button onClick={confirmDeleteDepartment} className="bg-red-600 hover:bg-red-700 text-white font-semibold cursor-pointer">
              Yes, Delete Folder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}