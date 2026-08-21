import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Mail, Lock, Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthStore } from '../../stores/authStore';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const signIn = useAuthStore(s => s.signIn);
  const setAuthView = useAuthStore(s => s.setAuthView);
  const isLoading = useAuthStore(s => s.isLoading);
  const error = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    clearError();
    await signIn(data.email, data.password);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <h2 className="font-serif" style={{ fontSize: 26, fontWeight: 700, margin: '0 0 6px', color: 'var(--color-cream)' }}>
          Welcome back to Vaerline
        </h2>
        <p style={{ fontSize: 13, color: 'var(--color-warm-gray)', margin: 0 }}>
          Sign in to access your family tree records and community discussions.
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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
          <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', letterSpacing: '0.02em' }}>
            Password
          </label>
          <button
            type="button"
            onClick={() => setAuthView('forgot-password')}
            style={{ background: 'none', border: 'none', color: 'var(--color-amber-glow)', fontSize: 12, cursor: 'pointer', padding: 0 }}
          >
            Forgot password?
          </button>
        </div>
        <div style={{ position: 'relative' }}>
          <div style={{ position: 'absolute', left: 12, top: 12, color: 'var(--text-muted)' }}>
            <Lock size={16} />
          </div>
          <input
            {...register('password')}
            type={showPassword ? 'text' : 'password'}
            placeholder="Enter your password"
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
        {errors.password && (
          <p style={{ color: '#F87171', fontSize: 11, marginTop: 4, margin: '4px 0 0' }}>{errors.password.message}</p>
        )}
      </div>

      {/* Remember Me */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          {...register('rememberMe')}
          type="checkbox"
          id="rememberMe"
          style={{ accentColor: 'var(--color-amber-glow)', cursor: 'pointer' }}
        />
        <label htmlFor="rememberMe" style={{ fontSize: 12, color: 'var(--color-warm-gray)', cursor: 'pointer' }}>
          Remember this session on this device
        </label>
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
          marginTop: 4,
          boxShadow: '0 4px 20px rgba(229, 169, 60, 0.35)',
        }}
      >
        {isLoading ? (
          <>
            <div className="spinner" style={{ width: 16, height: 16 }} />
            <span>Signing in…</span>
          </>
        ) : (
          <>
            <LogIn size={16} />
            <span>Sign In</span>
          </>
        )}
      </button>

      {/* Switch to Register */}
      <div style={{ textAlign: 'center', paddingTop: 10, borderTop: '1px solid var(--surface-2)', marginTop: 4 }}>
        <span style={{ fontSize: 13, color: 'var(--color-warm-gray)' }}>
          Don't have an account yet?{' '}
          <button
            type="button"
            onClick={() => setAuthView('register')}
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
            Create one now
          </button>
        </span>
      </div>
    </form>
  );
}
