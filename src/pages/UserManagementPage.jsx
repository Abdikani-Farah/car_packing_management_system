import React, { useState, useEffect } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Search,
  CheckCircle2,
  XCircle,
  Trash2,
  Lock,
  Mail,
  Phone,
  UserCheck,
  AlertCircle,
  KeyRound,
  RefreshCw,
} from 'lucide-react';
import { useAuth, ROLE_PERMISSIONS } from '../context/AuthContext';
import authService from '../services/authService';

export default function UserManagementPage() {
  const { user: currentUser, role: currentRole, hasPermission } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [error, setError] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    role: 'attendant',
    phone: '',
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await authService.getUsers();
      if (Array.isArray(data)) {
        setUsers(data);
      } else {
        setUsers([]);
      }
    } catch (err) {
      setError(err.message || 'Failed to load user accounts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      await authService.createUser(formData);
      setSuccessMsg(`User ${formData.name} created successfully!`);
      setShowAddModal(false);
      setFormData({
        name: '',
        email: '',
        password: 'password123',
        role: 'attendant',
        phone: '',
      });
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err) {
      setError(err.message || 'Failed to create user account');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      await authService.updateUserRole(userId, { role: newRole });
      setSuccessMsg(`Role updated to ${newRole}`);
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to update role');
    }
  };

  const handleStatusToggle = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'active' ? 'suspended' : 'active';
    try {
      await authService.updateUserRole(userId, { status: nextStatus });
      setSuccessMsg(`User status set to ${nextStatus}`);
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to toggle status');
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    if (!window.confirm(`Are you sure you want to delete user "${userName}"?`)) return;
    try {
      await authService.deleteUser(userId);
      setSuccessMsg(`User ${userName} deleted`);
      fetchUsers();
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err) {
      setError(err.message || 'Failed to delete user');
    }
  };

  const filteredUsers = users.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      (u.phone && u.phone.includes(search));
    const matchesRole = selectedRole === 'all' || u.role === selectedRole;
    return matchesSearch && matchesRole;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 text-white shadow-xl border border-indigo-900/50 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-indigo-600/30 rounded-lg text-indigo-400 border border-indigo-500/30">
              <Shield className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight">Role & User Management</h2>
          </div>
          <p className="text-slate-300 text-xs md:text-sm max-w-2xl">
            Configure access credentials, assign staff roles (Admin, Manager, Attendant, Customer), and manage security permissions across ParkMaster Pro.
          </p>
        </div>

        {hasPermission('canManageUsers') && (
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-semibold text-xs transition-all shadow-lg flex items-center space-x-2 border border-indigo-400/30 shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>+ Create Staff Account</span>
          </button>
        )}
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm flex items-center space-x-2 animate-fadeIn">
          <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Role Summary Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Object.entries(ROLE_PERMISSIONS).map(([roleKey, roleMeta]) => {
          const count = users.filter((u) => u.role === roleKey).length;
          return (
            <div
              key={roleKey}
              onClick={() => setSelectedRole(selectedRole === roleKey ? 'all' : roleKey)}
              className={`p-4 rounded-xl border transition-all cursor-pointer ${
                selectedRole === roleKey
                  ? 'bg-indigo-50/80 border-indigo-300 shadow-md ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${roleMeta.badgeColor}`}>
                  {roleMeta.label}
                </span>
                <span className="text-xl font-black text-slate-800">{count}</span>
              </div>
              <p className="text-[11px] text-slate-500 line-clamp-2 mt-1">
                {roleKey === 'admin' && 'Full system control, pricing edits, user creation.'}
                {roleKey === 'manager' && 'Manage spaces, vehicles, customers & analytics.'}
                {roleKey === 'attendant' && 'Entry/exit processing, payments & space views.'}
                {roleKey === 'customer' && 'Self-service space finder & active session status.'}
              </p>
            </div>
          );
        })}
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, email or phone..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs focus:bg-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto justify-end">
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:border-indigo-500"
          >
            <option value="all">All Roles ({users.length})</option>
            <option value="admin">Admin</option>
            <option value="manager">Manager</option>
            <option value="attendant">Attendant</option>
            <option value="customer">Customer</option>
          </select>

          <button
            onClick={fetchUsers}
            className="p-2 text-slate-500 hover:text-indigo-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
            title="Refresh Users"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-500">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-2" />
            <p className="text-sm font-medium">Loading user accounts...</p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Users className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-base font-bold text-slate-700">No users found</p>
            <p className="text-xs text-slate-400 mt-1">Try searching with a different keyword or role filter.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-600 uppercase font-semibold text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">User Details</th>
                  <th className="py-3.5 px-4">Contact</th>
                  <th className="py-3.5 px-4">Assigned Role</th>
                  <th className="py-3.5 px-4">Account Status</th>
                  {currentRole === 'admin' && <th className="py-3.5 px-4 text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => {
                  const roleMeta = ROLE_PERMISSIONS[u.role] || ROLE_PERMISSIONS.customer;
                  const isSelf = currentUser?._id === u._id;

                  return (
                    <tr key={u._id} className="hover:bg-slate-50/60 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 text-white font-bold text-xs flex items-center justify-center shadow-xs shrink-0">
                            {u.avatar || u.name.slice(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 text-xs">{u.name}</span>
                              {isSelf && (
                                <span className="bg-indigo-50 text-indigo-700 border border-indigo-200 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                                  You
                                </span>
                              )}
                            </div>
                            <span className="text-[11px] text-slate-500 block truncate">{u.title || roleMeta.label}</span>
                          </div>
                        </div>
                      </td>

                      <td className="py-3 px-4 space-y-0.5">
                        <div className="flex items-center space-x-1.5 text-slate-700">
                          <Mail className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{u.email}</span>
                        </div>
                        {u.phone && (
                          <div className="flex items-center space-x-1.5 text-slate-500 text-[11px]">
                            <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{u.phone}</span>
                          </div>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        {currentRole === 'admin' && !isSelf ? (
                          <select
                            value={u.role}
                            onChange={(e) => handleRoleChange(u._id, e.target.value)}
                            className={`text-xs font-bold px-2.5 py-1 rounded-lg border outline-none cursor-pointer transition-colors ${roleMeta.badgeColor}`}
                          >
                            <option value="admin">Admin</option>
                            <option value="manager">Manager</option>
                            <option value="attendant">Attendant</option>
                            <option value="customer">Customer</option>
                          </select>
                        ) : (
                          <span className={`inline-flex items-center space-x-1.5 text-[11px] font-bold px-2.5 py-1 rounded-full border ${roleMeta.badgeColor}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${roleMeta.dotColor}`} />
                            <span>{roleMeta.label}</span>
                          </span>
                        )}
                      </td>

                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center space-x-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                            u.status === 'active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {u.status === 'active' ? (
                            <>
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Active</span>
                            </>
                          ) : (
                            <>
                              <XCircle className="w-3 h-3 text-rose-600" />
                              <span>Suspended</span>
                            </>
                          )}
                        </span>
                      </td>

                      {currentRole === 'admin' && (
                        <td className="py-3 px-4 text-right">
                          {!isSelf && (
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => handleStatusToggle(u._id, u.status)}
                                className="p-1.5 text-slate-500 hover:text-amber-600 hover:bg-amber-50 rounded-md transition-colors"
                                title={u.status === 'active' ? 'Suspend Account' : 'Activate Account'}
                              >
                                <Lock className="w-3.5 h-3.5" />
                              </button>
                              <button
                                onClick={() => handleDeleteUser(u._id, u.name)}
                                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-md transition-colors"
                                title="Delete Account"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create User Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-scaleUp">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100 mb-4">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-indigo-600" />
                <h3 className="font-bold text-base text-slate-800">Create Staff Account</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1 rounded-md"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateUser} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Hassan Ahmed"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="e.g. hassan@parkmaster.com"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Role Permission *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none bg-white font-medium"
                >
                  <option value="admin">Admin (Full Control)</option>
                  <option value="manager">Manager (Operations & Reports)</option>
                  <option value="attendant">Gate Attendant (Entry/Exit/Payments)</option>
                  <option value="customer">Customer / Driver (Visitor Portal)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="e.g. +252 61 000 0000"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Password *</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  placeholder="Password"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none"
                />
              </div>

              <div className="pt-3 flex items-center justify-end space-x-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-xl text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-semibold hover:bg-indigo-500 shadow-md"
                >
                  Create Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
