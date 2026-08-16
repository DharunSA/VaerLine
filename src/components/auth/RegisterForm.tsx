import { useState, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, User, Eye, EyeOff, Check, AlertCircle, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';

const registerSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain at least one uppercase letter')
    .regex(/[0-9]/, 'Must contain at least one number'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine(val => val === true, 'You must accept the terms'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

type RegisterFormData = z.infer<typeof registerSchema>;

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

export default function RegisterForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const signUp = useAuthStore(s => s.signUp);
  const setAuthView = useAuthStore(s => s.setAuthView);
  const isLoading = useAuthStore(s => s.isLoading);
  const error = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: '',
      acceptTerms: true,
    },
  });

  const passwordValue = watch('password', '');
  const strength = useMemo(() => calculatePasswordStrength(passwordValue), [passwordValue]);

  const onSubmit = async (data: RegisterFormData) => {
    clearError();
    await signUp(data.email, data.password, data.fullName);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header Info */}
      <div>
        <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-cream)' }}>
          Create your Family Archive
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-warm-gray)', margin: 0 }}>
          Begin mapping generations and preserving heirloom lineage stories.
        </p>
      </div>

      {/* Global Error Banner */}
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

      {/* Full Name */}
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', marginBottom: 6, letterSpacing: '0.02em' }}>
          Full Name
        </label>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }}>
            <User size={16} />
          </div>
          <input
            {...register('fullName')}
            type="text"
            placeholder="e.g. Ramesh Sharma"
            className="vaerline-input"
            style={{ paddingLeft: 38 }}
          />
        </div>
        {errors.fullName && (
          <p style={{ color: '#F87171', fontSize: 11, marginTop: 4, margin: '4px 0 0' }}>{errors.fullName.message}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', marginBottom: 6, letterSpacing: '0.02em' }}>
          Email Address
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

      {/* Password */}
      <div>
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', marginBottom: 6, letterSpacing: '0.02em' }}>
          Password
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

        {/* Live Password Strength Indicator */}
        {passwordValue && (
          <div style={{ marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>Password Strength:</span>
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
        <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', marginBottom: 6, letterSpacing: '0.02em' }}>
          Confirm Password
        </label>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }}>
            <ShieldCheck size={16} />
          </div>
          <input
            {...register('confirmPassword')}
            type={showConfirmPassword ? 'text' : 'password'}
            placeholder="Re-enter your password"
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

      {/* Terms Checkbox */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 4 }}>
        <input
          {...register('acceptTerms')}
          type="checkbox"
          id="acceptTerms"
          style={{ accentColor: 'var(--color-amber-glow)', marginTop: 3, cursor: 'pointer' }}
        />
        <label htmlFor="acceptTerms" style={{ fontSize: 12, color: 'var(--color-warm-gray)', cursor: 'pointer', lineHeight: 1.4 }}>
          I agree to the <span style={{ color: 'var(--color-cream)', textDecoration: 'underline' }}>Privacy Policy</span> and grant permission to securely preserve family genealogy records.
        </label>
      </div>
      {errors.acceptTerms && (
        <p style={{ color: '#F87171', fontSize: 11, margin: '-8px 0 0' }}>{errors.acceptTerms.message}</p>
      )}

      {/* Submit Button */}
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
            <span>Creating account…</span>
          </>
        ) : (
          <>
            <Check size={16} />
            <span>Create Heirloom Account</span>
          </>
        )}
      </button>

      {/* Switch to Login */}
      <div style={{ textAlign: 'center', paddingTop: 8, borderTop: '1px solid var(--surface-2)', marginTop: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--color-warm-gray)' }}>
          Already have an account?{' '}
          <button
            type="button"
            onClick={() => setAuthView('login')}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-amber-glow)',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Sign in here
          </button>
        </span>
      </div>
    </form>
  );
}
