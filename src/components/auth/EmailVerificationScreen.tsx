import { useState, useEffect } from 'react';
import { MailCheck, RefreshCw, ArrowLeft, Sparkles, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';

export default function EmailVerificationScreen() {
  const pendingEmail = useAuthStore(s => s.pendingVerificationEmail) || 'your-email@domain.com';
  const resendVerificationEmail = useAuthStore(s => s.resendVerificationEmail);
  const setAuthView = useAuthStore(s => s.setAuthView);
  const isLoading = useAuthStore(s => s.isLoading);

  const [resendCooldown, setResendCooldown] = useState(60);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown(prev => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const handleResend = async () => {
    if (resendCooldown > 0 || isLoading) return;
    const ok = await resendVerificationEmail(pendingEmail);
    if (ok) {
      setResendSuccess(true);
      setResendCooldown(60);
      setTimeout(() => setResendSuccess(false), 5000);
    }
  };

  return (
    <div style={{ textAlign: 'center', padding: '12px 4px' }}>
      {/* Animated Envelope Graphic */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', damping: 15 }}
        style={{
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, rgba(229, 169, 60, 0.2), rgba(180, 120, 32, 0.35))',
          border: '2px solid var(--color-amber-glow)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 20px',
          boxShadow: '0 0 35px rgba(229, 169, 60, 0.25)',
        }}
      >
        <MailCheck size={38} color="var(--color-amber-glow)" />
      </motion.div>

      <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px', color: 'var(--color-cream)' }}>
        Verify your Email Address
      </h2>
      <p style={{ fontSize: 14, color: 'var(--color-warm-gray)', lineHeight: 1.5, margin: '0 auto 16px', maxWidth: 360 }}>
        We have sent a verification link to:
      </p>

      {/* Email Badge */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 8,
          padding: '8px 18px',
          background: 'var(--surface-1)',
          border: '1px solid var(--surface-2)',
          borderRadius: 100,
          color: 'var(--color-amber-glow)',
          fontWeight: 600,
          fontSize: 14,
          marginBottom: 24,
        }}
      >
        <span>{pendingEmail}</span>
      </div>

      {/* Instructions Card */}
      <div
        style={{
          background: 'var(--surface-1)',
          border: '1px solid var(--surface-2)',
          borderRadius: 'var(--radius-md)',
          padding: '16px',
          textAlign: 'left',
          marginBottom: 24,
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.6,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--color-cream)', fontWeight: 600, marginBottom: 6 }}>
          <Sparkles size={14} color="var(--color-amber-glow)" />
          <span>Next Steps:</span>
        </div>
        <ol style={{ margin: 0, paddingLeft: 20 }}>
          <li>Open your email inbox (check Spam or Promotions if needed).</li>
          <li>Click the verification link to confirm your ownership.</li>
          <li>Return to VerLine to start building your heirloom tree.</li>
        </ol>
      </div>

      {resendSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            color: '#34D399',
            fontSize: 12,
            marginBottom: 16,
            fontWeight: 500,
          }}
        >
          <CheckCircle2 size={14} />
          <span>A fresh verification link has been sent!</span>
        </motion.div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <button
          type="button"
          onClick={handleResend}
          disabled={resendCooldown > 0 || isLoading}
          className="btn-secondary"
          style={{
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
            padding: '11px',
            fontSize: 13,
            opacity: resendCooldown > 0 ? 0.6 : 1,
            cursor: resendCooldown > 0 ? 'not-allowed' : 'pointer',
          }}
        >
          <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
          <span>
            {resendCooldown > 0 ? `Resend email in ${resendCooldown}s` : 'Resend verification email'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setAuthView('login')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-warm-gray)',
            fontSize: 13,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 6,
            marginTop: 8,
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </button>
      </div>
    </div>
  );
}
