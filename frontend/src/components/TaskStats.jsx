import React from 'react';

export default function TaskStats({ total, pending, completed }) {
  return (
    <div className="stats-container">
      <div className="stat-card total">
        <span className="stat-label">Total Tasks</span>
        <span className="stat-value">{total}</span>
      </div>
      <div className="stat-card pending">
        <span className="stat-label">Pending</span>
        <span className="stat-value">{pending}</span>
      </div>
      <div className="stat-card completed">
        <span className="stat-label">Completed</span>
        <span className="stat-value">{completed}</span>
      </div>
    </div>
  );
}
