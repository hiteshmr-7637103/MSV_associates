import React from 'react';
import { ShieldAlert, FileText, CheckSquare, Trash2, Edit2, IndianRupee } from 'lucide-react';

export default function TaskCard({ task, staff, onUpdateTask, onDeleteTask, onEditTask }) {
  const completedChecklists = task.checklists ? task.checklists.filter(c => c.completed).length : 0;
  const totalChecklists = task.checklists ? task.checklists.length : 0;
  const progressPercent = totalChecklists > 0 ? (completedChecklists / totalChecklists) * 100 : 0;

  const handleDragStart = (e) => {
    e.dataTransfer.setData('taskId', task._id);
  };

  const handleStaffChange = (e) => {
    const staffId = e.target.value === 'unassigned' ? null : e.target.value;
    onUpdateTask(task._id, { assignedStaff: staffId });
  };

  // Safe checks for empty dynamic unstructured fields
  const hasUnstructuredData = task.unstructuredData && Object.keys(task.unstructuredData).length > 0;

  return (
    <div 
      className="task-card"
      draggable
      onDragStart={handleDragStart}
    >
      <div className="task-header">
        <h3 className="task-title">{task.title}</h3>
        <span className={`task-priority-badge priority-${task.priority}`}>
          {task.priority}
        </span>
      </div>

      {task.description && (
        <p className="task-desc">{task.description}</p>
      )}

      {/* Main policy fields */}
      <div className="task-meta-row" style={{ marginTop: '0.25rem' }}>
        {task.policyType && (
          <span className="policy-badge" title="Policy Type">
            <FileText size={12} />
            {task.policyType}
          </span>
        )}
        {task.policyNumber && (
          <span className="policy-badge" title="Policy Number" style={{ fontFamily: 'monospace' }}>
            #{task.policyNumber}
          </span>
        )}
        {task.clientName && (
          <span className="policy-badge" title="Client Name">
            👤 {task.clientName}
          </span>
        )}
        {task.amount > 0 && (
          <span className="amount-badge">
            ₹{task.amount.toLocaleString('en-IN')}
          </span>
        )}
      </div>

      {/* Render Dynamic unstructured fields (custom fields added by agent/admin) */}
      {hasUnstructuredData && (
        <div style={{ 
          fontSize: '0.75rem', 
          background: 'rgba(255,255,255,0.02)', 
          border: '1px dashed var(--border-glass)', 
          borderRadius: '6px',
          padding: '0.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.25rem'
        }}>
          {Object.entries(task.unstructuredData).map(([key, val]) => (
            <div key={key} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
              <span style={{ color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{key}:</span>
              <span style={{ color: 'var(--text-primary)', textAlign: 'right', fontWeight: '500' }}>{val}</span>
            </div>
          ))}
        </div>
      )}

      {/* Checklist section */}
      {totalChecklists > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem', marginTop: '0.25rem' }}>
          <div className="checklist-indicator">
            <CheckSquare size={13} style={{ color: progressPercent === 100 ? 'var(--success)' : 'var(--text-secondary)' }} />
            <span>Checklist: {completedChecklists}/{totalChecklists} ({Math.round(progressPercent)}%)</span>
          </div>
          <div className="progress-bar-bg">
            <div className="progress-bar-fill" style={{ width: `${progressPercent}%`, backgroundColor: progressPercent === 100 ? 'var(--success)' : 'var(--primary)' }}></div>
          </div>
        </div>
      )}

      <div className="task-footer">
        <select 
          className="assignment-dropdown"
          value={task.assignedStaff ? (typeof task.assignedStaff === 'object' ? task.assignedStaff._id : task.assignedStaff) : 'unassigned'}
          onChange={handleStaffChange}
        >
          <option value="unassigned">Assign Staff...</option>
          {staff.map(s => (
            <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
          ))}
        </select>

        <div style={{ display: 'flex', gap: '0.25rem' }}>
          <button className="icon-btn" onClick={() => onEditTask(task)} title="Edit Task details">
            <Edit2 size={14} />
          </button>
          <button className="icon-btn" onClick={() => onDeleteTask(task._id)} title="Delete Task" style={{ color: 'rgba(239, 68, 68, 0.7)' }}>
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
