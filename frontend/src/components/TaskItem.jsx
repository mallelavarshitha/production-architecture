import React from 'react';

export default function TaskItem({ task, onToggleComplete, onEdit, onDelete }) {
  const formatDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className={`task-item ${task.completed ? 'completed' : ''}`}>
      <div className="task-checkbox-wrapper">
        <input
          type="checkbox"
          className="task-checkbox"
          checked={task.completed}
          onChange={() => onToggleComplete(task)}
          aria-label={`Mark task '${task.title}' as ${task.completed ? 'pending' : 'completed'}`}
        />
      </div>

      <div className="task-content">
        <h3 className="task-title">{task.title}</h3>
        {task.description && <p className="task-desc">{task.description}</p>}
        <div className="task-meta">
          <span>Created: {formatDate(task.createdAt)}</span>
          {task.updatedAt && task.updatedAt !== task.createdAt && (
            <span>Updated: {formatDate(task.updatedAt)}</span>
          )}
        </div>
      </div>

      <div className="task-actions">
        <button
          className="action-icon-btn"
          onClick={() => onEdit(task)}
          title="Edit task"
          aria-label="Edit task"
        >
          ✏️ Edit
        </button>
        <button
          className="action-icon-btn delete"
          onClick={() => onDelete(task)}
          title="Delete task"
          aria-label="Delete task"
        >
          🗑️ Delete
        </button>
      </div>
    </div>
  );
}
