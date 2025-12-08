"use client";

import { FC, useEffect, useState } from "react";
import { FiCheckCircle, FiAlertCircle, FiX, FiInfo, FiAlertTriangle } from "react-icons/fi";

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastData {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
  duration?: number;
}

export interface ToastProps extends ToastData {
  onClose: (id: string) => void;
}

const Toast: FC<ToastProps> = ({ 
  id, 
  type, 
  title, 
  message, 
  duration = 5000, 
  onClose 
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    const showTimer = setTimeout(() => setIsVisible(true), 100);
    const dismissTimer = setTimeout(handleClose, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(dismissTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => onClose(id), 300);
  };

  const getToastStyles = () => {
    const styles = {
      success: {
        icon: <FiCheckCircle className="text-green-500" size={20} />,
        bg: 'bg-green-50 border-green-200',
        title: 'text-green-800',
        message: 'text-green-700'
      },
      error: {
        icon: <FiAlertCircle className="text-red-500" size={20} />,
        bg: 'bg-red-50 border-red-200',
        title: 'text-red-800',
        message: 'text-red-700'
      },
      warning: {
        icon: <FiAlertTriangle className="text-yellow-500" size={20} />,
        bg: 'bg-yellow-50 border-yellow-200',
        title: 'text-yellow-800',
        message: 'text-yellow-700'
      },
      info: {
        icon: <FiInfo className="text-blue-500" size={20} />,
        bg: 'bg-blue-50 border-blue-200',
        title: 'text-blue-800',
        message: 'text-blue-700'
      }
    };
    return styles[type];
  };

  const styles = getToastStyles();

  return (
    <div
      className={`
        flex items-start gap-3 p-4 rounded-lg border shadow-lg max-w-md
        ${styles.bg}
        transform transition-all duration-300 ease-in-out
        ${isVisible && !isLeaving 
          ? 'translate-x-0 opacity-100' 
          : 'translate-x-full opacity-0'
        }
      `}
      role="alert"
      aria-live="polite"
    >
      <div className="flex-shrink-0 mt-0.5">
        {styles.icon}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className={`text-sm font-semibold ${styles.title}`}>
          {title}
        </h4>
        {message && (
          <p className={`text-sm mt-1 ${styles.message}`}>
            {message}
          </p>
        )}
      </div>
      
      <button
        onClick={handleClose}
        className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
        aria-label="Close notification"
      >
        <FiX size={18} />
      </button>
    </div>
  );
};

export default Toast;
