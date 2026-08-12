import { useState, useRef, useEffect } from 'react';
import { User, LogOut, ChevronDown, CheckCircle2, AlertCircle, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';

export default function UserMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const user = useAuthStore(s => s.user);
  const signOut = useAuthStore(s => s.signOut);
  const openAuthModal = useAuthStore(s => s.openAuthModal);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!user) {
    return (
      <div style={{ padding: '12px 16px', borderTop: '1px solid var(--surface-2)' }}>
        <button
          onClick={() => openAuthModal('login')}
          className="btn-secondary"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '9px 12px',
            fontSize: 13,
            color: 'var(--color-amber-glow)',
            borderColor: 'rgba(229, 169, 60, 0.3)',
          }}
        >
          <User size={15} />
          <span>Sign In / Register</span>
        </button>
      </div>
    );
  }

  const initials = user.fullName
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');

  return (
    <div ref={menuRef} style={{ position: 'relative', borderTop: '1px solid var(--surface-2)' }}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        style={{
          width: '100%',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          background: isOpen ? 'var(--surface-1)' : 'transparent',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 150ms',
        }}
      >
        {/* Avatar */}
        <div
          style={{
            width: 34,
            height: 34,
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #E5A93C, #B47820)',
            color: '#12161A',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            fontFamily: 'Cormorant Garamond, serif',
            flexShrink: 0,
            boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
          }}
        >
          {initials || 'U'}
        </div>

        {/* Name & Role */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: 'var(--color-cream)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
            }}
          >
            {user.fullName}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 1 }}>
            {user.isEmailVerified ? (
              <CheckCircle2 size={11} color="#34D399" />
            ) : (
              <AlertCircle size={11} color="#FBBF24" />
            )}
            <span style={{ fontSize: 10, color: 'var(--color-warm-gray)' }}>
              {user.role === 'creator' ? 'Family Creator' : 'Family Member'}
            </span>
          </div>
        </div>

        <ChevronDown size={14} color="var(--text-muted)" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 150ms' }} />
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            style={{
              position: 'absolute',
              bottom: '100%',
              left: 8,
              right: 8,
              marginBottom: 8,
              background: 'var(--surface-0)',
              border: '1.5px solid var(--surface-2)',
              borderRadius: 'var(--radius-md)',
              boxShadow: 'var(--shadow-xl)',
              overflow: 'hidden',
              zIndex: 100,
            }}
          >
            {/* Header info */}
            <div style={{ padding: '12px 14px', background: 'var(--surface-1)', borderBottom: '1px solid var(--surface-2)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-cream)' }}>{user.fullName}</div>
              <div style={{ fontSize: 11, color: 'var(--color-warm-gray)', marginTop: 2, wordBreak: 'break-all' }}>{user.email}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
                <span
                  style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 100,
                    background: user.isEmailVerified ? 'rgba(52, 211, 153, 0.15)' : 'rgba(251, 191, 36, 0.15)',
                    color: user.isEmailVerified ? '#34D399' : '#FBBF24',
                    border: `1px solid ${user.isEmailVerified ? 'rgba(52, 211, 153, 0.3)' : 'rgba(251, 191, 36, 0.3)'}`,
                    fontWeight: 600,
                  }}
                >
                  {user.isEmailVerified ? '✓ Email Verified' : '⚠ Unverified'}
                </span>
                <span
                  style={{
                    fontSize: 10,
                    padding: '2px 8px',
                    borderRadius: 100,
                    background: 'rgba(229, 169, 60, 0.15)',
                    color: 'var(--color-amber-glow)',
                    fontWeight: 600,
                  }}
                >
                  <Shield size={10} style={{ display: 'inline', marginRight: 2 }} />
                  {user.role}
                </span>
              </div>
            </div>

            {/* Menu Items */}
            <div style={{ padding: '6px' }}>
              <button
                onClick={() => {
                  openAuthModal('register');
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-cream)',
                  fontSize: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <User size={14} />
                <span>Register New Account</span>
              </button>

              <div style={{ height: 1, background: 'var(--surface-2)', margin: '4px 0' }} />

              <button
                onClick={() => {
                  signOut();
                  setIsOpen(false);
                }}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '8px 10px',
                  borderRadius: 'var(--radius-sm)',
                  background: 'none',
                  border: 'none',
                  color: '#F87171',
                  fontSize: 12,
                  cursor: 'pointer',
                  textAlign: 'left',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'none')}
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
