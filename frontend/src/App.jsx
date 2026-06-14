import React, { useState, useEffect } from 'react';
import WorkflowBoard from './components/WorkflowBoard.jsx';
import StaffList from './components/StaffList.jsx';
import TaskModal from './components/TaskModal.jsx';
import { Plus, Search, RefreshCw, Sparkles } from 'lucide-react';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [staff, setStaff] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPolicyFilter, setSelectedPolicyFilter] = useState('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Custom alerts/toasts
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'success') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Fetch initial data
  const fetchData = async () => {
    try {
      const [resTasks, resStaff] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/staff')
      ]);
      if (resTasks.ok && resStaff.ok) {
        const tasksData = await resTasks.json();
        const staffData = await resStaff.json();
        setTasks(tasksData);
        setStaff(staffData);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      showToast('Connection to server offline. Running in local cache mode.', 'warning');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Poll for updates every 5 seconds to support real-time sync across agents
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const handleCreateOrUpdateTask = async (id, taskData) => {
    try {
      if (id) {
        // Edit mode
        const res = await fetch(`/api/tasks/${id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
        if (res.ok) {
          const updated = await res.json();
          setTasks(prev => prev.map(t => t._id === id ? updated : t));
          showToast('Insurance task updated successfully.');
        }
      } else {
        // Create mode
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(taskData)
        });
        if (res.ok) {
          const created = await res.json();
          // Immediately sync staff model
          const matchedStaff = staff.find(s => s._id === created.assignedStaff);
          const formatted = { ...created, assignedStaff: matchedStaff || null };
          setTasks(prev => [...prev, formatted]);
          showToast('New policy task added to checklist.');
        }
      }
      setIsModalOpen(false);
      setEditingTask(null);
    } catch (error) {
      console.error('Error saving task:', error);
      showToast('Failed to save task.', 'danger');
    }
  };

  const handleQuickUpdateTask = async (id, partialData) => {
    try {
      const res = await fetch(`/api/tasks/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(partialData)
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks(prev => prev.map(t => t._id === id ? updated : t));
        showToast('Workflow status updated.');
      }
    } catch (error) {
      console.error('Error during quick update:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    if (!window.confirm('Are you sure you want to delete this insurance task?')) return;
    try {
      const res = await fetch(`/api/tasks/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setTasks(prev => prev.filter(t => t._id !== id));
        showToast('Task removed from workflow.', 'warning');
      }
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  const handleAddStaff = async (staffData) => {
    try {
      const res = await fetch('/api/staff', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(staffData)
      });
      if (res.ok) {
        const created = await res.json();
        setStaff(prev => [...prev, created]);
        showToast(`Agent ${created.name} registered successfully.`);
      }
    } catch (error) {
      console.error('Error registering agent:', error);
    }
  };

  const handleEditTaskClick = (task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Filter logic
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = 
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (task.clientName && task.clientName.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.policyNumber && task.policyNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (task.assignedStaff && task.assignedStaff.name.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesPolicy = selectedPolicyFilter === 'All' || task.policyType === selectedPolicyFilter;
    
    return matchesSearch && matchesPolicy;
  });

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="logo-section">
          <div className="logo-icon">🛡️</div>
          <div className="logo-text">
            <h1>MSV Associates</h1>
            <p>Insurance & Policy Workflow</p>
          </div>
        </div>

        <div className="header-actions">
          <button className="btn btn-secondary" onClick={fetchData} title="Sync Board">
            <RefreshCw size={16} />
            Sync
          </button>
          <button className="btn btn-primary" onClick={() => { setEditingTask(null); setIsModalOpen(true); }}>
            <Plus size={16} />
            Write Policy Task
          </button>
        </div>
      </header>

      {/* Control panel for filters */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        padding: '1rem 2rem 0 2rem', 
        maxWidth: '1600px', 
        width: '100%', 
        margin: '0 auto',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative', minWidth: '280px', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-secondary)' }} />
          <input 
            type="text" 
            placeholder="Search by client, policy number, title or agent..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '2.5rem', width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
          <label style={{ fontSize: '0.75rem' }}>Filter Policy:</label>
          <select 
            value={selectedPolicyFilter} 
            onChange={e => setSelectedPolicyFilter(e.target.value)}
            style={{ padding: '0.5rem 1rem' }}
          >
            <option value="All">All Policies</option>
            <option value="General">General</option>
            <option value="Health">Health</option>
            <option value="Life">Life</option>
            <option value="Motor">Motor</option>
            <option value="Travel">Travel</option>
            <option value="Home">Home</option>
          </select>
        </div>
      </div>

      <main className="dashboard-content">
        <aside>
          <StaffList 
            staff={staff} 
            tasks={tasks}
            onAddStaff={handleAddStaff}
          />
        </aside>

        <section style={{ overflowX: 'auto' }}>
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px' }}>
              <div className="loader">Loading workflow board...</div>
            </div>
          ) : (
            <WorkflowBoard 
              tasks={filteredTasks} 
              staff={staff}
              onUpdateTask={handleQuickUpdateTask}
              onDeleteTask={handleDeleteTask}
              onEditTask={handleEditTaskClick}
            />
          )}
        </section>
      </main>

      {/* Task Modal for Creation and Updates */}
      <TaskModal 
        isOpen={isModalOpen}
        onClose={() => { setIsModalOpen(false); setEditingTask(null); }}
        task={editingTask}
        staff={staff}
        onSave={handleCreateOrUpdateTask}
      />

      {/* Toast Alert Notifications */}
      <div className="toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <Sparkles size={16} style={{ color: t.type === 'warning' ? 'var(--warning)' : 'var(--success)' }} />
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
