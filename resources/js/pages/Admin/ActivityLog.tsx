import {
    Users,
    Briefcase,
    FileText,
    LogOut,
    Search,
    TrendingUp,
    UserCheck,
    UserX,
    Calendar,
    Shield,
    UserPlus,
    Clock,
    ArrowLeft,
    Filter
} from 'lucide-react';
import React, { useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getActivities } from '@/data/mockData';
import AdminLayout from '@/layouts/AdminLayout';

export default function ActivityLog({ auth, dbApplications = [], dbJobs = [] }: { auth: any, dbApplications?: any[], dbJobs?: any[] }) {
    const admin = auth?.user || { name: 'Admin' };
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [activities, setActivities] = useState(() => getActivities(dbApplications, dbJobs));

    React.useEffect(() => {
        const handleSync = () => setActivities(getActivities(dbApplications, dbJobs));
        window.addEventListener('storage', handleSync);
        return () => window.removeEventListener('storage', handleSync);
    }, [dbApplications, dbJobs]);

    const getIcon = (iconName: string) => {
        switch (iconName) {
            case 'UserPlus': return <UserPlus className="h-5 w-5" />;
            case 'Briefcase': return <Briefcase className="h-5 w-5" />;
            case 'Calendar': return <Calendar className="h-5 w-5" />;
            case 'XCircle': return <UserX className="h-5 w-5" />;
            case 'UserCheck': return <UserCheck className="h-5 w-5" />;
            case 'FileText': return <FileText className="h-5 w-5" />;
            case 'Shield': return <Shield className="h-5 w-5" />;
            case 'Users': return <Users className="h-5 w-5" />;
            default: return <Clock className="h-5 w-5" />;
        }
    };


    const filteredActivities = activities.filter(activity => {
        const matchesSearch = activity.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.details.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || activity.action.toLowerCase().includes(typeFilter.toLowerCase());
        return matchesSearch && matchesType;
    });

    return (
        <AdminLayout auth={auth}>
            <div className="container mx-auto px-4 py-8 flex-1 max-w-4xl">
                {/* Search and Filters */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input
                            placeholder="Search activity records..."
                            className="pl-10 h-12 border-gray-200 focus:ring-[#193153] focus:border-[#193153]"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2">
                        <Select value={typeFilter} onValueChange={setTypeFilter}>
                            <SelectTrigger className="w-[180px] h-12 bg-white">
                                <Filter className="h-4 w-4 mr-2 text-gray-400" />
                                <SelectValue placeholder="All Activities" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Activities</SelectItem>
                                <SelectItem value="Application">Applications</SelectItem>
                                <SelectItem value="Job">Job Postings</SelectItem>
                                <SelectItem value="Interview">Interviews</SelectItem>
                                <SelectItem value="System">System/Security</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </div>

                {/* Timeline Feed */}
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                    {filteredActivities.length > 0 ? (
                        filteredActivities.map((activity, index) => (
                            <div key={activity.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                {/* Dot */}
                                <div className={`flex items-center justify-center w-10 h-10 rounded-full border border-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10 ${activity.color}`}>
                                    {getIcon(activity.icon)}
                                </div>
                                {/* Content Card */}
                                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow group">
                                    <div className="flex items-center justify-between space-x-2 mb-1">
                                        <div className="font-bold text-gray-900">{activity.action}</div>
                                        <time className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap">{activity.time}</time>
                                    </div>
                                    <div className="text-gray-600 text-sm mb-3">{activity.details}</div>
                                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
                                        <div className="flex items-center text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                                            <TrendingUp className="h-3 w-3 mr-1" />
                                            {activity.campus}
                                        </div>
                                        <div className="text-[10px] items-center flex text-gray-400 font-mono">
                                            ID: REQ-{activity.id.toString().padStart(4, '0')}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-gray-100">
                            <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Search className="h-8 w-8 text-gray-300" />
                            </div>
                            <h3 className="text-lg font-bold text-gray-900">No activities found</h3>
                            <p className="text-gray-500">Try adjusting your filters or search term</p>
                            <Button
                                variant="ghost"
                                className="mt-4 text-[#193153] underline font-bold"
                                onClick={() => { setSearchTerm(''); setTypeFilter('all'); }}
                            >
                                Clear all filters
                            </Button>
                        </div>
                    )}
                </div>

                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-400 mb-4 italic">No more activities to show</p>
                    <Button variant="outline" className="text-gray-400 border-gray-200 cursor-not-allowed">
                        Load Older Activities
                    </Button>
                </div>
            </div>
        </AdminLayout>
    );
}
