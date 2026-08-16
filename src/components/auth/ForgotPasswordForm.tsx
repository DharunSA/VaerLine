import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, ArrowLeft, Send, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';

const forgotSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type ForgotFormData = z.infer<typeof forgotSchema>;

export default function ForgotPasswordForm() {
  const resetPassword = useAuthStore(s => s.resetPassword);
  const setAuthView = useAuthStore(s => s.setAuthView);
  const authView = useAuthStore(s => s.authView);
  const pendingEmail = useAuthStore(s => s.pendingVerificationEmail);
  const isLoading = useAuthStore(s => s.isLoading);
  const error = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);

  const [submittedEmail, setSubmittedEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotFormData>({
    resolver: zodResolver(forgotSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotFormData) => {
    clearError();
    setSubmittedEmail(data.email);
    await resetPassword(data.email);
  };

  if (authView === 'reset-sent') {
    return (
      <div style={{ textAlign: 'center', padding: '12px 4px' }}>
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(52, 211, 153, 0.15)',
            border: '2px solid #34D399',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 18px',
          }}
        >
          <CheckCircle2 size={36} color="#34D399" />
        </motion.div>

        <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 700, margin: '0 0 8px', color: 'var(--color-cream)' }}>
          Password Reset Email Sent
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-warm-gray)', lineHeight: 1.5, margin: '0 auto 20px', maxWidth: 360 }}>
          If an account exists for <strong style={{ color: 'var(--color-cream)' }}>{pendingEmail || submittedEmail}</strong>, you will receive password reset instructions shortly.
        </p>

        <button
          type="button"
          onClick={() => setAuthView('login')}
          className="btn-primary"
          style={{ width: '100%', padding: '11px', fontSize: 14 }}
        >
          Return to Sign In
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-cream)' }}>
          Reset your Password
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-warm-gray)', margin: 0 }}>
          Enter your registered email address and we will send you a recovery link.
        </p>
      </div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            padding: '10px 14px',
            borderRadius: 'var(--radius-sm)',
            background: 'rgba(239, 68, 68, 0.12)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#FCA5A5',
            fontSize: 13,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <AlertCircle size={16} color="#EF4444" style={{ flexShrink: 0 }} />
          <span>{error}</span>
        </motion.div>
      )}

      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', marginBottom: 6, letterSpacing: '0.02em' }}>
          Registered Email Address
        </label>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }}>
            <Mail size={16} />
          </div>
          <input
            {...register('email')}
            type="email"
            placeholder="you@domain.com"
            className="vaerline-input"
            style={{ paddingLeft: 38 }}
          />
        </div>
        {errors.email && (
          <p style={{ color: '#F87171', fontSize: 11, marginTop: 4, margin: '4px 0 0' }}>{errors.email.message}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="btn-primary"
        style={{
          width: '100%',
          padding: '12px',
          borderRadius: 'var(--radius-sm)',
          fontSize: 14,
          fontWeight: 600,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          boxShadow: '0 4px 20px rgba(229, 169, 60, 0.35)',
        }}
      >
        {isLoading ? (
          <>
            <div className="spinner" style={{ width: 16, height: 16 }} />
            <span>Sending recovery email…</span>
          </>
        ) : (
          <>
            <Send size={16} />
            <span>Send Reset Instructions</span>
          </>
        )}
      </button>

      <div style={{ textAlign: 'center', marginTop: 4 }}>
        <button
          type="button"
          onClick={() => setAuthView('login')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--color-warm-gray)',
            fontSize: 13,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <ArrowLeft size={14} />
          <span>Back to Sign In</span>
        </button>
      </div>
    </form>
  );
}
