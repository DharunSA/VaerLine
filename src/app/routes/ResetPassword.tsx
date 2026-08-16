import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, Eye, EyeOff, Check, ShieldCheck, TreePine, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';

const resetSchema = z
  .object({
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
      .regex(/[0-9]/, 'Must contain at least one number'),
    confirmPassword: z.string(),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type ResetFormData = z.infer<typeof resetSchema>;

function calculatePasswordStrength(password: string): { score: number; label: string; color: string } {
  if (!password) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password)) score += 1;
  if (/[0-9]/.test(password)) score += 1;
  if (/[^A-Za-z0-9]/.test(password)) score += 1;

  if (score <= 2) return { score: 1, label: 'Weak', color: '#F87171' };
  if (score === 3) return { score: 2, label: 'Fair', color: '#FBBF24' };
  if (score === 4) return { score: 3, label: 'Good', color: '#60A5FA' };
  return { score: 4, label: 'Strong', color: '#34D399' };
}

export default function ResetPassword() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const updatePassword = useAuthStore(s => s.updatePassword);
  const isLoading = useAuthStore(s => s.isLoading);
  const error = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ResetFormData>({
    resolver: zodResolver(resetSchema),
    defaultValues: {
      password: '',
      confirmPassword: '',
    },
  });

  const passwordValue = watch('password', '');
  const strength = useMemo(() => calculatePasswordStrength(passwordValue), [passwordValue]);

  const onSubmit = async (data: ResetFormData) => {
    clearError();
    const ok = await updatePassword(data.password);
    if (ok) {
      setIsSuccess(true);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: 'var(--color-canvas)',
      }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
        style={{
          maxWidth: 460,
          width: '100%',
          background: 'var(--surface-0)',
          border: '1.5px solid var(--surface-2)',
          borderRadius: 'var(--radius-xl)',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), 0 0 30px rgba(229, 169, 60, 0.15)',
          overflow: 'hidden',
        }}
      >
        {/* Accent Bar */}
        <div style={{ height: 4, background: 'linear-gradient(90deg, #E5A93C, #3A755C)' }} />

        {/* Brand Header */}
        <div
          style={{
            padding: '24px 28px 18px',
            borderBottom: '1px solid var(--surface-2)',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <div
            style={{
              width: 38,
              height: 38,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #E5A93C, #B47820)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 12px rgba(229, 169, 60, 0.3)',
            }}
          >
            <TreePine size={20} color="#12161A" />
          </div>
          <div>
            <div className="font-serif" style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-cream)' }}>
              Vaerline
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-warm-gray)' }}>Account Security & Recovery</div>
          </div>
        </div>

        {/* Content Body */}
        <div style={{ padding: '28px' }}>
          {isSuccess ? (
            <div style={{ textAlign: 'center', padding: '12px 0' }}>
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
                  margin: '0 auto 20px',
                }}
              >
                <CheckCircle2 size={38} color="#34D399" />
              </motion.div>

              <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 700, margin: '0 0 8px', color: 'var(--color-cream)' }}>
                Password Updated Successfully!
              </h2>
              <p style={{ fontSize: 13, color: 'var(--color-warm-gray)', lineHeight: 1.5, margin: '0 auto 24px', maxWidth: 360 }}>
                Your new password is now active. You are securely logged in and can return to your family tree.
              </p>

              <button
                type="button"
                onClick={() => navigate('/tree')}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                }}
              >
                <span>Continue to Family Tree</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <h2 className="font-serif" style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-cream)' }}>
                  Set a New Password
                </h2>
                <p style={{ fontSize: 13, color: 'var(--color-warm-gray)', margin: 0 }}>
                  Enter your new password below to regain access to your heirloom records.
                </p>
              </div>

              {/* Error Banner */}
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

              {/* New Password */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', marginBottom: 6 }}>
                  New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }}>
                    <Lock size={16} />
                  </div>
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min. 8 characters (1 uppercase, 1 number)"
                    className="vaerline-input"
                    style={{ paddingLeft: 38, paddingRight: 38 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>

                {/* Password Strength Indicator */}
                {passwordValue && (
                  <div style={{ marginTop: 8 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Strength:</span>
                      <span style={{ fontSize: 11, fontWeight: 600, color: strength.color }}>{strength.label}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 4, height: 4 }}>
                      {[1, 2, 3, 4].map(level => (
                        <div
                          key={level}
                          style={{
                            flex: 1,
                            height: '100%',
                            borderRadius: 2,
                            background: level <= strength.score ? strength.color : 'var(--surface-2)',
                            transition: 'background 200ms ease',
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {errors.password && (
                  <p style={{ color: '#F87171', fontSize: 11, marginTop: 4, margin: '4px 0 0' }}>{errors.password.message}</p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', marginBottom: 6 }}>
                  Confirm New Password
                </label>
                <div style={{ position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }}>
                    <ShieldCheck size={16} />
                  </div>
                  <input
                    {...register('confirmPassword')}
                    type={showConfirmPassword ? 'text' : 'password'}
                    placeholder="Re-enter your new password"
                    className="vaerline-input"
                    style={{ paddingLeft: 38, paddingRight: 38 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{ position: 'absolute', right: 12, top: 10, background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: 2 }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p style={{ color: '#F87171', fontSize: 11, marginTop: 4, margin: '4px 0 0' }}>{errors.confirmPassword.message}</p>
                )}
              </div>

              {/* Submit */}
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
                  marginTop: 6,
                  boxShadow: '0 4px 20px rgba(229, 169, 60, 0.35)',
                }}
              >
                {isLoading ? (
                  <>
                    <div className="spinner" style={{ width: 16, height: 16 }} />
                    <span>Saving new password…</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Update Password & Sign In</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
}
