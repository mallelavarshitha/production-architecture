import React from 'react';

export default function Notification({ notification, onClose }) {
  if (!notification || !notification.message) return null;

  return (
    <div className={`notification-banner ${notification.type}`}>
      <span>{notification.message}</span>
      <button
        onClick={onClose}
        className="notification-close-btn"
        aria-label="Dismiss notification"
      >
        &times;
      </button>
    </div>
  );
}
