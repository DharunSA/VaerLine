import { useState, useEffect } from 'react';
import { X, UserPlus, Mail, Lock, User, CheckCircle2, AlertCircle, Users, Copy, Share2, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';
import { usePeopleStore } from '../../stores/peopleStore';
import { useUIStore } from '../../stores/uiStore';

interface InviteMemberModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function InviteMemberModal({ isOpen, onClose }: InviteMemberModalProps) {
  const provisionRelativeAccount = useAuthStore(s => s.provisionRelativeAccount);
  const treeId = usePeopleStore(s => s.treeId);
  const inviteTargetName = useUIStore(s => s.inviteTargetName);
  const inviteTargetEmail = useUIStore(s => s.inviteTargetEmail);
  const addToast = useUIStore(s => s.addToast);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [result, setResult] = useState<{
    type: 'success' | 'error';
    message: string;
    createdAccount?: { name: string; email: string; pass: string };
  } | null>(null);

  // Sync state when modal opens
  useEffect(() => {
    if (isOpen) {
      setFullName(inviteTargetName || '');
      setEmail(inviteTargetEmail || '');
      setPassword('');
      setResult(null);
      setCopied(false);
    }
  }, [isOpen, inviteTargetName, inviteTargetEmail]);

  const handleClose = () => {
    setFullName('');
    setEmail('');
    setPassword('');
    setResult(null);
    setCopied(false);
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!treeId) {
      setResult({ type: 'error', message: 'No active family tree found. Please reload the page.' });
      return;
    }
    if (!fullName.trim() || !email.trim() || !password) {
      setResult({ type: 'error', message: 'All fields are required.' });
      return;
    }
    if (password.length < 6) {
      setResult({ type: 'error', message: 'Password must be at least 6 characters.' });
      return;
    }

    setIsSubmitting(true);
    setResult(null);

    const targetName = fullName.trim();
    const targetEmail = email.trim();
    const targetPass = password;

    const outcome = await provisionRelativeAccount(targetEmail, targetPass, targetName, treeId);

    setIsSubmitting(false);

    if (outcome.success) {
      setResult({
        type: 'success',
        message: `Account created for ${targetName}! Share the login credentials below so they can sign in.`,
        createdAccount: { name: targetName, email: targetEmail, pass: targetPass },
      });
    } else {
      setResult({ type: 'error', message: outcome.error ?? 'Account creation failed. Please try again.' });
    }
  };

  const loginUrl = `${window.location.origin}/login`;

  const getShareText = () => {
    if (!result?.createdAccount) return '';
    const { name, email: uEmail, pass } = result.createdAccount;
    return `Hello ${name}! \uD83D\uDC4B\n\nYour account for our family tree is ready:\n\uD83C\uDF10 Website: ${loginUrl}\n\uD83D\uDCE7 Email: ${uEmail}\n\uD83D\uDD11 Password: ${pass}\n\nYou can sign in anytime to view our family roots!`;
  };

  const handleCopyCredentials = () => {
    const text = getShareText();
    navigator.clipboard.writeText(text);
    setCopied(true);
    addToast('Login credentials copied to clipboard!', 'success');
    setTimeout(() => setCopied(false), 2500);
  };

  const handleWhatsAppShare = () => {
    const text = getShareText();
    // WhatsApp requires emoji to be passed as raw Unicode, NOT as percent-encoded UTF-8 bytes.
    // encodeURIComponent() converts emoji surrogate pairs into %F0%9F... sequences which
    // WhatsApp re-decodes incorrectly on some devices, showing diamond characters instead of emoji.
    // Fix: encode the text but then decode percent-encoded multi-byte sequences back to raw Unicode.
    const encoded = encodeURIComponent(text).replace(
      /%([EF][0-9A-F]%[89AB][0-9A-F]%[89AB][0-9A-F]|[EF][0-9A-F]%[89AB][0-9A-F]|[CD][0-9A-F]%[89AB][0-9A-F]|F[0-9A-F]%[89AB][0-9A-F]%[89AB][0-9A-F]%[89AB][0-9A-F])/gi,
      match => decodeURIComponent(match)
    );
    window.open(`https://wa.me/?text=${encoded}`, '_blank');
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div
        className="modal-overlay"
        onClick={handleClose}
        style={{ zIndex: 200 }}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.2 }}
          className="modal-content"
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: 480,
            background: 'var(--surface-0)',
            border: '1.5px solid var(--surface-2)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
          }}
        >
          {/* Accent bar */}
          <div style={{ height: 4, background: 'linear-gradient(90deg, #3A755C, #E5A93C)' }} />

          {/* Header */}
          <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--surface-2)', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10,
                background: 'rgba(58, 117, 92, 0.15)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Users size={18} color="var(--color-emerald-leaf)" />
              </div>
              <div>
                <h2 className="font-serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-cream)', margin: 0 }}>
                  Create Account for Relative
                </h2>
                <p style={{ fontSize: 12, color: 'var(--color-warm-gray)', margin: '2px 0 0' }}>
                  Set up login credentials so family members can easily log in
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{ width: 30, height: 30, borderRadius: '50%', background: 'var(--surface-1)', border: '1px solid var(--surface-2)', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', flexShrink: 0 }}
            >
              <X size={15} />
            </button>
          </div>

          {/* Info banner */}
          <div style={{ margin: '16px 24px 0', padding: '10px 14px', background: 'rgba(58, 117, 92, 0.1)', border: '1px solid rgba(58, 117, 92, 0.3)', borderRadius: 'var(--radius-sm)', fontSize: 12, color: 'var(--color-sage-highlight)', lineHeight: 1.5 }}>
            💡 <strong>For elderly relatives:</strong> You generate their login details here and hand them over (or send via WhatsApp). They can simply log in at <em>/login</em> without going through registration!
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ padding: '16px 24px 24px', display: 'flex', flexDirection: 'column', gap: 14 }}>

            {/* Result message */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: -8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  style={{
                    padding: '14px',
                    background: result.type === 'success' ? 'rgba(52, 211, 153, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${result.type === 'success' ? 'rgba(52, 211, 153, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`,
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 10,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    {result.type === 'success' ? (
                      <CheckCircle2 size={18} color="#34D399" style={{ marginTop: 2, flexShrink: 0 }} />
                    ) : (
                      <AlertCircle size={18} color="#F87171" style={{ marginTop: 2, flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: 13, color: result.type === 'success' ? '#34D399' : '#F87171', lineHeight: 1.5, fontWeight: 500 }}>
                      {result.message}
                    </span>
                  </div>

                  {/* Generated Credentials Card */}
                  {result.createdAccount && (
                    <div
                      style={{
                        background: 'var(--surface-0)',
                        border: '1px dashed rgba(52, 211, 153, 0.4)',
                        borderRadius: 'var(--radius-sm)',
                        padding: '12px 14px',
                        fontSize: 12,
                        color: 'var(--color-cream)',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 6,
                      }}
                    >
                      <div style={{ fontWeight: 700, color: 'var(--color-amber-glow)' }}>
                        Login Credentials Summary:
                      </div>
                      <div><strong>Full Name:</strong> {result.createdAccount.name}</div>
                      <div><strong>Email:</strong> {result.createdAccount.email}</div>
                      <div><strong>Password:</strong> {result.createdAccount.pass}</div>

                      <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                        <button
                          type="button"
                          onClick={handleCopyCredentials}
                          className="btn-secondary"
                          style={{ flex: 1, padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        >
                          {copied ? <Check size={14} color="#34D399" /> : <Copy size={14} />}
                          <span>{copied ? 'Copied!' : 'Copy Credentials'}</span>
                        </button>
                        <button
                          type="button"
                          onClick={handleWhatsAppShare}
                          className="btn-primary"
                          style={{ flex: 1, padding: '6px 10px', fontSize: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}
                        >
                          <Share2 size={14} />
                          <span>Share via WhatsApp</span>
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>

            {!result?.createdAccount && (
              <>
                {/* Full Name */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <User size={12} style={{ display: 'inline', marginRight: 4 }} />
                    Relative's Full Name
                  </label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder="e.g. Meena Sharma"
                    className="vaerline-input"
                    autoComplete="off"
                  />
                </div>

                {/* Email */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <Mail size={12} style={{ display: 'inline', marginRight: 4 }} />
                    Relative's Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="e.g. relative@example.com (or relative.name@family.com)"
                    className="vaerline-input"
                    autoComplete="off"
                  />
                </div>

                {/* Password */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    <Lock size={12} style={{ display: 'inline', marginRight: 4 }} />
                    Set a Simple Password (you share this with them)
                  </label>
                  <input
                    type="text"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="e.g. Family2024 (min 6 characters)"
                    className="vaerline-input"
                    autoComplete="new-password"
                  />
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', margin: 0 }}>
                    Create a simple, memorable password. You can write this down or share it directly with your relative.
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 4 }}>
                  <button type="button" onClick={handleClose} className="btn-secondary" style={{ padding: '10px 18px' }}>
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn-primary"
                    disabled={isSubmitting}
                    style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px' }}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner" style={{ width: 16, height: 16, borderTopColor: '#12161A' }} />
                        <span>Creating Account…</span>
                      </>
                    ) : (
                      <>
                        <UserPlus size={16} />
                        <span>Create Login Credentials</span>
                      </>
                    )}
                  </button>
                </div>
              </>
            )}

            {result?.createdAccount && (
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
                <button type="button" onClick={handleClose} className="btn-secondary" style={{ padding: '8px 20px' }}>
                  Done
                </button>
              </div>
            )}
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

