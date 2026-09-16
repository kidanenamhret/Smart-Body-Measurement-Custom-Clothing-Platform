import React, { type ReactNode } from 'react';
import type { ToastAlert, ToastType } from '../types';

// =========================================================================
// 1. SKELETON LOADER (Loading States)
// =========================================================================
interface SkeletonProps {
  variant?: 'card' | 'metric' | 'text' | 'table-row';
  count?: number;
  height?: string;
  width?: string;
}

export const SkeletonLoader: React.FC<SkeletonProps> = ({
  variant = 'card',
  count = 1,
  height,
  width,
}) => {
  const items = Array.from({ length: count });

  const baseStyle: React.CSSProperties = {
    background: 'linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)',
    backgroundSize: '200% 100%',
    animation: 'skeletonShimmer 1.5s infinite linear',
    borderRadius: '12px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
  };

  return (
    <>
      <style>{`
        @keyframes skeletonShimmer {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
      `}</style>
      <div style={{ display: 'flex', flexDirection: variant === 'metric' ? 'row' : 'column', gap: '16px', width: width || '100%' }}>
        {items.map((_, idx) => {
          if (variant === 'metric') {
            return (
              <div
                key={idx}
                style={{
                  ...baseStyle,
                  flex: 1,
                  minHeight: height || '110px',
                  padding: '20px',
                }}
              />
            );
          }
          if (variant === 'table-row') {
            return (
              <div
                key={idx}
                style={{
                  ...baseStyle,
                  height: height || '48px',
                  width: '100%',
                }}
              />
            );
          }
          if (variant === 'text') {
            return (
              <div
                key={idx}
                style={{
                  ...baseStyle,
                  height: height || '20px',
                  width: width || '100%',
                }}
              />
            );
          }
          // Default Card
          return (
            <div
              key={idx}
              style={{
                ...baseStyle,
                height: height || '180px',
                width: '100%',
              }}
            />
          );
        })}
      </div>
    </>
  );
};

// =========================================================================
// 2. EMPTY STATE (Empty States)
// =========================================================================
interface EmptyStateProps {
  icon?: string;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
  secondaryActionText?: string;
  onSecondaryAction?: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon = '📦',
  title,
  description,
  actionText,
  onAction,
  secondaryActionText,
  onSecondaryAction,
}) => {
  return (
    <div
      style={{
        padding: '48px 24px',
        textAlign: 'center',
        background: 'rgba(15, 23, 42, 0.6)',
        border: '1px border-dashed rgba(255, 255, 255, 0.15)',
        borderRadius: '16px',
        margin: '20px 0',
      }}
    >
      <div style={{ fontSize: '3rem', marginBottom: '16px', opacity: 0.9 }}>{icon}</div>
      <h3 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#f8fafc', marginBottom: '8px' }}>
        {title}
      </h3>
      <p style={{ color: '#94a3b8', fontSize: '0.925rem', maxWidth: '440px', margin: '0 auto 24px auto', lineHeight: '1.5' }}>
        {description}
      </p>
      <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
        {actionText && onAction && (
          <button className="btn-primary" onClick={onAction} style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
            {actionText}
          </button>
        )}
        {secondaryActionText && onSecondaryAction && (
          <button className="btn-secondary" onClick={onSecondaryAction} style={{ padding: '10px 20px', fontSize: '0.875rem' }}>
            {secondaryActionText}
          </button>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// 3. ERROR BANNER & ALERT (Error States)
// =========================================================================
interface ErrorBannerProps {
  title?: string;
  message: string;
  onRetry?: () => void;
  onDismiss?: () => void;
}

export const ErrorBanner: React.FC<ErrorBannerProps> = ({
  title = 'Something went wrong',
  message,
  onRetry,
  onDismiss,
}) => {
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        background: 'rgba(239, 68, 68, 0.12)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        padding: '16px 20px',
        margin: '16px 0',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '16px',
        color: '#fca5a5',
      }}
    >
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <span style={{ fontSize: '1.25rem' }}>⚠️</span>
        <div>
          <strong style={{ display: 'block', fontSize: '0.95rem', color: '#f87171', marginBottom: '2px' }}>
            {title}
          </strong>
          <span style={{ fontSize: '0.875rem', color: '#fca5a5' }}>{message}</span>
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{
              background: 'rgba(239, 68, 68, 0.2)',
              border: '1px solid rgba(239, 68, 68, 0.4)',
              color: '#ffffff',
              borderRadius: '6px',
              padding: '6px 12px',
              fontSize: '0.78rem',
              cursor: 'pointer',
              fontWeight: '600',
            }}
          >
            Retry
          </button>
        )}
        {onDismiss && (
          <button
            onClick={onDismiss}
            aria-label="Dismiss error"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#94a3b8',
              fontSize: '1.2rem',
              cursor: 'pointer',
              lineHeight: 1,
            }}
          >
            ×
          </button>
        )}
      </div>
    </div>
  );
};

