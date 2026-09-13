import { Head, router } from '@inertiajs/react';
import { Trash2, Search, Shield, User, AlertCircle } from 'lucide-react';
import React, { useState } from 'react';
import AdminLayout from '@/layouts/AdminLayout';

interface UserItem {
    id: number;
    name: string;
    email: string;
    role: string;
    designation?: string;
    avatar_url?: string;
    created_at: string;
    is_super_admin: boolean;
}

interface UserManagementProps {
    auth?: any;
    users?: UserItem[];
}

export default function UserManagement({ auth = {}, users = [] }: UserManagementProps) {
    const [searchTerm, setSearchTerm] = useState('');
    const [userToDelete, setUserToDelete] = useState<UserItem | null>(null);

    const handleDeleteUser = () => {
        if (!userToDelete) return;
        router.delete(`/admin/users/${userToDelete.id}`, {
            onSuccess: () => setUserToDelete(null),
        });
    };

    const safeUsers = Array.isArray(users) ? users : [];

    const filteredUsers = safeUsers.filter((u) => {
        if (!u) return false;
        const nameStr = u.name || '';
        const emailStr = u.email || '';
        return nameStr.toLowerCase().includes(searchTerm.toLowerCase()) || 
               emailStr.toLowerCase().includes(searchTerm.toLowerCase());
    });

    return (
        <AdminLayout auth={auth} title="User Directory">
            <Head title="User Directory - Admin Portal" />

            <div className="container mx-auto px-4 py-8 space-y-6">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div>
                        <h1 className="text-2xl font-bold text-[#193153]">User Directory</h1>
                        <p className="text-sm text-gray-500 mt-1">View and manage registered user accounts in the NAAP Careers portal.</p>
                    </div>
                </div>

                {/* Search */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                    <div className="relative w-full sm:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input 
                            type="text"
                            placeholder="Search accounts by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-9 pr-4 py-2 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#193153]"
                        />
                    </div>
                </div>

                {/* Users Table */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm border-collapse">
                            <thead>
                                <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 font-medium">
                                    <th className="py-3.5 px-6">User</th>
                                    <th className="py-3.5 px-6">Account Role</th>
                                    <th className="py-3.5 px-6">Date Registered</th>
                                    <th className="py-3.5 px-6 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.length === 0 ? (
                                    <tr>
                                        <td colSpan={4} className="py-12 text-center text-gray-400">
                                            No accounts found matching your search.
                                        </td>
                                    </tr>
                                ) : (
                                    filteredUsers.map((user) => {
                                        const isMasterAdmin = user.email === 'admin@naap.edu.ph' || user.is_super_admin;
                                        const currentUserId = auth?.user?.id;
                                        const isSelfOrMaster = (currentUserId && user.id === currentUserId) || isMasterAdmin;

                                        return (
                                            <tr key={user.id} className="hover:bg-gray-50/50 transition-colors">
                                                <td className="py-4 px-6">
                                                    <div className="flex items-center gap-3">
                                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm overflow-hidden shrink-0 ${isMasterAdmin ? 'bg-[#193153] text-[#ffdd59]' : 'bg-blue-100 text-[#193153]'}`}>
                                                            {user.avatar_url ? (
                                                                <img src={user.avatar_url} alt={user.name} className="w-full h-full object-cover" />
                                                            ) : (
                                                                (user.name || 'U').charAt(0).toUpperCase()
                                                            )}
                                                        </div>
                                                        <div>
                                                            <div className="font-semibold text-gray-900">{user.name}</div>
                                                            <div className="text-xs text-gray-500">{user.email}</div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-4 px-6">
                                                    {isMasterAdmin ? (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                                            <Shield className="w-3.5 h-3.5" />
                                                            Master Admin
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                                                            <User className="w-3.5 h-3.5" />
                                                            Applicant
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="py-4 px-6 text-gray-500 text-xs">
                                                    {user.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                                                </td>
                                                <td className="py-4 px-6 text-right">
                                                    {!isSelfOrMaster && (
                                                        <button
                                                            onClick={() => setUserToDelete(user)}
                                                            className="inline-flex items-center text-xs text-red-600 border border-red-200 hover:bg-red-50 hover:text-red-700 font-medium px-2.5 py-1.5 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-3.5 h-3.5 mr-1" />
                                                            <span>Delete</span>
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Delete Confirmation Modal */}
            {userToDelete && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
                        <div className="flex items-center gap-3 text-red-600">
                            <AlertCircle className="w-6 h-6 shrink-0" />
                            <h3 className="text-lg font-bold">Confirm User Deletion</h3>
                        </div>
                        <p className="text-sm text-gray-600">
                            Are you sure you want to delete the user account for <strong className="text-gray-900">{userToDelete.name}</strong> ({userToDelete.email})? This action cannot be undone.
                        </p>
                        <div className="flex justify-end gap-2 pt-3 border-t">
                            <button type="button" onClick={() => setUserToDelete(null)} className="px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                            <button type="button" onClick={handleDeleteUser} className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg">Delete User</button>
                        </div>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
