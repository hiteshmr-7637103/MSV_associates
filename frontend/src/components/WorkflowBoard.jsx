import React, { useState } from 'react';
import TaskCard from './TaskCard.jsx';
import { ClipboardList, Play, Layers, Send, CheckCircle2 } from 'lucide-react';

const COLUMNS = [
  { id: 'todo', title: 'Checklist / To-Do Pool', icon: <ClipboardList size={18} />, color: '#6b7280' },
  { id: 'current_work', title: 'Current Work (Singaravel/Suguna)', icon: <Play size={18} style={{ color: '#ec4899' }} />, color: '#ec4899' },
  { id: 'intermediate_work', title: 'Intermediate Work (Staffs/Admins)', icon: <Layers size={18} style={{ color: '#8b5cf6' }} />, color: '#8b5cf6' },
  { id: 'outerworks', title: 'Outerworks (Outer Staff)', icon: <Send size={18} style={{ color: '#f59e0b' }} />, color: '#f59e0b' },
  { id: 'done', title: 'Done / Archived', icon: <CheckCircle2 size={18} style={{ color: '#10b981' }} />, color: '#10b981' }
];

export default function WorkflowBoard({ tasks, staff, onUpdateTask, onDeleteTask, onEditTask }) {
  const [dragOverColumn, setDragOverColumn] = useState(null);

  const handleDragOver = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(columnId);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e, columnId) => {
    e.preventDefault();
    setDragOverColumn(null);
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      onUpdateTask(taskId, { status: columnId });
    }
  };

  const getFilteredTasks = (columnId) => {
    return tasks.filter(t => t.status === columnId);
  };

  return (
    <div className="board-container">
      {COLUMNS.map(col => {
        const colTasks = getFilteredTasks(col.id);
        const isOver = dragOverColumn === col.id;

        return (
          <div 
            key={col.id} 
            className={`board-column ${isOver ? 'drag-over' : ''}`}
            onDragOver={(e) => handleDragOver(e, col.id)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, col.id)}
          >
            <div className="column-header" style={{ borderBottomColor: col.color }}>
              <div className="column-title-wrapper">
                {col.icon}
                <span className="column-title" style={{ color: col.color }}>{col.title.split(' (')[0]}</span>
              </div>
              <span className="task-count">{colTasks.length}</span>
            </div>
            
            {/* Show subtitle descriptions for clarification */}
            <span style={{ fontSize: '0.725rem', color: 'var(--text-muted)', marginTop: '-0.5rem', display: 'block' }}>
              {col.title.includes('(') ? col.title.substring(col.title.indexOf('(')) : ''}
            </span>

            <div className="column-body">
              {colTasks.length === 0 ? (
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center', 
                  flex: 1, 
                  border: '1px dashed var(--border-glass)', 
                  borderRadius: '12px',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  padding: '2rem 1rem',
                  textAlign: 'center'
                }}>
                  Drop tasks here
                </div>
              ) : (
                colTasks.map(task => (
                  <TaskCard 
                    key={task._id} 
                    task={task} 
                    staff={staff}
                    onUpdateTask={onUpdateTask}
                    onDeleteTask={onDeleteTask}
                    onEditTask={onEditTask}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
