import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import { usersApi } from '../services/api';
import Modal from '../components/Modal';

export default function UserManagementPanel() {
  const { token } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formLoading, setFormLoading] = useState(false);

  const [formName, setFormName] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPassword, setFormPassword] = useState('');
  const [formIsAdmin, setFormIsAdmin] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const result = await usersApi.getAll(token);
      setUsers(result.data || []);
    } catch (err) {
      setError('Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const clearForm = () => {
    setFormName('');
    setFormEmail('');
    setFormPassword('');
    setFormIsAdmin(false);
  };

  const showMessage = (msg, type = 'success') => {
    if (type === 'success') { setSuccess(msg); setError(''); }
    else { setError(msg); setSuccess(''); }
    setTimeout(() => { setSuccess(''); setError(''); }, 3000);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    try {
      await usersApi.create(token, { name: formName, email: formEmail, password: formPassword, isAdmin: formIsAdmin });
      showMessage('User created successfully!');
      setShowCreateModal(false);
      clearForm();
      fetchUsers();
    } catch (err) {
      showMessage(err.errors ? err.errors.map(e => e.msg).join(', ') : (err.message || 'Failed to create user'), 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setFormName(user.name || '');
    setFormEmail(user.email);
    setFormPassword('');
    setFormIsAdmin(user.isAdmin);
    setShowEditModal(true);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!editingUser) return;
    setFormLoading(true);
    try {
      await usersApi.update(token, editingUser.id, { name: formName, email: formEmail, password: formPassword, isAdmin: formIsAdmin });
      showMessage('User updated successfully!');
      setShowEditModal(false);
      clearForm();
      setEditingUser(null);
      fetchUsers();
    } catch (err) {
      showMessage(err.errors ? err.errors.map(e => e.msg).join(', ') : (err.message || 'Failed to update user'), 'error');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDeactivate = async (userId) => {
    if (!window.confirm('Are you sure you want to deactivate this user?')) return;
    try {
      await usersApi.deactivate(token, userId);
      showMessage('User deactivated successfully!');
      fetchUsers();
    } catch (err) {
      showMessage(err.message || 'Failed to deactivate user', 'error');
    }
  };

  const inputClass =
    'w-full px-4 py-3 bg-surface-input border border-border-default rounded-lg text-slate-100 text-sm outline-none transition-all duration-150 placeholder:text-slate-600 focus:border-blue-500 focus:ring-3 focus:ring-blue-500/15';

  const renderUserForm = (onSubmit, submitLabel) => (
    <form onSubmit={onSubmit}>
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide" htmlFor="user-name">Full Name</label>
        <input id="user-name" type="text" className={inputClass} placeholder="Enter name" value={formName} onChange={(e) => setFormName(e.target.value)} required />
      </div>
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide" htmlFor="user-email">Email</label>
        <input id="user-email" type="email" className={inputClass} placeholder="Enter email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} required />
      </div>
      <div className="mb-4">
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wide" htmlFor="user-password">
          Password {editingUser && <span className="text-slate-600 normal-case">(required for update)</span>}
        </label>
        <input id="user-password" type="password" className={inputClass} placeholder={editingUser ? 'Enter new password' : 'Enter password'} value={formPassword} onChange={(e) => setFormPassword(e.target.value)} required />
      </div>
      <div className="mb-5">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" className="w-[18px] h-[18px] accent-blue-500 cursor-pointer" checked={formIsAdmin} onChange={(e) => setFormIsAdmin(e.target.checked)} />
          <span className="text-sm text-slate-400">Set as Admin</span>
        </label>
      </div>
      <div className="flex justify-end gap-3">
        <button type="button" className="px-5 py-2.5 bg-surface-elevated border border-border-default rounded-lg text-sm font-semibold text-slate-100 hover:bg-surface-card-hover transition-all duration-150" onClick={() => { setShowCreateModal(false); setShowEditModal(false); clearForm(); }}>
          Cancel
        </button>
        <button type="submit" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg text-sm font-semibold text-white hover:from-blue-500 hover:to-blue-400 hover:shadow-[0_0_20px_rgba(51,120,255,0.3)] transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2" disabled={formLoading}>
          {formLoading ? <><div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Processing...</> : submitLabel}
        </button>
      </div>
    </form>
  );

  return (
    <div className="animate-page-enter">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div>
            <h1 className="text-[1.75rem] font-extrabold bg-gradient-to-r from-slate-100 to-blue-300 bg-clip-text text-transparent">👥 User Management</h1>
            <p className="text-slate-400 mt-1 text-sm">Manage user accounts and permissions</p>
          </div>
          <button onClick={() => { clearForm(); setShowCreateModal(true); }} id="create-user-btn" className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg text-sm font-semibold text-white hover:from-blue-500 hover:to-blue-400 hover:shadow-[0_0_20px_rgba(51,120,255,0.3)] hover:-translate-y-0.5 active:translate-y-0 transition-all duration-150">
            + Add User
          </button>
        </div>
      </div>

      {/* Alerts */}
      {success && <div className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2.5 mb-4 animate-slide-down bg-green-500/8 text-green-400 border border-green-500/20">✅ {success}</div>}
      {error && <div className="px-4 py-3 rounded-lg text-sm font-medium flex items-center gap-2.5 mb-4 animate-slide-down bg-red-500/8 text-red-400 border border-red-500/20">⚠️ {error}</div>}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-12 text-slate-500 text-sm gap-3">
          <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" /> Loading users...
        </div>
      ) : users.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <div className="text-5xl mb-4 opacity-30">👤</div>
          <div className="text-lg font-semibold text-slate-400 mb-2">No Users Found</div>
          <div className="text-slate-500 text-sm">Create a new user to get started.</div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/5">
          <table className="w-full border-collapse text-sm" id="users-table">
            <thead className="bg-surface-elevated">
              <tr>
                {['ID', 'Name', 'Email', 'Role', 'Status', 'Actions'].map((h) => (
                  <th key={h} className="px-4 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-slate-400 border-b border-border-default whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <tr key={user.id} className="transition-colors duration-150 hover:bg-blue-500/[0.04] border-b border-white/5 last:border-b-0">
                  <td className="px-4 py-3.5">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/20">#{user.id}</span>
                  </td>
                  <td className="px-4 py-3.5 font-semibold text-slate-100">{user.name || '-'}</td>
                  <td className="px-4 py-3.5 text-sm text-slate-300">{user.email}</td>
                  <td className="px-4 py-3.5">
                    {user.isAdmin
                      ? <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">🛡 Admin</span>
                      : <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-cyan-400/10 text-cyan-400 border border-cyan-400/20">👤 User</span>
                    }
                  </td>
                  <td className="px-4 py-3.5">
                    {user.isActive
                      ? <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">Active</span>
                      : <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-400 border border-red-500/20">Inactive</span>
                    }
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="flex gap-2">
                      <button onClick={() => openEditModal(user)} className="px-3 py-1.5 bg-surface-elevated border border-border-default rounded-lg text-xs font-semibold text-slate-100 hover:bg-surface-card-hover transition-all duration-150">
                        ✏️ Edit
                      </button>
                      <button onClick={() => handleDeactivate(user.id)} className="px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-500 rounded-lg text-xs font-semibold text-white hover:shadow-[0_0_20px_rgba(239,68,68,0.3)] transition-all duration-150">
                        🚫 Deactivate
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={showCreateModal} onClose={() => { setShowCreateModal(false); clearForm(); }} title="Create New User">
        {renderUserForm(handleCreate, 'Create User')}
      </Modal>

      {/* Edit Modal */}
      <Modal isOpen={showEditModal} onClose={() => { setShowEditModal(false); clearForm(); setEditingUser(null); }} title={`Edit User: ${editingUser?.name || ''}`}>
        {renderUserForm(handleUpdate, 'Update User')}
      </Modal>
    </div>
  );
}
