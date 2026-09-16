import React, { useState } from 'react';
import type { UserRole } from '../types';
import { registerUser, loginUser } from '../services/api';
import { AccessibleFormField, LoadingButton, ErrorBanner } from './UIComponents';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: { id: string; name: string; email: string; role: UserRole }) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
}) => {
  const [mode, setMode] = useState<'REGISTER' | 'LOGIN'>('REGISTER');
  const [role, setRole] = useState<UserRole>('CUSTOMER');
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      if (mode === 'REGISTER') {
        if (!name.trim()) throw new Error('Full Name is required');
        if (!email.trim() || !email.includes('@')) throw new Error('Valid Email Address is required');
        if (password.length < 6) throw new Error('Password must be at least 6 characters');

        const res = await registerUser({ name, email, password, role });
        setSuccessMsg(res.message || 'Account registered successfully! Logging you in...');
        
        // Auto login after registration
        setTimeout(async () => {
          try {
            const loginRes = await loginUser({ email, password });
            onAuthSuccess(loginRes.user || { id: res.userId || 'u-1', name, email, role });
            onClose();
          } catch (err: any) {
            setMode('LOGIN');
          }
        }, 1200);

      } else {
        if (!email.trim()) throw new Error('Email is required');
        if (!password) throw new Error('Password is required');

        const res = await loginUser({ email, password });
        onAuthSuccess(res.user || { id: 'u-101', name: email.split('@')[0], email, role });
        onClose();
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.8)',
        backdropFilter: 'blur(10px)',
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
          maxWidth: '460px',
          background: '#0f172a',
          border: '1px solid rgba(245, 158, 11, 0.3)',
          padding: '32px',
          borderRadius: '24px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.7)',
        }}
      >
        {/* Header & Mode Switcher */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800', color: '#f8fafc', margin: 0 }}>
              {mode === 'REGISTER' ? 'Create SEWFIT Account' : 'Sign In to SEWFIT'}
            </h3>
            <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
              {mode === 'REGISTER' ? 'Bespoke fitting & order tracking' : 'Access your custom orders and profiles'}
            </span>
          </div>

          <button
            onClick={onClose}
            style={{ background: 'transparent', border: 'none', color: '#64748b', fontSize: '1.4rem', cursor: 'pointer' }}
          >
            ×
          </button>
        </div>

        {/* Tab Selector */}
        <div style={{ display: 'flex', background: 'rgba(255,255,255,0.04)', padding: '4px', borderRadius: '10px', marginBottom: '24px' }}>
          <button
            type="button"
            onClick={() => { setMode('REGISTER'); setErrorMessage(null); setSuccessMsg(null); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'REGISTER' ? '#f59e0b' : 'transparent',
              color: mode === 'REGISTER' ? '#000' : '#94a3b8',
              fontWeight: '800',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Register Account
          </button>
          <button
            type="button"
            onClick={() => { setMode('LOGIN'); setErrorMessage(null); setSuccessMsg(null); }}
            style={{
              flex: 1,
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              background: mode === 'LOGIN' ? '#06b6d4' : 'transparent',
              color: mode === 'LOGIN' ? '#000' : '#94a3b8',
              fontWeight: '800',
              fontSize: '0.875rem',
              cursor: 'pointer',
            }}
          >
            Sign In
          </button>
        </div>

        {errorMessage && <ErrorBanner message={errorMessage} onDismiss={() => setErrorMessage(null)} />}

        {successMsg && (
          <div style={{ padding: '12px', background: 'rgba(16, 185, 129, 0.15)', border: '1px solid #10b981', color: '#34d399', borderRadius: '8px', marginBottom: '16px', fontSize: '0.85rem' }}>
            ✅ {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {mode === 'REGISTER' && (
            <>
              <AccessibleFormField id="auth-role" label="I am registering as:">
                <select
                  id="auth-role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as UserRole)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                    fontWeight: '600',
                  }}
                >
                  <option value="CUSTOMER">👤 Customer (Order & Measure)</option>
                  <option value="TAILOR">✂️ Master Tailor (Workshop)</option>
                  <option value="DELIVERY_AGENT">🛵 Delivery Fleet Agent</option>
                </select>
              </AccessibleFormField>

              <AccessibleFormField id="auth-name" label="Full Name" required>
                <input
                  id="auth-name"
                  type="text"
                  placeholder="e.g. Abebe Bikila"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 14px',
                    background: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    color: '#f8fafc',
                  }}
                />
              </AccessibleFormField>
            </>
          )}

          <AccessibleFormField id="auth-email" label="Email Address" required>
            <input
              id="auth-email"
              type="email"
              placeholder="e.g. abebe@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
              }}
            />
          </AccessibleFormField>

          <AccessibleFormField id="auth-password" label="Password" required helperText={mode === 'REGISTER' ? 'Minimum 6 characters' : undefined}>
            <input
              id="auth-password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px',
                background: '#1e293b',
                border: '1px solid #334155',
                borderRadius: '8px',
                color: '#f8fafc',
              }}
            />
          </AccessibleFormField>

          <LoadingButton
            isLoading={isLoading}
            variant={mode === 'REGISTER' ? 'primary' : 'secondary'}
            style={{ width: '100%', padding: '12px', marginTop: '8px' }}
          >
            {mode === 'REGISTER' ? 'Create Account Now ➔' : 'Sign In ➔'}
          </LoadingButton>
        </form>
      </div>
    </div>
  );
};
