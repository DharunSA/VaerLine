import { X, TreePine } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import RegisterForm from './RegisterForm';
import LoginForm from './LoginForm';
import ForgotPasswordForm from './ForgotPasswordForm';
import EmailVerificationScreen from './EmailVerificationScreen';

export default function AuthModal() {
  const isOpen = useAuthStore(s => s.isAuthModalOpen);
  const closeAuthModal = useAuthStore(s => s.closeAuthModal);
  const authView = useAuthStore(s => s.authView);
  const setAuthView = useAuthStore(s => s.setAuthView);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={closeAuthModal}>
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.94, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 350 }}
          className="modal-content"
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: 480,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            background: 'var(--surface-0)',
            border: '1.5px solid var(--surface-2)',
            borderRadius: 'var(--radius-xl)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(229, 169, 60, 0.15)',
          }}
        >
          {/* Decorative Top Accent Bar */}
          <div
            style={{
              height: 4,
              width: '100%',
              flexShrink: 0,
              background: 'linear-gradient(90deg, #E5A93C, #B47820, #3A755C)',
            }}
          />

          {/* Header Bar */}
          <div
            style={{
              padding: '18px 24px 14px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              borderBottom: '1px solid var(--surface-2)',
              flexShrink: 0,
            }}
          >
            {/* Logo Badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  background: 'linear-gradient(135deg, #E5A93C, #B47820)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 12px rgba(229, 169, 60, 0.3)',
                }}
              >
                <TreePine size={18} color="#12161A" />
              </div>
              <span className="font-serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-cream)' }}>
                VerLine
              </span>
            </div>

            {/* Close Button */}
            <button
              onClick={closeAuthModal}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                border: '1px solid var(--surface-2)',
                background: 'var(--surface-1)',
                color: 'var(--text-muted)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                transition: 'all 150ms',
              }}
            >
              <X size={16} />
            </button>
          </div>

          {/* Tab Selection (only on login / register views) */}
          {(authView === 'login' || authView === 'register') && (
            <div
              style={{
                display: 'flex',
                background: 'var(--surface-1)',
                borderBottom: '1px solid var(--surface-2)',
                padding: '4px 24px 0',
                flexShrink: 0,
              }}
            >
              <button
                type="button"
                onClick={() => setAuthView('login')}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${authView === 'login' ? 'var(--color-amber-glow)' : 'transparent'}`,
                  color: authView === 'login' ? 'var(--color-amber-glow)' : 'var(--color-warm-gray)',
                  fontWeight: authView === 'login' ? 600 : 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setAuthView('register')}
                style={{
                  flex: 1,
                  padding: '12px 0',
                  background: 'none',
                  border: 'none',
                  borderBottom: `2px solid ${authView === 'register' ? 'var(--color-amber-glow)' : 'transparent'}`,
                  color: authView === 'register' ? 'var(--color-amber-glow)' : 'var(--color-warm-gray)',
                  fontWeight: authView === 'register' ? 600 : 500,
                  fontSize: 14,
                  cursor: 'pointer',
                  transition: 'all 150ms',
                }}
              >
                Register / Sign Up
              </button>
            </div>
          )}

          {/* Body Content (Scrollable) */}
          <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
            <AnimatePresence mode="wait">
              {authView === 'register' && (
                <motion.div
                  key="register"
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <RegisterForm />
                </motion.div>
              )}

              {authView === 'login' && (
                <motion.div
                  key="login"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ duration: 0.15 }}
                >
                  <LoginForm />
                </motion.div>
              )}

              {authView === 'verification-sent' && (
                <motion.div
                  key="verification"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                >
                  <EmailVerificationScreen />
                </motion.div>
              )}

              {(authView === 'forgot-password' || authView === 'reset-sent') && (
                <motion.div
                  key="forgot"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.15 }}
                >
                  <ForgotPasswordForm />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
