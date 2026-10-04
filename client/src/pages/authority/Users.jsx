import React, { useState, useEffect } from 'react';
import { getAllUsers, updateUserRole } from '../../api/users';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badges';
import { useToast } from '../../components/ui/Toast';
import { Shield, ShieldAlert, User as UserIcon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Users = () => {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user: currentUser } = useAuth();
  const { addToast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await getAllUsers();
      setUsers(res.data);
    } catch (err) {
      addToast({ type: 'error', message: 'Failed to fetch users' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await updateUserRole(userId, newRole);
      addToast({ type: 'success', message: `User role updated to ${newRole}` });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      addToast({ type: 'error', message: err.response?.data?.error?.message || 'Failed to update role' });
    }
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'ADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'AUTHORITY': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-slate-100 text-slate-800 border-slate-200';
    }
  };

  if (isLoading) {
    return <div className="p-8 text-center text-slate-500">Loading users...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">User Management</h1>
          <p className="text-slate-500 mt-1">Manage system access and assign authority roles.</p>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs uppercase tracking-wider text-slate-500 font-semibold">
                <th className="px-6 py-4">User</th>
                <th className="px-6 py-4">Email</th>
                <th className="px-6 py-4">Current Role</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {users.map(u => (
                <tr key={u._id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold mr-3">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-medium text-slate-900">{u.name}</div>
                        {u.rollNo && <div className="text-xs text-slate-500">{u.rollNo}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-600 text-sm">{u.email}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(u.role)}`}>
                      {u.role === 'ADMIN' && <ShieldAlert className="w-3 h-3 mr-1" />}
                      {u.role === 'AUTHORITY' && <Shield className="w-3 h-3 mr-1" />}
                      {u.role === 'STUDENT' && <UserIcon className="w-3 h-3 mr-1" />}
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right text-sm">
                    {u._id === currentUser?._id ? (
                      <span className="text-slate-400 italic">It's you</span>
                    ) : (
                      <select
                        className="text-sm border-slate-300 rounded-md shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value)}
                      >
                        <option value="STUDENT">Student</option>
                        <option value="AUTHORITY">Authority</option>
                        <option value="ADMIN">Admin</option>
                      </select>
                    )}
                  </td>
                </tr>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="4" className="px-6 py-8 text-center text-slate-500">No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};
