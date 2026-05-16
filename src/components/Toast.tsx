import React from 'react';
import { ToastContainer, toast, ToastOptions } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaCheckCircle, FaExclamationCircle } from 'react-icons/fa';
import { GoXCircleFill } from 'react-icons/go';

export type ToastType = 'default' | 'success' | 'error' | 'warning';

const toastConfig: Record<ToastType, {
  icon: React.ReactNode;
  style: React.CSSProperties;
  textColor: string;
}> = {
  default: {
    icon: <FaCheckCircle size={20} color="#030C23" />,
    style: {
      background: '#F7F9FB',
      border: '1.5px solid #E3E8EF',
      color: '#030C23',
      borderRadius: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      minWidth: 380,
      padding: '16px 24px',
    },
    textColor: '#030C23',
  },
  success: {
    icon: <FaCheckCircle size={20} color="#0CD074" />,
    style: {
      background: '#EAFFF5',
      border: '1.5px solid #B6F5D2',
      color: '#0CD074',
      borderRadius: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      minWidth: 380,
      padding: '16px 24px',
    },
    textColor: '#0CD074',
  },
  error: {
    icon: <GoXCircleFill size={20} color="#F3293E" />,
    style: {
      background: '#FFF0F1',
      border: '1.5px solid #FFD6D9',
      color: '#F3293E',
      borderRadius: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      minWidth: 380,
      padding: '16px 24px',
    },
    textColor: '#F3293E',
  },
  warning: {
    icon: <FaExclamationCircle size={20} color="#FB8F10" />,
    style: {
      background: '#FFF5E9',
      border: '1.5px solid #FFD6B0',
      color: '#FB8F10',
      borderRadius: 16,
      boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      minWidth: 380,
      padding: '16px 24px',
    },
    textColor: '#FB8F10',
  },
};

export function showToast({
  title,
  description,
  type = 'default',
  ...options
}: {
  title: string;
  description?: string;
  type?: ToastType;
} & ToastOptions) {
  const { icon, style, textColor } = toastConfig[type];
  toast(
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
      <span style={{ marginTop: 2 }}>{icon}</span>
      <div>
        <div
          style={{
            fontWeight: 590,
            fontSize: 14,
            lineHeight: '16px',
            letterSpacing: '-0.02em',
            color: '#030C23',
          }}
        >
          {title}
        </div>
        {description && (
          <div
            style={{
              fontWeight: 274,
              fontSize: 12,
              lineHeight: '16px',
              letterSpacing: '-0.03em',
              color: 'rgba(3,12,35,0.6)',
              marginTop: 2,
            }}
          >
            {description}
          </div>
        )}
      </div>
    </div>,
    {
      icon: false,
      style,
      closeButton: true,
      hideProgressBar: true,
      ...options,
    }
  );
}

export const ToastProvider = ToastContainer; 