import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import { UserPlus, UserX } from 'lucide-react';

const Users = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [newUser, setNewUser] = useState({ username: '', password: '', role: 'CAMPAIGN_MANAGER' });

    const fetchUsers = async () => {
        try {
            const { data } = await api.get('/admin/users');
            setUsers(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            await api.post('/admin/users', newUser);
            setNewUser({ username: '', password: '', role: 'CAMPAIGN_MANAGER' });
            fetchUsers();
            alert('User created');
        } catch (error) {
            alert(error.response?.data?.message || 'Failed');
        }
    };

    const handleDeactivate = async (id) => {
        if (!confirm('Deactivate user?')) return;
        try {
            await api.patch(`/admin/users/${id}/deactivate`);
            fetchUsers();
        } catch (error) {
            alert('Failed');
        }
    };

    return (
        <div>
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Admin Users</h1>

            {/* Create Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 max-w-2xl">
                <h3 className="font-semibold mb-4 text-gray-700 flex items-center gap-2"><UserPlus size={20} /> Create New Admin</h3>
                <form onSubmit={handleCreate} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                    <div>
                        <input required placeholder="Username" className="w-full border rounded px-3 py-2 text-sm" value={newUser.username} onChange={e => setNewUser({ ...newUser, username: e.target.value })} />
                    </div>
                    <div>
                        <input required placeholder="Password" type="password" className="w-full border rounded px-3 py-2 text-sm" value={newUser.password} onChange={e => setNewUser({ ...newUser, password: e.target.value })} />
                    </div>
                    <div>
                        <select className="w-full border rounded px-3 py-2 text-sm" value={newUser.role} onChange={e => setNewUser({ ...newUser, role: e.target.value })}>
                            <option value="CAMPAIGN_MANAGER">Campaign Manager</option>
                            <option value="ANALYST">Analyst</option>
                            <option value="SUPER_ADMIN">Super Admin</option>
                        </select>
                    </div>
                    <button type="submit" className="bg-indigo-600 text-white px-4 py-2 rounded text-sm hover:bg-indigo-700">Create</button>
                </form>
            </div>

            {/* Users List */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-gray-50 text-gray-500 text-sm">
                        <tr>
                            <th className="px-6 py-4">Username</th>
                            <th className="px-6 py-4">Role</th>
                            <th className="px-6 py-4">Status</th>
                            <th className="px-6 py-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="px-6 py-4 font-medium">{u.username}</td>
                                <td className="px-6 py-4 text-sm text-gray-500">{u.role}</td>
                                <td className="px-6 py-4">
                                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${u.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                                        {u.isActive ? 'Active' : 'Inactive'}
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    {u.isActive && u.username !== 'admin' && (
                                        <button onClick={() => handleDeactivate(u.id)} className="text-red-500 hover:bg-red-50 p-2 rounded" title="Deactivate">
                                            <UserX size={18} />
                                        </button>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Users;
