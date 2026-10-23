import React, { useState, useEffect, useMemo } from 'react';
import HealthBadge from './components/HealthBadge';
import Notification from './components/Notification';
import TaskStats from './components/TaskStats';
import TaskFilter from './components/TaskFilter';
import TaskForm from './components/TaskForm';
import TaskList from './components/TaskList';
import ConfirmModal from './components/ConfirmModal';

export default function App() {
  const [tasks, setTasks] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [notification, setNotification] = useState(null);
  const [editingTask, setEditingTask] = useState(null);
  const [deleteModal, setDeleteModal] = useState({ isOpen: false, task: null });
  const [filter, setFilter] = useState('all');

  const showNotification = (message, type = 'success') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification((curr) => (curr?.message === message ? null : curr));
    }, 4500);
  };

  // Fetch all tasks from production API
  const fetchTasks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tasks');
      const data = await res.json();
      if (res.ok && data.success) {
        setTasks(data.data || []);
      } else {
        showNotification(data.error || 'Failed to load tasks from server.', 'error');
      }
    } catch (err) {
      showNotification('Unable to connect to backend API. Please verify server status.', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // Form submission: Create or Update
  const handleFormSubmit = async (formData) => {
    setIsSubmitting(true);
    try {
      if (editingTask) {
        // Update existing task
        const res = await fetch(`/api/tasks/${editingTask._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setTasks((prev) =>
            prev.map((t) => (t._id === editingTask._id ? data.data : t))
          );
          setEditingTask(null);
          showNotification('Task updated successfully!');
        } else {
          showNotification(data.error || 'Failed to update task.', 'error');
        }
      } else {
        // Create new task
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setTasks((prev) => [data.data, ...prev]);
          showNotification('Task created successfully!');
        } else {
          showNotification(data.error || 'Failed to create task.', 'error');
        }
      }
    } catch (err) {
      showNotification('Server communication error. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Toggle task completion status
  const handleToggleComplete = async (task) => {
    const updatedStatus = !task.completed;
    // Optimistic UI update
    setTasks((prev) =>
      prev.map((t) => (t._id === task._id ? { ...t, completed: updatedStatus } : t))
    );

    try {
      const res = await fetch(`/api/tasks/${task._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: updatedStatus }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        // Rollback on failure
        setTasks((prev) =>
          prev.map((t) => (t._id === task._id ? { ...t, completed: !updatedStatus } : t))
        );
        showNotification(data.error || 'Failed to update task status.', 'error');
      }
    } catch (err) {
      // Rollback on network error
      setTasks((prev) =>
        prev.map((t) => (t._id === task._id ? { ...t, completed: !updatedStatus } : t))
      );
      showNotification('Network error while toggling task completion.', 'error');
    }
  };

  // Open delete confirmation modal
  const handleOpenDeleteModal = (task) => {
    setDeleteModal({ isOpen: true, task });
  };

  // Confirm deletion
  const handleConfirmDelete = async () => {
    const taskToDelete = deleteModal.task;
    if (!taskToDelete) return;

    try {
      const res = await fetch(`/api/tasks/${taskToDelete._id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setTasks((prev) => prev.filter((t) => t._id !== taskToDelete._id));
        if (editingTask?._id === taskToDelete._id) {
          setEditingTask(null);
        }
        showNotification(`Task "${taskToDelete.title}" deleted.`);
      } else {
        showNotification(data.error || 'Failed to delete task.', 'error');
      }
    } catch (err) {
      showNotification('Network error during deletion.', 'error');
    } finally {
      setDeleteModal({ isOpen: false, task: null });
    }
  };

  // Calculate statistics
  const totalCount = tasks.length;
  const pendingCount = tasks.filter((t) => !t.completed).length;
  const completedCount = tasks.filter((t) => t.completed).length;

  // Filter tasks based on active selection
  const filteredTasks = useMemo(() => {
    if (filter === 'pending') return tasks.filter((t) => !t.completed);
    if (filter === 'completed') return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  return (
    <div className="app-container">
      {/* Top Header */}
      <header className="app-header">
        <div className="brand-wrapper">
          <div className="brand-icon">✓</div>
          <div>
            <h1 className="brand-title">Project 75 — Production Architecture</h1>
            <p className="brand-subtitle">
              MERN Stack Task Management Dashboard &bull; Multi-Container Architecture
            </p>
          </div>
        </div>
        <HealthBadge />
      </header>

      {/* Alerts / Notifications */}
      <Notification
        notification={notification}
        onClose={() => setNotification(null)}
      />

      {/* Counts / Stats */}
      <TaskStats
        total={totalCount}
        pending={pendingCount}
        completed={completedCount}
      />

      {/* Task Creation / Edit Form */}
      <TaskForm
        onSubmit={handleFormSubmit}
        editingTask={editingTask}
        onCancelEdit={() => setEditingTask(null)}
        isSubmitting={isSubmitting}
      />

      {/* Filter and Task Listing */}
      <div className="toolbar-container">
        <TaskFilter activeFilter={filter} onFilterChange={setFilter} />
        <button
          className="btn btn-secondary"
          onClick={fetchTasks}
          disabled={isLoading}
          title="Refresh task list"
        >
          🔄 Refresh
        </button>
      </div>

      <TaskList
        tasks={filteredTasks}
        isLoading={isLoading}
        activeFilter={filter}
        onToggleComplete={handleToggleComplete}
        onEdit={(task) => {
          setEditingTask(task);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onDelete={handleOpenDeleteModal}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteModal.isOpen}
        title="Delete Task"
        message={`Are you sure you want to delete "${deleteModal.task?.title}"? This action cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteModal({ isOpen: false, task: null })}
      />

      <footer className="app-footer">
        <p>
          Project 75 &bull; Isolated Container Network &bull; Zero Impact on Project 20
        </p>
      </footer>
    </div>
  );
}
