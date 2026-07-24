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
import { Input } from '@/components/ui/input';
import { getStaffingData } from '@/data/mockData';
import AdminLayout from '@/layouts/AdminLayout';

export default function StaffingMonitoring({ auth, staffingData: serverStaffing }: { auth: any, staffingData: any[] }) {
    const admin = auth?.user || { name: 'Admin' };
    const [staffingData, setStaffingData] = useState(serverStaffing || []);
    const [searchTerm, setSearchTerm] = useState('');
    const [campusFilter, setCampusFilter] = useState('All');
    const [statusFilter, setStatusFilter] = useState('All');

    const [campuses, setCampuses] = useState<string[]>([]);

    // Sync with server data
    React.useEffect(() => {
        if (serverStaffing) {
            setStaffingData(serverStaffing);
            setCampuses(Array.from(new Set(serverStaffing.map(i => i.campus))));
        }
    }, [serverStaffing]);

    const filteredData = staffingData.filter(item => {
        const matchesSearch = item.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
            item.office.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCampus = campusFilter === 'All' || item.campus === campusFilter;
        const matchesStatus = statusFilter === 'All' || item.status === statusFilter;
        return matchesSearch && matchesCampus && matchesStatus;
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
                        <Link
                            href="/admin/jobs?create=true"
                            className="bg-[#193153] hover:bg-[#193153]/90 cursor-pointer inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-[color,box-shadow] disabled:pointer-events-none disabled:opacity-50 text-white shadow-xs h-9 px-4 py-2 has-[>svg]:px-3"
                        >
                            <Plus className="w-4 h-4 mr-1" />
                            Add New Position
                        </Link>
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
                                        <th className="px-6 py-4 font-semibold border-b">Campus</th>
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
                                                <td className="px-6 py-4">
                                                    <span className="text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded uppercase">
                                                        {item.campus}
                                                    </span>
                                                </td>
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
                                            <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
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
        </AdminLayout>
    );
}
