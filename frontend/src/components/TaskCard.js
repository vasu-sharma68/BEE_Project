import React, { useState } from 'react';
import { format } from 'date-fns';
import '../styles/App.css';
import checklistIcon from './checklist.png';

function TaskCard({ task, onUpdate, onDelete, onToggleComplete, onViewDateInCalendar }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedDescription, setEditedDescription] = useState(task.description);

  const handleSaveEdit = async () => {
    if (editedTitle.trim()) {
      await onUpdate({
        title: editedTitle,
        description: editedDescription,
      });
      setIsEditing(false);
    }
  };

  const formatDueDate = (date) => {
    if (!date) return null;
    return format(new Date(date), 'MMM d, yyyy');
  };

  return (
    <div
      className={`task-card ${task.priority} ${
        task.completed ? 'completed' : ''
      }`}
    >
      {!isEditing ? (
        <>
          <div className="task-header">
            <div className="task-title">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => onToggleComplete(task._id, !task.completed)}
                style={{ marginRight: '10px', cursor: 'pointer' }}
              />
              <span className={task.completed ? 'task-completed' : ''}>
                {task.title}
              </span>
            </div>
          </div>

          <div className="task-meta">
            <span className={`priority-badge priority-${task.priority}`}>
              {task.priority}
            </span>
            {task.dueDate && (
              <span
                onClick={() => onViewDateInCalendar && onViewDateInCalendar(task.dueDate)}
                style={{ cursor: 'pointer', textDecoration: 'underline' }}
              >
                <img src={checklistIcon} alt="Due date" style={{ width: '16px', height: '16px', marginRight: '5px' }} />
                {formatDueDate(task.dueDate)}
              </span>
            )}
          </div>

          {task.description && (
            <div className="task-description">{task.description}</div>
          )}

          <div className="task-actions">
            <button
              className="btn-action btn-edit"
              onClick={() => setIsEditing(true)}
            >
              Edit
            </button>
            <button
              className="btn-action btn-delete"
              onClick={() => onDelete(task._id)}
            >
              Delete
            </button>
          </div>
        </>
      ) : (
        <>
          <div className="form-group">
            <label htmlFor={`title-${task._id}`}>Title</label>
            <input
              id={`title-${task._id}`}
              type="text"
              value={editedTitle}
              onChange={(e) => setEditedTitle(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label htmlFor={`desc-${task._id}`}>Description</label>
            <textarea
              id={`desc-${task._id}`}
              value={editedDescription}
              onChange={(e) => setEditedDescription(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              className="btn btn-primary btn-small"
              onClick={handleSaveEdit}
            >
              Save
            </button>
            <button
              className="btn btn-secondary btn-small"
              onClick={() => setIsEditing(false)}
            >
              Cancel
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default TaskCard;
