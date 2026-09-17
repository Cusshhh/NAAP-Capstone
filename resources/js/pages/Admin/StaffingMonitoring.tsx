import { Link, router } from '@inertiajs/react';
import {
    Users, Briefcase, FileText, Award, LogOut, Shield,
    Search, Filter, MapPin, Plus, ArrowRight, CheckCircle,
    XCircle, AlertCircle, Building2, Layout
} from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getStaffingData } from '@/data/mockData';
import AdminLayout from '@/layouts/AdminLayout';

export default function StaffingMonitoring({ auth, staffingData: serverStaffing }: { auth: any, staffingData: any[] }) {
    const admin = auth?.user || { name: 'Admin' };
    const [staffingData, setStaffingData] = useState(serverStaffing || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    // Add New Plantilla Position Modal State
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newOffice, setNewOffice] = useState('');
    const [newPosition, setNewPosition] = useState('');
    const [newSg, setNewSg] = useState('11');
    const [newStatus, setNewStatus] = useState('Unfilled');

    const handleAddPositionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newOffice.trim() || !newPosition.trim()) {
            toast.error('Please fill in both Office/Department and Position Title.');
            return;
        }

        const newStaffingItem = {
            id: Date.now(),
            office: newOffice.trim(),
            position: newPosition.trim(),
            sg: parseInt(newSg) || 11,
            status: newStatus,
            campus: 'Villamor Air Base, Pasay City'
        };

        const updatedList = [newStaffingItem, ...staffingData];
        setStaffingData(updatedList);

        try {
            const currentCache = JSON.parse(localStorage.getItem('mock_staffing_custom') || '[]');
            localStorage.setItem('mock_staffing_custom', JSON.stringify([newStaffingItem, ...currentCache]));
        } catch (err) {}

        toast.success(`New Position "${newPosition}" added!`);
        setIsAddModalOpen(false);

        setNewOffice('');
        setNewPosition('');
        setNewSg('11');
        setNewStatus('Unfilled');
    };

    const filteredData = staffingData.filter(item => {
        const matchesSearch = item.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.office.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCreateJob = (item: any) => {
        // Redirect to Job Management with pre-filled state
        // In a real Inertia app, you might pass state or use query params
        toast.info(`Preparing job posting for ${item.position}...`);
        setTimeout(() => {
            router.get('/admin/jobs', {
                createFromStaffing: 'true',
                staffingId: item.id,
                title: item.position,
                department: item.office,
                campus: item.campus
            });
        }, 1000);
    };



    const stats = {
        total: staffingData.length,
        filled: staffingData.filter(i => i.status === 'Filled').length,
        unfilled: staffingData.filter(i => i.status === 'Unfilled').length,
        onProcess: staffingData.filter(i => i.status === 'On-process').length,
    };

    return (
        <AdminLayout auth={auth}>
            <div className="container mx-auto px-4 py-8">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Staffing Monitoring</h1>
                        <p className="text-gray-500">Track and manage staffing requirements for NAAP.</p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            onClick={() => setIsAddModalOpen(true)}
                            className="bg-[#193153] hover:bg-[#193153]/90 text-white font-medium gap-2 shadow-sm"
                        >
                            <Plus className="w-4 h-4" />
                            Add New Position
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    <Card className="border-l-4 border-l-blue-500 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Total Positions</p>
                                    <h3 className="text-2xl font-bold mt-1">{stats.total}</h3>
                                </div>
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <Building2 className="w-5 h-5 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-green-500 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Filled</p>
                                    <h3 className="text-2xl font-bold mt-1 text-green-600">{stats.filled}</h3>
                                </div>
                                <div className="p-2 bg-green-50 rounded-lg">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-red-500 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">Unfilled</p>
                                    <h3 className="text-2xl font-bold mt-1 text-red-600">{stats.unfilled}</h3>
                                </div>
                                <div className="p-2 bg-red-50 rounded-lg">
                                    <XCircle className="w-5 h-5 text-red-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="border-l-4 border-l-yellow-500 shadow-sm">
                        <CardContent className="pt-6">
                            <div className="flex justify-between items-start">
                                <div>
                                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wider">On-Process</p>
                                    <h3 className="text-2xl font-bold mt-1 text-yellow-600">{stats.onProcess}</h3>
                                </div>
                                <div className="p-2 bg-yellow-50 rounded-lg">
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
                                                <td className="px-6 py-4 text-sm text-gray-800">{item.position}</td>
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
                                                <td className="px-6 py-4 text-right">
                                                    {item.status === 'Unfilled' && (
                                                        <Button
                                                            size="sm"
                                                            variant="outline"
                                                            className="text-xs border-blue-200 text-blue-600 hover:bg-blue-50"
                                                            onClick={() => handleCreateJob(item)}
                                                        >
                                                            <Plus className="w-3 h-3 mr-1" /> Post Job
                                                        </Button>
                                                    )}
                                                    {item.status === 'Filled' && (
                                                        <span className="text-xs text-gray-400">---</span>
                                                    )}
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

            {/* Add New Position Modal */}
            <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-bold text-gray-900">Add New Position</DialogTitle>
                        <DialogDescription>
                            Enter position details to add to the NAAP Main Campus staffing inventory.
                        </DialogDescription>
                    </DialogHeader>

                    <form onSubmit={handleAddPositionSubmit} className="space-y-4 py-2">
                        <div>
                            <Label htmlFor="office" className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Office / Department <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="office"
                                placeholder="e.g. Institute of Computer Studies"
                                value={newOffice}
                                onChange={(e) => setNewOffice(e.target.value)}
                                className="mt-1"
                                required
                            />
                        </div>

                        <div>
                            <Label htmlFor="position" className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                                Position Title <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="position"
                                placeholder="e.g. Associate Professor I"
                                value={newPosition}
                                onChange={(e) => setNewPosition(e.target.value)}
                                className="mt-1"
                                required
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <Label htmlFor="sg" className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Salary Grade (SG)
                                </Label>
                                <select
                                    id="sg"
                                    className="w-full mt-1 border-gray-300 rounded-md text-sm p-2 bg-white border"
                                    value={newSg}
                                    onChange={(e) => setNewSg(e.target.value)}
                                >
                                    {Array.from({ length: 30 }, (_, i) => i + 1).map((num) => (
                                        <option key={num} value={num}>SG {num}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <Label htmlFor="status" className="text-xs font-semibold uppercase tracking-wider text-gray-600">
                                    Initial Status
                                </Label>
                                <select
                                    id="status"
                                    className="w-full mt-1 border-gray-300 rounded-md text-sm p-2 bg-white border"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                >
                                    <option value="Unfilled">Unfilled</option>
                                    <option value="Filled">Filled</option>
                                    <option value="On-process">On-process</option>
                                </select>
                            </div>
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
                                className="bg-[#193153] hover:bg-[#193153]/90 text-white"
                            >
                                Save Position
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </AdminLayout>
    );
}
