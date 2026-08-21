import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  TreePine, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  ChevronLeft, 
  RefreshCw,
  Mail
} from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import familyTreeBg from '../../assets/Family_tree.jpeg';

export default function Signup() {
  const navigate = useNavigate();
  const signUp = useAuthStore(s => s.signUp);
  const resendVerificationEmail = useAuthStore(s => s.resendVerificationEmail);
  const isLoading = useAuthStore(s => s.isLoading);
  const authError = useAuthStore(s => s.error);
  const clearError = useAuthStore(s => s.clearError);

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);
  const [verificationSent, setVerificationSent] = useState(false);
  const [resendStatus, setResendStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);
    clearError();
    setResendStatus('idle');

    if (!fullName.trim() || !email.trim() || !password) {
      setLocalError('Please complete all fields.');
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      return;
    }

    const result = await signUp(email.trim(), password, fullName.trim());
    if (result.success) {
      if (result.requiresVerification) {
        setVerificationSent(true);
      } else {
        navigate('/dashboard');
      }
    }
  };

  const handleResend = async () => {
    if (!email.trim()) return;
    setResendStatus('sending');
    const ok = await resendVerificationEmail(email.trim());
    setResendStatus(ok ? 'sent' : 'idle');
  };

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
      {/* Ambient Blurred Background Image */}
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
            top: '20%',
            left: '50%',
            transform: 'translateX(-50%)',
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: '#D4AF37',
            filter: 'blur(180px)',
            opacity: 0.12,
          }}
        />
      </div>

      {/* Back to Home Button */}
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

      {/* Signup Container */}
      <motion.main
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{ width: '100%', maxWidth: 440, zIndex: 10, position: 'relative' }}
      >
        {/* Branding Header */}
        <div style={{ textAlign: 'center', marginBottom: 28, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
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
            Start your family's digital heirloom.
          </p>
        </div>

        {/* Card */}
        <div
          className="stitch-glass-card"
          style={{
            padding: '40px 36px',
            width: '100%',
            boxShadow: '0 30px 70px rgba(0,0,0,0.8)',
          }}
        >
          {verificationSent ? (
            <div style={{ textAlign: 'center', padding: '10px 0' }}>
              <div
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: '50%',
                  background: 'rgba(58, 117, 92, 0.2)',
                  border: '1px solid rgba(58, 117, 92, 0.4)',
                  color: '#25D366',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px',
                }}
              >
                <Mail size={26} color="#F2CA50" />
              </div>
              
              <h3 className="stitch-display-font" style={{ fontSize: 22, fontWeight: 700, color: '#FFFFFF', margin: '0 0 8px' }}>
                Account Created
              </h3>
              
              <p style={{ fontSize: 13, color: '#A0AEC0', lineHeight: 1.6, margin: '0 0 16px' }}>
                We sent a confirmation link to <span style={{ color: '#FAF7F2', fontWeight: 600 }}>{email}</span>. Click the link in your email to activate your family workspace.
              </p>

              <div
                style={{
                  padding: '12px',
                  borderRadius: 10,
                  background: 'rgba(212, 175, 55, 0.08)',
                  border: '1px solid rgba(212, 175, 55, 0.2)',
                  fontSize: 12,
                  color: '#FAF7F2',
                  textAlign: 'left',
                  lineHeight: 1.5,
                  marginBottom: 20,
                }}
              >
                💡 <strong>Didn't receive the email?</strong>
                <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: '#A0AEC0' }}>
                  <li>Check your <strong>Spam / Junk</strong> folder.</li>
                  <li>Click <strong>Resend Verification Email</strong> below.</li>
                  <li>If email confirmation is disabled on your Supabase dashboard, you can proceed straight to Sign In.</li>
                </ul>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendStatus === 'sending' || resendStatus === 'sent'}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: 9999,
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    color: '#FAF7F2',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 8,
                  }}
                >
                  {resendStatus === 'sending' ? (
                    <span>Sending email...</span>
                  ) : resendStatus === 'sent' ? (
                    <>
                      <CheckCircle2 size={15} color="#25D366" />
                      <span>Email resent successfully!</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw size={14} />
                      <span>Resend Verification Email</span>
                    </>
                  )}
                </button>

                <Link
                  to="/login"
                  className="stitch-btn-primary"
                  style={{
                    width: '100%',
                    padding: '11px',
                    fontSize: 13,
                    textAlign: 'center',
                    textDecoration: 'none',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: 6,
                  }}
                >
                  <span>Go to Sign In</span>
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Error Alert */}
              {(localError || authError) && (
                <div
                  style={{
                    width: '100%',
                    marginBottom: 20,
                    padding: '12px 14px',
                    borderRadius: 12,
                    background: 'rgba(186, 26, 26, 0.2)',
                    border: '1px solid rgba(186, 26, 26, 0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontSize: 12,
                    color: '#FFDAD6',
                  }}
                >
                  <AlertCircle size={16} color="#FFB4AB" style={{ flexShrink: 0 }} />
                  <span>{localError || authError}</span>
                </div>
              )}

              {/* Floating Label Form */}
              <form onSubmit={handleSubmit}>
                <div className="stitch-floating-box">
                  <input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="fullName">Full Name</label>
                </div>

                <div className="stitch-floating-box">
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="email">Email Address</label>
                </div>

                <div className="stitch-floating-box">
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder=" "
                    required
                  />
                  <label htmlFor="password">Password (min 6 characters)</label>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="stitch-btn-primary"
                  style={{ width: '100%', padding: '14px', fontSize: 15, marginTop: 10 }}
                >
                  {isLoading ? (
                    <div style={{ width: 20, height: 20, border: '2px solid #121416', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 600ms linear infinite' }} />
                  ) : (
                    <>
                      <span>Begin Legacy</span>
                      <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Footer Link */}
              <div style={{ marginTop: 24, textAlign: 'center' }}>
                <p style={{ fontSize: 13, color: '#A0AEC0', margin: 0 }}>
                  Already have an archive?{' '}
                  <Link
                    to="/login"
                    style={{ color: '#D4AF37', fontWeight: 600, textDecoration: 'none', marginLeft: 4 }}
                    onMouseEnter={e => (e.currentTarget.style.textDecoration = 'underline')}
                    onMouseLeave={e => (e.currentTarget.style.textDecoration = 'none')}
                  >
                    Sign In
                  </Link>
                </p>
              </div>
            </>
          )}
        </div>
      </motion.main>
    </div>
  );
}