// =========================================================================
// 4. TOAST NOTIFICATION SYSTEM (Success / Feedback States)
// =========================================================================
interface ToastContainerProps {
  toasts: ToastAlert[];
  onDismiss: (id: string) => void;
}

export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => {
  if (!toasts || toasts.length === 0) return null;

  const getTypeStyles = (type: ToastType) => {
    switch (type) {
      case 'success':
        return { borderLeft: '4px solid #10b981', bg: 'rgba(16, 185, 129, 0.15)', icon: '✅', titleColor: '#34d399' };
      case 'error':
        return { borderLeft: '4px solid #ef4444', bg: 'rgba(239, 68, 68, 0.15)', icon: '❌', titleColor: '#f87171' };
      case 'warning':
        return { borderLeft: '4px solid #f59e0b', bg: 'rgba(245, 158, 11, 0.15)', icon: '⚠️', titleColor: '#fbbf24' };
      case 'info':
      default:
        return { borderLeft: '4px solid #06b6d4', bg: 'rgba(6, 182, 212, 0.15)', icon: 'ℹ️', titleColor: '#38bdf8' };
    }
  };

  return (
    <div
      aria-live="polite"
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '380px',
        width: 'calc(100vw - 48px)',
      }}
    >
      {toasts.map((toast) => {
        const style = getTypeStyles(toast.type);
        return (
          <div
            key={toast.id}
            className="glass-card"
            style={{
              padding: '14px 16px',
              background: 'rgba(15, 23, 42, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.12)',
              borderLeft: style.borderLeft,
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)',
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              gap: '12px',
              backdropFilter: 'blur(16px)',
            }}
          >
            <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
              <span style={{ fontSize: '1.1rem', marginTop: '1px' }}>{style.icon}</span>
              <div>
                <strong style={{ display: 'block', fontSize: '0.875rem', color: style.titleColor, fontWeight: '700' }}>
                  {toast.title}
                </strong>
                <span style={{ fontSize: '0.8125rem', color: '#cbd5e1', lineHeight: '1.4' }}>{toast.message}</span>
              </div>
            </div>
            <button
              onClick={() => onDismiss(toast.id)}
              aria-label="Close notification"
              style={{
                background: 'transparent',
                border: 'none',
                color: '#64748b',
                cursor: 'pointer',
                fontSize: '1rem',
                padding: '0 4px',
              }}
            >
              ×
            </button>
          </div>
        );
      })}
    </div>
  );
};

