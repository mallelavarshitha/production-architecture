import React, { useState, useEffect } from 'react';

export default function TaskForm({ onSubmit, editingTask, onCancelEdit, isSubmitting }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (editingTask) {
      setTitle(editingTask.title || '');
      setDescription(editingTask.description || '');
      setErrors({});
    } else {
      setTitle('');
      setDescription('');
      setErrors({});
    }
  }, [editingTask]);

  const validate = () => {
    const errs = {};
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      errs.title = 'Task title is required.';
    } else if (trimmedTitle.length > 120) {
      errs.title = 'Title must not exceed 120 characters.';
    }

    if (description && description.length > 500) {
      errs.description = 'Description must not exceed 500 characters.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSubmit({
      title: title.trim(),
      description: description.trim(),
    });
  };

  return (
    <div className="card">
      <h2 className="card-title">
        <span>{editingTask ? '✏️ Edit Task' : '➕ Create New Task'}</span>
      </h2>

      <form onSubmit={handleSubmit} noValidate>
        <div className="form-group">
          <label className="form-label" htmlFor="task-title">
            Task Title <span style={{ color: 'var(--danger)' }}>*</span>
          </label>
          <input
            id="task-title"
            type="text"
            className={`form-input ${errors.title ? 'input-error' : ''}`}
            placeholder="e.g. Set up production Docker Compose"
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (errors.title) setErrors((prev) => ({ ...prev, title: null }));
            }}
            maxLength={120}
            disabled={isSubmitting}
          />
          {errors.title && <p className="form-error-msg">{errors.title}</p>}
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="task-description">
            Description <span style={{ color: 'var(--text-subtle)' }}>(Optional)</span>
          </label>
          <textarea
            id="task-description"
            className={`form-textarea ${errors.description ? 'input-error' : ''}`}
            placeholder="Provide context, acceptance criteria, or deployment notes..."
            rows={3}
            value={description}
            onChange={(e) => {
              setDescription(e.target.value);
              if (errors.description) setErrors((prev) => ({ ...prev, description: null }));
            }}
            maxLength={500}
            disabled={isSubmitting}
          />
          {errors.description && <p className="form-error-msg">{errors.description}</p>}
        </div>

        <div className="form-actions">
          {editingTask && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onCancelEdit}
              disabled={isSubmitting}
            >
              Cancel Edit
            </button>
          )}
          <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
            {isSubmitting
              ? 'Saving...'
              : editingTask
              ? 'Update Task'
              : 'Add Task'}
          </button>
        </div>
      </form>
    </div>
  );
}
