import React, { useState } from 'react';
import { Users, UserPlus, Shield, User, Globe } from 'lucide-react';

export default function StaffList({ staff, tasks, onAddStaff }) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [name, setName] = useState('');
  const [role, setRole] = useState('Staff');
  const [workBlock, setWorkBlock] = useState('current_work');

  const getWorkloadCount = (staffId) => {
    return tasks.filter(t => t.assignedStaff && t.assignedStaff._id === staffId && t.status !== 'done').length;
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'Admin': return <Shield size={16} className="text-red-500" style={{ color: '#ef4444' }} />;
      case 'Outerworks Staff': return <Globe size={16} className="text-amber-500" style={{ color: '#f59e0b' }} />;
      default: return <User size={16} className="text-blue-500" style={{ color: '#3b82f6' }} />;
    }
  };

  const getWorkBlockLabel = (block) => {
    switch (block) {
      case 'current_work': return 'Current Work';
      case 'intermediate_work': return 'Intermediate Work';
      case 'outerworks': return 'Outerworks';
      default: return block;
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Generate a nice random color for avatar
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#14b8a6', '#6366f1'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];

    onAddStaff({
      name,
      role,
      workBlock,
      avatarColor: randomColor
    });

    setName('');
    setShowAddForm(false);
  };

  return (
    <div className="sidebar-panel">
      <div className="panel-title">
        <Users size={20} style={{ color: '#3b82f6' }} />
        <h2>MSV Team</h2>
      </div>

      <div className="staff-list">
        {staff.map(s => (
          <div key={s._id} className="staff-item">
            <div className="staff-info">
              <div className="avatar" style={{ backgroundColor: s.avatarColor || '#3b82f6' }}>
                {s.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <div className="staff-name">{s.name}</div>
                <div className="staff-meta" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {getRoleIcon(s.role)}
                  <span>{s.role} • {getWorkBlockLabel(s.workBlock)}</span>
                </div>
              </div>
            </div>
            <div className="workload-badge" title="Active assigned tasks">
              {getWorkloadCount(s._id)}
            </div>
          </div>
        ))}
      </div>

      {!showAddForm ? (
        <button className="btn btn-secondary" onClick={() => setShowAddForm(true)} style={{ width: '100%', justifyContent: 'center' }}>
          <UserPlus size={16} />
          Add Agent
        </button>
      ) : (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '0.5rem' }}>
          <div className="form-group">
            <label>Agent Name</label>
            <input 
              type="text" 
              placeholder="e.g. Suguna" 
              value={name} 
              onChange={e => setName(e.target.value)} 
              required
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            />
          </div>

          <div className="form-group">
            <label>System Role</label>
            <select 
              value={role} 
              onChange={e => setRole(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            >
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
              <option value="Outerworks Staff">Outerworks Staff</option>
            </select>
          </div>

          <div className="form-group">
            <label>Assigned Block</label>
            <select 
              value={workBlock} 
              onChange={e => setWorkBlock(e.target.value)}
              style={{ padding: '0.5rem 0.75rem', fontSize: '0.875rem' }}
            >
              <option value="current_work">Current Work (Singaravel/Suguna)</option>
              <option value="intermediate_work">Intermediate Work (Staffs/Admins)</option>
              <option value="outerworks">Outerworks (Outerworks Staff)</option>
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.25rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '0.5rem', justifyContent: 'center' }}>
              Save
            </button>
            <button type="button" className="btn btn-secondary" onClick={() => setShowAddForm(false)} style={{ flex: 1, padding: '0.5rem', justifyContent: 'center' }}>
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
