import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Check, CheckSquare } from 'lucide-react';

export default function TaskModal({ isOpen, onClose, task, staff, onSave }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('todo');
  const [priority, setPriority] = useState('medium');
  const [assignedStaff, setAssignedStaff] = useState('');
  
  // Insurance specific standard properties
  const [policyType, setPolicyType] = useState('General');
  const [policyNumber, setPolicyNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [amount, setAmount] = useState(0);

  // Checklists
  const [checklists, setChecklists] = useState([]);
  const [newChecklistText, setNewChecklistText] = useState('');

  // Unstructured dynamic metadata fields (Key-Value pairs)
  const [customFields, setCustomFields] = useState([]); // [{ key: '', value: '' }]

  // Reset or load task data when task changes or modal opens
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'todo');
      setPriority(task.priority || 'medium');
      setAssignedStaff(task.assignedStaff ? (typeof task.assignedStaff === 'object' ? task.assignedStaff._id : task.assignedStaff) : '');
      setPolicyType(task.policyType || 'General');
      setPolicyNumber(task.policyNumber || '');
      setClientName(task.clientName || '');
      setAmount(task.amount || 0);
      setChecklists(task.checklists || []);
      
      // Parse unstructuredData to customFields array
      if (task.unstructuredData) {
        const fields = Object.entries(task.unstructuredData).map(([k, v]) => ({
          key: k,
          value: v
        }));
        setCustomFields(fields);
      } else {
        setCustomFields([]);
      }
    } else {
      // Default blank values for new tasks
      setTitle('');
      setDescription('');
      setStatus('todo');
      setPriority('medium');
      setAssignedStaff('');
      setPolicyType('General');
      setPolicyNumber('');
      setClientName('');
      setAmount(0);
      setChecklists([]);
      setCustomFields([]);
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleAddChecklistItem = () => {
    if (!newChecklistText.trim()) return;
    setChecklists([...checklists, { text: newChecklistText.trim(), completed: false }]);
    setNewChecklistText('');
  };

  const toggleChecklistCompleted = (index) => {
    const updated = [...checklists];
    updated[index].completed = !updated[index].completed;
    setChecklists(updated);
  };

  const handleRemoveChecklistItem = (index) => {
    setChecklists(checklists.filter((_, idx) => idx !== index));
  };

  // Unstructured fields handlers
  const handleAddCustomField = () => {
    setCustomFields([...customFields, { key: '', value: '' }]);
  };

  const handleCustomFieldChange = (index, field, value) => {
    const updated = [...customFields];
    updated[index][field] = value;
    setCustomFields(updated);
  };

  const handleRemoveCustomField = (index) => {
    setCustomFields(customFields.filter((_, idx) => idx !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Convert customFields array back to unstructuredData object
    const unstructuredData = {};
    customFields.forEach(f => {
      if (f.key.trim()) {
        unstructuredData[f.key.trim()] = f.value;
      }
    });

    const payload = {
      title,
      description,
      status,
      priority,
      assignedStaff: assignedStaff || null,
      policyType,
      policyNumber,
      clientName,
      amount: Number(amount) || 0,
      checklists,
      unstructuredData
    };

    onSave(task ? task._id : null, payload);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-glass)', paddingBottom: '1rem' }}>
          <h2>{task ? 'Edit Insurance Work Details' : 'Write New Policy Task'}</h2>
          <button className="icon-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          
          <div className="form-group">
            <label>Work/Task Title</label>
            <input 
              type="text" 
              placeholder="e.g., Amount collection / Claim documentation" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              required
            />
          </div>

          <div className="form-group">
            <label>Task Description</label>
            <textarea 
              rows="3" 
              placeholder="Provide context or details about the work block..." 
              value={description} 
              onChange={e => setDescription(e.target.value)}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Status / Workflow Block</label>
              <select value={status} onChange={e => setStatus(e.target.value)}>
                <option value="todo">To-Do Pool (Unassigned)</option>
                <option value="current_work">Current Work (Singaravel/Suguna)</option>
                <option value="intermediate_work">Intermediate Work (Staffs/Admins)</option>
                <option value="outerworks">Outerworks (Outerworks Staff)</option>
                <option value="done">Completed / Archive</option>
              </select>
            </div>

            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Assigned Staff Member</label>
              <select value={assignedStaff} onChange={e => setAssignedStaff(e.target.value)}>
                <option value="">No Staff Assigned</option>
                {staff.map(s => (
                  <option key={s._id} value={s._id}>{s.name} ({s.role})</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Premium / Claim Amount (INR)</label>
              <input 
                type="number" 
                placeholder="₹ Amount" 
                value={amount} 
                onChange={e => setAmount(e.target.value)}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Policy Type</label>
              <select value={policyType} onChange={e => setPolicyType(e.target.value)}>
                <option value="General">General Insurance</option>
                <option value="Health">Health Insurance</option>
                <option value="Life">Life Insurance</option>
                <option value="Motor">Motor Insurance</option>
                <option value="Travel">Travel Insurance</option>
                <option value="Home">Home Insurance</option>
              </select>
            </div>

            <div className="form-group">
              <label>Policy Number</label>
              <input 
                type="text" 
                placeholder="e.g. STAR-HP-9088" 
                value={policyNumber} 
                onChange={e => setPolicyNumber(e.target.value)}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Client / Customer Name</label>
            <input 
              type="text" 
              placeholder="e.g. Ramesh Kumar" 
              value={clientName} 
              onChange={e => setClientName(e.target.value)}
            />
          </div>

          {/* Checklist Builder */}
          <div className="checklist-builder">
            <label>Sub-task Checklist</label>
            <div className="checklist-builder-row">
              <input 
                type="text" 
                placeholder="Add checklist item (e.g. Verify claim receipt)" 
                value={newChecklistText}
                onChange={e => setNewChecklistText(e.target.value)}
                style={{ flex: 1 }}
                onKeyDown={e => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddChecklistItem();
                  }
                }}
              />
              <button type="button" className="btn btn-secondary" onClick={handleAddChecklistItem}>
                <Plus size={18} />
              </button>
            </div>

            <div className="checklist-items-list">
              {checklists.map((item, index) => (
                <div key={index} className={`checklist-item-row ${item.completed ? 'completed' : ''}`}>
                  <div 
                    className={`custom-checkbox ${item.completed ? 'checked' : ''}`}
                    onClick={() => toggleChecklistCompleted(index)}
                  >
                    {item.completed && <Check size={12} />}
                  </div>
                  <span style={{ flex: 1, fontSize: '0.875rem' }}>{item.text}</span>
                  <button type="button" className="icon-btn" onClick={() => handleRemoveChecklistItem(index)} style={{ color: 'var(--danger)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Unstructured Custom Metadata Builder */}
          <div className="meta-fields-builder">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <label>Custom Unstructured Fields (For specific policy requirements)</label>
              <button type="button" className="btn btn-secondary" onClick={handleAddCustomField} style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}>
                <Plus size={12} /> Add Field
              </button>
            </div>
            
            {customFields.length === 0 && (
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>No custom fields added yet. Perfect for unstructured data like Vehicle details or Hospital records.</span>
            )}

            {customFields.map((field, index) => (
              <div key={index} className="meta-field-row">
                <input 
                  type="text" 
                  placeholder="Field Name (e.g. Vehicle Model)" 
                  value={field.key}
                  onChange={e => handleCustomFieldChange(index, 'key', e.target.value)}
                  style={{ padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
                />
                <input 
                  type="text" 
                  placeholder="Value (e.g. Swift Dzire)" 
                  value={field.value}
                  onChange={e => handleCustomFieldChange(index, 'value', e.target.value)}
                  style={{ padding: '0.375rem 0.5rem', fontSize: '0.8125rem' }}
                />
                <button type="button" className="icon-btn" onClick={() => handleRemoveCustomField(index)} style={{ color: 'var(--danger)' }}>
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '0.5rem', borderTop: '1px solid var(--border-glass)', paddingTop: '1.25rem' }}>
            <button type="button" className="btn btn-secondary" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {task ? 'Update Task' : 'Create Task'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
