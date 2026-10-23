import React from 'react';

export default function TaskFilter({ activeFilter, onFilterChange }) {
  const filters = [
    { id: 'all', label: 'All' },
    { id: 'pending', label: 'Pending' },
    { id: 'completed', label: 'Completed' },
  ];

  return (
    <div className="filter-group">
      {filters.map((f) => (
        <button
          key={f.id}
          className={`filter-btn ${activeFilter === f.id ? 'active' : ''}`}
          onClick={() => onFilterChange(f.id)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
