import React from 'react';
import TaskItem from './TaskItem';

export default function TaskList({
  tasks,
  isLoading,
  activeFilter,
  onToggleComplete,
  onEdit,
  onDelete,
}) {
  if (isLoading) {
    return (
      <div className="state-box">
        <div className="spinner" />
        <p className="state-title">Loading Tasks...</p>
        <p>Fetching tasks from production backend.</p>
      </div>
    );
  }

  if (tasks.length === 0) {
    const emptyMessages = {
      all: {
        title: 'No tasks found',
        desc: 'Get started by creating your first task above!',
      },
      pending: {
        title: 'No pending tasks',
        desc: 'Great job! You have cleared all pending items.',
      },
      completed: {
        title: 'No completed tasks yet',
        desc: 'Mark tasks as completed once you finish them.',
      },
    };

    const currentMsg = emptyMessages[activeFilter] || emptyMessages.all;

    return (
      <div className="state-box">
        <div className="state-icon">📋</div>
        <h3 className="state-title">{currentMsg.title}</h3>
        <p>{currentMsg.desc}</p>
      </div>
    );
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <TaskItem
          key={task._id}
          task={task}
          onToggleComplete={onToggleComplete}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}