// =========================================================================
// 5. CONFIRMATION DIALOG (Confirmation Dialogs)
// =========================================================================
interface ConfirmationModalProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  isDanger = false,
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9998,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '440px',
          background: '#0f172a',
          border: '1px solid rgba(255, 255, 255, 0.12)',
          padding: '28px',
          borderRadius: '20px',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
        }}
      >
        <div style={{ display: 'flex', gap: '14px', alignItems: 'center', marginBottom: '16px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              background: isDanger ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.4rem',
              color: isDanger ? '#ef4444' : '#f59e0b',
            }}
          >
            {isDanger ? '🚨' : '❓'}
          </div>
          <div>
            <h3 id="confirm-modal-title" style={{ fontSize: '1.2rem', fontWeight: '700', color: '#f8fafc', margin: 0 }}>
              {title}
            </h3>
            <span style={{ fontSize: '0.75rem', color: isDanger ? '#f87171' : '#f59e0b', fontWeight: '600' }}>
              Action Required
            </span>
          </div>
        </div>

        <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.5', marginBottom: '24px' }}>
          {message}
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            className="btn-secondary"
            onClick={onCancel}
            disabled={isLoading}
            style={{ padding: '10px 18px', fontSize: '0.875rem' }}
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isLoading}
            style={{
              padding: '10px 20px',
              fontSize: '0.875rem',
              fontWeight: '700',
              borderRadius: '8px',
              border: 'none',
              cursor: isLoading ? 'not-allowed' : 'pointer',
              background: isDanger
                ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
                : 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
              color: '#ffffff',
              boxShadow: isDanger
                ? '0 4px 14px rgba(239, 68, 68, 0.4)'
                : '0 4px 14px rgba(245, 158, 11, 0.4)',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            {isLoading && (
              <span
                style={{
                  width: '14px',
                  height: '14px',
                  border: '2px solid rgba(255,255,255,0.3)',
                  borderTopColor: '#ffffff',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                  display: 'inline-block',
                }}
              />
            )}
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================================================================
// 6. ACCESSIBLE FORM FIELD (Accessible Forms)
// =========================================================================
interface AccessibleFormFieldProps {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  helperText?: string;
  children: ReactNode;
}

export const AccessibleFormField: React.FC<AccessibleFormFieldProps> = ({
  id,
  label,
  required = false,
  error,
  helperText,
  children,
}) => {
  return (
    <div style={{ marginBottom: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
      <label htmlFor={id} style={{ fontSize: '0.875rem', fontWeight: '600', color: '#cbd5e1' }}>
        {label} {required && <span style={{ color: '#ef4444' }}>*</span>}
      </label>
      {children}
      {error ? (
        <span id={`${id}-error`} style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: '500' }}>
          ⚠️ {error}
        </span>
      ) : helperText ? (
        <span id={`${id}-helper`} style={{ fontSize: '0.75rem', color: '#64748b' }}>
          {helperText}
        </span>
      ) : null}
    </div>
  );
};

// =========================================================================
// 7. LOADING BUTTON (Meaningful Feedback)
// =========================================================================
interface LoadingButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  isLoading?: boolean;
  variant?: 'primary' | 'secondary' | 'danger';
  children: ReactNode;
}

export const LoadingButton: React.FC<LoadingButtonProps> = ({
  isLoading = false,
  variant = 'primary',
  children,
  disabled,
  style,
  ...props
}) => {
  const getVariantStyles = (): React.CSSProperties => {
    switch (variant) {
      case 'danger':
        return {
          background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
        };
      case 'secondary':
        return {
          background: 'rgba(255, 255, 255, 0.06)',
          color: '#e2e8f0',
          border: '1px solid rgba(255, 255, 255, 0.12)',
        };
      case 'primary':
      default:
        return {
          background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
          color: '#ffffff',
          border: 'none',
          boxShadow: '0 4px 14px rgba(245, 158, 11, 0.35)',
        };
    }
  };

  return (
    <button
      disabled={disabled || isLoading}
      style={{
        padding: '10px 18px',
        borderRadius: '8px',
        fontSize: '0.875rem',
        fontWeight: '600',
        cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
        opacity: disabled || isLoading ? 0.7 : 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        transition: 'all 0.2s ease',
        ...getVariantStyles(),
        ...style,
      }}
      {...props}
    >
      {isLoading && (
        <span
          style={{
            width: '14px',
            height: '14px',
            border: '2px solid rgba(255,255,255,0.3)',
            borderTopColor: '#ffffff',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </button>
  );
};
