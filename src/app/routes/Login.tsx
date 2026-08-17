import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  TreePine, 
  AlertCircle, 
  ChevronLeft,
  RefreshCw,
  CheckCircle2
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import familyTreeBg from '../../assets/Family_tree.jpeg';

export default function Login() {
  const navigate = useNavigate();
  const signIn = useAuthStore(s => s.signIn);
  const resendVerificationEmail = useAuthStore(s => s.resendVerificationEmail);
  const isLoading = useAuthStore(s => s.isLoading);
  const authError = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [localError, setLocalError] = useState<string | null>(null);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setResendStatus('idle');

    if (!email.trim() || !password) {
      setLocalError('Please enter both your email address and password.');
      return;
    }

    const success = await signIn(email.trim(), password);
    if (success) {
      navigate('/dashboard');
    }
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    setResendStatus('sending');
    const ok = await resendVerificationEmail(email.trim());
    setResendStatus(ok ? 'sent' : 'idle');
  };

  const isUnconfirmed = (authError || '').toLowerCase().includes('email not confirmed');

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0C0E10',
        color: '#FFFFFF',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        padding: '30px 20px',
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* Cinematic Ambient Background Artwork & Lighting */}
      <div style={{ position: 'absolute', inset: 0, zIndex: 0, pointerEvents: 'none', overflow: 'hidden' }}>
        <img
          src={familyTreeBg}
          alt=""
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            transform: 'scale(1.05)',
            opacity: 0.18,
            filter: 'contrast(120%) blur(4px)',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'rgba(12, 14, 16, 0.85)' }} />
        <div
          style={{
            position: 'absolute',
            top: '-10%',
            left: '-10%',
            width: '45%',
            height: '45%',
            borderRadius: '50%',
            background: '#D4AF37',
            filter: 'blur(160px)',
            opacity: 0.12,
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-10%',
            right: '-10%',
            width: '50%',
            height: '50%',
            borderRadius: '50%',
            background: '#3A755C',
            filter: 'blur(160px)',
            opacity: 0.1,
          }}
        />
      </div>

      {/* Top Header Link */}
      <div style={{ position: 'absolute', top: 28, left: 28, zIndex: 20 }}>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontSize: 12,
            fontWeight: 600,
            color: '#D0C5AF',
            textDecoration: 'none',
            padding: '6px 14px',
            borderRadius: 9999,
            background: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            transition: 'all 150ms',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = '#F2CA50';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = '#D0C5AF';
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)';
          }}
        >
          <ChevronLeft size={14} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Login Card Container */}
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 440, zIndex: 10, position: 'relative' }}
      >
        <div
          className="stitch-glass-card"
          style={{
            padding: '40px 36px',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 30px 70px rgba(0,0,0,0.8)',
          }}
        >
          {/* Brand Logo & Welcome */}
          <div style={{ textAlign: 'center', marginBottom: 32, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #F2CA50, #D4AF37)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 16px rgba(242, 202, 80, 0.35)',
                marginBottom: 16,
              }}
            >
              <TreePine size={26} color="#121416" />
            </div>
            <h1 className="stitch-display-font" style={{ fontSize: 28, fontWeight: 700, color: '#FFFFFF', margin: '0 0 6px', letterSpacing: '-0.01em' }}>
              VaerLine
            </h1>
            <p style={{ fontSize: 14, color: '#A0AEC0', margin: 0, fontWeight: 400 }}>
              Sign in to your family archive
            </p>
          </div>

          {/* Error Message */}
          {(localError || authError) && (
            <div
              style={{
                width: '100%',
                marginBottom: 20,
                padding: '12px 14px',
                borderRadius: 12,
                background: 'rgba(186, 26, 26, 0.2)',
                border: '1px solid rgba(186, 26, 26, 0.4)',
                fontSize: 12,
                color: '#FFDAD6',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                <AlertCircle size={16} color="#FFB4AB" style={{ flexShrink: 0, marginTop: 2 }} />
                <div style={{ flex: 1, lineHeight: 1.5 }}>
                  {localError || authError}
                </div>
              </div>

              {isUnconfirmed && (
                <div style={{ marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.1)', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={resendStatus === 'sending' || resendStatus === 'sent'}
                    style={{
                      background: 'rgba(212, 175, 55, 0.2)',
                      border: '1px solid #D4AF37',
                      borderRadius: 6,
                      color: '#F2CA50',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '4px 10px',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    {resendStatus === 'sending' ? (
                      <span>Sending...</span>
                    ) : resendStatus === 'sent' ? (
                      <>
                        <CheckCircle2 size={12} color="#25D366" />
                        <span>Email resent! Check inbox</span>
                      </>
                    ) : (
                      <>
                        <RefreshCw size={11} />
                        <span>Resend Confirmation Email</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* Email Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#1A1C1E',
                border: '1px solid #4A5568',
                borderRadius: 9999,
                padding: '12px 18px',
                transition: 'border-color 150ms',
              }}
            >
              <Mail size={18} color="#A0AEC0" style={{ marginRight: 12, flexShrink: 0 }} />
              <input
                type="email"
                id="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Email address"
                required
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 14,
                  color: '#FFFFFF',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
            </div>

            {/* Password Input */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                background: '#1A1C1E',
                border: '1px solid #4A5568',
                borderRadius: 9999,
                padding: '12px 18px',
                transition: 'border-color 150ms',
              }}
            >
              <Lock size={18} color="#A0AEC0" style={{ marginRight: 12, flexShrink: 0 }} />
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Password"
                required
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  fontSize: 14,
                  color: '#FFFFFF',
                  fontFamily: "'Inter', sans-serif",
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ background: 'none', border: 'none', color: '#A0AEC0', cursor: 'pointer', padding: 0, display: 'flex' }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {/* Actions Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', padding: '0 4px', fontSize: 12, color: '#A0AEC0' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  style={{ accentColor: '#D4AF37', cursor: 'pointer' }}
                />
                <span>Remember me</span>
              </label>
              <Link
                to="/reset-password"
                style={{ color: '#D4AF37', textDecoration: 'none', fontSize: 12 }}
              >
                Forgot password?
              </Link>
            </div>

            {/* Primary Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="stitch-btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 8 }}
            >
              {isLoading ? (
                <div style={{ width: 20, height: 20, border: '2px solid #121416', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 600ms linear infinite' }} />
              ) : (
                <>
                  <span>Sign In to Legacy</span>
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Footer Link */}
          <p style={{ marginTop: 28, fontSize: 13, color: '#A0AEC0', textAlign: 'center', margin: '28px 0 0' }}>
            New to VaerLine?{' '}
            <Link
              to="/signup"
              style={{ color: '#D4AF37', fontWeight: 600, textDecoration: 'none' }}
              onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
              onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
            >
              Create Your Family Account
            </Link>
          </p>
        </div>
      </motion.main>
    </div>
  );
}
