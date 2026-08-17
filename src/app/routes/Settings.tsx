import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Camera, Save, Lock, User, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { uploadToCloudinary, isCloudinaryConfigured } from '../../lib/cloudinary';
import { useUIStore } from '../../stores/uiStore';

export default function Settings() {
  const user = useAuthStore(s => s.user);
  const updateProfile = useAuthStore(s => s.updateProfile);
  const updatePassword = useAuthStore(s => s.updatePassword);
  const addToast = useUIStore(s => s.addToast);

  // Profile form state
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl ?? '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState(false);

  // Password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSavingPassword, setIsSavingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // — Profile photo upload —
  const handlePhotoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isCloudinaryConfigured()) {
      addToast('Cloudinary is not configured. Add VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET to .env.local', 'error');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      addToast('Image must be smaller than 10 MB', 'error');
      return;
    }

    setIsUploadingPhoto(true);
    try {
      const result = await uploadToCloudinary(file);
      setAvatarUrl(result.secureUrl);
      addToast('Photo uploaded successfully!', 'success');
    } catch (err) {
      addToast(err instanceof Error ? err.message : 'Upload failed', 'error');
    } finally {
      setIsUploadingPhoto(false);
      // Reset file input so same file can be re-selected
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // — Save profile —
  const handleSaveProfile = async () => {
    if (!fullName.trim()) {
      addToast('Full name cannot be empty', 'error');
      return;
    }
    setIsSavingProfile(true);
    setProfileSuccess(false);
    const ok = await updateProfile(fullName.trim(), avatarUrl || undefined);
    setIsSavingProfile(false);
    if (ok) {
      setProfileSuccess(true);
      addToast('Profile updated!', 'success');
      setTimeout(() => setProfileSuccess(false), 3000);
    } else {
      addToast('Failed to update profile. Please try again.', 'error');
    }
  };

  // — Change password —
  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    if (!newPassword) { setPasswordError('Please enter a new password.'); return; }
    if (newPassword.length < 6) { setPasswordError('Password must be at least 6 characters.'); return; }
    if (newPassword !== confirmPassword) { setPasswordError('Passwords do not match.'); return; }

    setIsSavingPassword(true);
    const ok = await updatePassword(newPassword);
    setIsSavingPassword(false);
    if (ok) {
      addToast('Password changed successfully!', 'success');
      setNewPassword('');
      setConfirmPassword('');
    } else {
      setPasswordError('Failed to update password. Please try again.');
    }
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '32px', background: 'var(--color-canvas)' }}>
      <div style={{ maxWidth: 680, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 28 }}>

        {/* Page Title */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="font-serif" style={{ fontSize: 32, fontWeight: 700, color: 'var(--color-cream)', margin: 0, lineHeight: 1.1 }}>
            Profile &amp; Settings
          </h1>
          <p style={{ fontSize: 14, color: 'var(--color-warm-gray)', marginTop: 6 }}>
            Manage your personal details and account security
          </p>
        </motion.div>

        {/* ─── Profile Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          style={{
            background: 'var(--surface-0)',
            border: '1px solid var(--surface-2)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
          }}
        >
          {/* Card accent */}
          <div style={{ height: 4, background: 'linear-gradient(90deg, #E5A93C, #D4AF37)' }} />

          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <User size={18} color="var(--color-amber-glow)" />
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-cream)', margin: 0 }}>Personal Details</h2>
            </div>

            {/* Avatar section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                {/* Avatar preview */}
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt="Profile"
                    style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', border: '3px solid var(--color-amber-glow)', boxShadow: '0 4px 16px rgba(229,169,60,0.3)' }}
                  />
                ) : (
                  <div style={{
                    width: 80, height: 80, borderRadius: '50%',
                    background: 'linear-gradient(135deg, #E5A93C, #B47820)',
                    color: '#12161A', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 28, fontWeight: 700, fontFamily: 'Cormorant Garamond, serif',
                    border: '3px solid rgba(229,169,60,0.4)',
                  }}>
                    {fullName.split(' ').slice(0, 2).map(w => w[0]?.toUpperCase() ?? '').join('') || 'U'}
                  </div>
                )}

                {/* Upload overlay button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  title="Upload profile photo"
                  style={{
                    position: 'absolute', bottom: 0, right: 0,
                    width: 26, height: 26, borderRadius: '50%',
                    background: 'var(--color-amber-glow)', color: '#12161A',
                    border: '2px solid var(--color-canvas)',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.4)',
                  }}
                >
                  {isUploadingPhoto ? <Loader2 size={13} style={{ animation: 'spin 1s linear infinite' }} /> : <Camera size={13} />}
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={handlePhotoSelect}
                />
              </div>

              <div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-cream)' }}>
                  {user?.fullName || 'Your Name'}
                </div>
                <div style={{ fontSize: 12, color: 'var(--color-warm-gray)', marginTop: 4 }}>{user?.email}</div>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploadingPhoto}
                  style={{ marginTop: 8, fontSize: 12, color: 'var(--color-amber-glow)', background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center', gap: 4 }}
                >
                  <Camera size={12} />
                  {isUploadingPhoto ? 'Uploading…' : isCloudinaryConfigured() ? 'Upload New Photo' : 'Upload Photo (configure Cloudinary)'}
                </button>
                {avatarUrl && (
                  <button
                    type="button"
                    onClick={() => setAvatarUrl('')}
                    style={{ marginTop: 4, fontSize: 11, color: '#F87171', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                  >
                    Remove photo
                  </button>
                )}
              </div>
            </div>

            {/* Full name field */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 20 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="vaerline-input"
                placeholder="Your full name"
              />
            </div>

            {/* Email (read-only) */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 24 }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Email Address
                <span style={{ fontSize: 10, marginLeft: 6, color: 'var(--text-muted)', textTransform: 'none', fontWeight: 400 }}>(cannot be changed here)</span>
              </label>
              <input
                type="email"
                value={user?.email ?? ''}
                readOnly
                className="vaerline-input"
                style={{ opacity: 0.6, cursor: 'not-allowed' }}
              />
            </div>

            {/* Verification status */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, padding: '10px 14px', background: 'var(--surface-1)', borderRadius: 'var(--radius-sm)' }}>
              {user?.isEmailVerified ? (
                <CheckCircle2 size={15} color="#34D399" />
              ) : (
                <AlertCircle size={15} color="#FBBF24" />
              )}
              <span style={{ fontSize: 13, color: user?.isEmailVerified ? '#34D399' : '#FBBF24' }}>
                {user?.isEmailVerified ? 'Email verified' : 'Email not verified'}
              </span>
            </div>

            {/* Save button */}
            <button
              type="button"
              onClick={handleSaveProfile}
              disabled={isSavingProfile}
              className="btn-primary"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px' }}
            >
              {isSavingProfile ? (
                <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /><span>Saving…</span></>
              ) : profileSuccess ? (
                <><CheckCircle2 size={16} /><span>Saved!</span></>
              ) : (
                <><Save size={16} /><span>Save Profile</span></>
              )}
            </button>
          </div>
        </motion.div>

        {/* ─── Security Card ─── */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          style={{
            background: 'var(--surface-0)',
            border: '1px solid var(--surface-2)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
          }}
        >
          <div style={{ height: 4, background: 'linear-gradient(90deg, #3A755C, #5E8B7A)' }} />
          <div style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
              <Lock size={18} color="var(--color-emerald-leaf)" />
              <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--color-cream)', margin: 0 }}>Change Password</h2>
            </div>

            <form onSubmit={handleChangePassword} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  New Password
                </label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  className="vaerline-input"
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Confirm New Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  className="vaerline-input"
                  placeholder="Re-enter new password"
                  autoComplete="new-password"
                />
              </div>

              {passwordError && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', borderRadius: 'var(--radius-sm)' }}>
                  <AlertCircle size={14} color="#F87171" />
                  <span style={{ fontSize: 12, color: '#F87171' }}>{passwordError}</span>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  disabled={isSavingPassword}
                  className="btn-primary"
                  style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 24px', background: 'linear-gradient(135deg, #3A755C, #2d5c47)' }}
                >
                  {isSavingPassword ? (
                    <><Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} /><span>Updating…</span></>
                  ) : (
                    <><Lock size={16} /><span>Update Password</span></>
                  )}
                </button>
              </div>
            </form>
          </div>
        </motion.div>

        {/* Cloudinary note if not configured */}
        {!isCloudinaryConfigured() && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            style={{ padding: '14px 18px', background: 'rgba(229, 169, 60, 0.08)', border: '1px solid rgba(229, 169, 60, 0.25)', borderRadius: 'var(--radius-md)', fontSize: 13, color: 'var(--color-warm-gray)', lineHeight: 1.6 }}
          >
            <strong style={{ color: 'var(--color-amber-glow)' }}>📷 Photo uploads not configured.</strong><br />
            To enable profile photos, add these two variables to <code style={{ color: 'var(--color-cream)', background: 'var(--surface-2)', padding: '1px 6px', borderRadius: 4 }}>.env.local</code>:<br />
            <code style={{ color: '#A5F3FC', fontSize: 12 }}>VITE_CLOUDINARY_CLOUD_NAME=your-cloud-name</code><br />
            <code style={{ color: '#A5F3FC', fontSize: 12 }}>VITE_CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset</code>
          </motion.div>
        )}

        <style>{`
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}
