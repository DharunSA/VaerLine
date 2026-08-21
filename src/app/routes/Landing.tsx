import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  MessageSquare, 
  Sparkles, 
  TreePine,
  CheckCircle2
} from 'lucide-react';
import WhatsAppIcon from '../../components/icons/WhatsAppIcon';
import { useAuthStore } from '../../stores/authStore';
import familyTreeBg from '../../assets/Family_tree.jpeg';
import landingPic from '../../assets/landing_pic.jpeg';

export default function Landing() {
  const navigate = useNavigate();
  const session = useAuthStore(s => s.session);

  const handleStart = () => {
    if (session) {
      navigate('/dashboard');
    } else {
      navigate('/signup');
    }
  };

  const handleSignIn = () => {
    if (session) {
      navigate('/dashboard');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className="stitch-root">
      {/* Background Radial Lights */}
      <div 
        style={{
          position: 'fixed',
          inset: 0,
          pointerEvents: 'none',
          zIndex: 0,
          opacity: 0.45,
          backgroundImage: `radial-gradient(circle at 50% 15%, rgba(212, 175, 55, 0.14) 0%, transparent 60%),
                            radial-gradient(circle at 85% 75%, rgba(229, 169, 60, 0.06) 0%, transparent 50%),
                            radial-gradient(circle at 15% 85%, rgba(58, 117, 92, 0.08) 0%, transparent 50%)`
        }}
      />

      {/* Floating Glass Navigation Bar */}
      <header className="stitch-nav">
        {/* Brand */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 34,
            height: 34,
            borderRadius: 10,
            background: 'linear-gradient(135deg, #F2CA50, #D4AF37)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 2px 10px rgba(242, 202, 80, 0.35)',
          }}>
            <TreePine size={20} color="#121416" />
          </div>
          <span className="stitch-display-font" style={{ fontSize: 22, fontWeight: 700, color: '#F2CA50', letterSpacing: '-0.01em' }}>
            VaerLine
          </span>
        </Link>

        {/* Links */}
        <nav className="stitch-nav-links">
          <a href="#canvas" className="stitch-nav-link">Ancestry</a>
          <a href="#forum" className="stitch-nav-link">Family Forum</a>
          <a href="#milestones" className="stitch-nav-link">Milestones</a>
          <a href="#narratives" className="stitch-nav-link">Biographies</a>
        </nav>

        {/* CTAs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {session ? (
            <button
              onClick={() => navigate('/dashboard')}
              className="stitch-btn-primary"
              style={{ padding: '8px 20px', fontSize: 13 }}
            >
              <span>Enter Dashboard</span>
              <ArrowRight size={14} />
            </button>
          ) : (
            <>
              <button
                onClick={handleSignIn}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#D0C5AF',
                  fontSize: 13,
                  fontWeight: 500,
                  cursor: 'pointer',
                  padding: '8px 14px',
                  borderRadius: 9999,
                  transition: 'color 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.color = '#F2CA50')}
                onMouseLeave={e => (e.currentTarget.style.color = '#D0C5AF')}
              >
                Sign In
              </button>
              <button
                onClick={handleStart}
                className="stitch-btn-primary"
                style={{ padding: '8px 20px', fontSize: 13 }}
              >
                Start Your Legacy
              </button>
            </>
          )}
        </div>
      </header>

      {/* Main Page Body */}
      <main style={{ position: 'relative', zIndex: 10, paddingTop: 130, paddingBottom: 80 }}>
        {/* ─── Hero Section ──────────────────────────────────────────────── */}
        <section style={{ maxWidth: 1100, margin: '0 auto 100px', padding: '0 24px', textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            {/* Pill Tag */}
            <div className="stitch-pill-badge" style={{ marginBottom: 24 }}>
              <Sparkles size={13} />
              <span>Digital Family Heritage Archive</span>
            </div>

            {/* Display Title */}
            <h1
              className="stitch-display-font"
              style={{
                fontSize: 'clamp(36px, 6vw, 68px)',
                fontWeight: 700,
                color: '#FAF7F2',
                lineHeight: 1.1,
                margin: '0 auto 20px',
                maxWidth: 900,
                letterSpacing: '-0.02em',
              }}
            >
              Preserve Your <span className="stitch-gold-text">Heritage</span>, Forever
            </h1>

            {/* Subtitle */}
            <p
              style={{
                fontSize: 'clamp(16px, 2vw, 19px)',
                color: '#A0AEC0',
                maxWidth: 680,
                margin: '0 auto 36px',
                lineHeight: 1.6,
                fontWeight: 400,
              }}
            >
              Weave the threads of your lineage into a timeless digital tapestry. Connect with relatives, celebrate milestones, and preserve cherished memories for generations to come.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 14, flexWrap: 'wrap', marginBottom: 54 }}>
              <button onClick={handleStart} className="stitch-btn-primary" style={{ padding: '14px 32px', fontSize: 15 }}>
                <span>{session ? 'Go to Dashboard' : 'Begin Exploring'}</span>
                <ArrowRight size={18} />
              </button>
              {!session && (
                <button onClick={handleSignIn} className="stitch-btn-glass" style={{ padding: '14px 28px', fontSize: 15 }}>
                  <span>Sign In</span>
                </button>
              )}
            </div>

            {/* Cinematic Glowing Family Tree Display Frame */}
            <div
              className="stitch-glass-card"
              style={{
                maxWidth: 1000,
                margin: '0 auto',
                padding: 10,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: '0 30px 80px rgba(0, 0, 0, 0.7)',
              }}
            >
              <div
                style={{
                  position: 'relative',
                  borderRadius: 18,
                  overflow: 'hidden',
                  maxHeight: 520,
                  background: '#12161A',
                }}
              >
                <img
                  src={familyTreeBg}
                  alt="VaerLine Heritage Tree Canvas"
                  style={{
                    width: '100%',
                    height: '100%',
                    maxHeight: 520,
                    objectFit: 'cover',
                    objectPosition: 'center 40%',
                    display: 'block',
                    opacity: 0.95,
                  }}
                />
                <div
                  style={{
                    position: 'absolute',
                    inset: 0,
                    background: 'linear-gradient(to top, rgba(12, 14, 16, 0.95) 0%, rgba(12, 14, 16, 0.15) 50%, transparent 100%)',
                    pointerEvents: 'none',
                  }}
                />

                {/* Floating Canvas Tag */}
                <div
                  style={{
                    position: 'absolute',
                    bottom: 20,
                    left: 24,
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 10,
                    background: 'rgba(12, 14, 16, 0.85)',
                    border: '1px solid rgba(212, 175, 55, 0.3)',
                    backdropFilter: 'blur(12px)',
                    padding: '8px 18px',
                    borderRadius: 9999,
                  }}
                >
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#25D366', boxShadow: '0 0 10px #25D366' }} />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#FAF7F2', letterSpacing: '0.02em' }}>
                    Interactive Family Tree Canvas
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </section>

        {/* ─── Bento Grid Features ────────────────────────────────────────── */}
        <section id="canvas" style={{ maxWidth: 1100, margin: '0 auto 100px', padding: '0 24px' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <h2 className="stitch-display-font" style={{ fontSize: 36, fontWeight: 600, color: '#FAF7F2', margin: '0 0 12px' }}>
              The Digital Heritage Suite
            </h2>
            <p style={{ color: '#A0AEC0', fontSize: 16, margin: 0, fontWeight: 400 }}>
              Everything your family needs to build, explore, and preserve your lineage together.
            </p>
          </div>

          <div className="stitch-bento-grid">
            {/* 1. Interactive Lineage Canvas */}
            <div
              className="stitch-glass-card stitch-bento-card-span2"
              style={{ padding: 36, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', minHeight: 320 }}
            >
              <div style={{ position: 'relative', zIndex: 2, maxWidth: 460 }}>
                <span className="stitch-pill-badge" style={{ marginBottom: 16 }}>
                  Discovery
                </span>
                <h3 className="stitch-display-font" style={{ fontSize: 26, fontWeight: 600, color: '#FAF7F2', margin: '0 0 10px' }}>
                  Interactive Lineage Canvas
                </h3>
                <p style={{ color: '#A0AEC0', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
                  Trace ancestral roots with fluid, auto-arranging family layouts. Seamlessly discover connections and calculate relationships across generations.
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#F2CA50', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '6px 14px', borderRadius: 8, width: 'fit-content' }}>
                  <TreePine size={14} />
                  <span>Dynamic Kinship Graphing</span>
                </div>
              </div>

              {/* Faded Background Art */}
              <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: '45%', opacity: 0.25, pointerEvents: 'none' }}>
                <img src={landingPic} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </div>
            </div>

            {/* 2. Family Forum */}
            <div
              id="forum"
              className="stitch-glass-card"
              style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 320 }}
            >
              <div>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(212, 175, 55, 0.15)', border: '1px solid rgba(212, 175, 55, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#F2CA50', marginBottom: 20 }}>
                  <MessageSquare size={20} />
                </div>
                <h3 className="stitch-display-font" style={{ fontSize: 22, fontWeight: 600, color: '#FAF7F2', margin: '0 0 10px' }}>
                  Family Forum
                </h3>
                <p style={{ color: '#A0AEC0', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
                  Threaded discussions to share heirloom photos, preserve family lore, and stay connected with relatives near and far.
                </p>
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#F2CA50', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '6px 14px', borderRadius: 8, width: 'fit-content' }}>
                <CheckCircle2 size={14} />
                <span>Threaded Community Discussions</span>
              </div>
            </div>

            {/* 3. Milestone Reminders */}
            <div
              id="milestones"
              className="stitch-glass-card"
              style={{ padding: 32, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 320 }}
            >
              <div>
                <div style={{ width: 44, height: 44, borderRadius: 14, background: 'rgba(37, 211, 102, 0.15)', border: '1px solid rgba(37, 211, 102, 0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#25D366', marginBottom: 20 }}>
                  <WhatsAppIcon size={22} color="#25D366" />
                </div>
                <h3 className="stitch-display-font" style={{ fontSize: 22, fontWeight: 600, color: '#FAF7F2', margin: '0 0 10px' }}>
                  Milestone Reminders
                </h3>
                <p style={{ color: '#A0AEC0', fontSize: 14, lineHeight: 1.6, margin: '0 0 24px' }}>
                  Never miss a special moment. Receive upcoming alerts for family birthdays and anniversaries with one-tap WhatsApp greetings.
                </p>
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#25D366', background: 'rgba(31, 58, 46, 0.6)', border: '1px solid rgba(46, 125, 91, 0.5)', padding: '6px 14px', borderRadius: 8, width: 'fit-content' }}>
                <CheckCircle2 size={14} />
                <span>1-Click wa.me Direct Send</span>
              </div>
            </div>

            {/* 4. Ancestral Biographies & Records */}
            <div
              id="narratives"
              className="stitch-glass-card stitch-bento-card-span2"
              style={{ padding: 36, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 320 }}
            >
              <div style={{ maxWidth: 500 }}>
                <span className="stitch-pill-badge" style={{ marginBottom: 16 }}>
                  Archival Chronicles
                </span>
                <h3 className="stitch-display-font" style={{ fontSize: 26, fontWeight: 600, color: '#FAF7F2', margin: '0 0 10px' }}>
                  Ancestral Biographies
                </h3>
                <p style={{ color: '#A0AEC0', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
                  Preserve life stories, historical milestones, and personal memories for each family member in a lasting digital record.
                </p>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, fontWeight: 600, color: '#F2CA50', background: 'rgba(212, 175, 55, 0.12)', border: '1px solid rgba(212, 175, 55, 0.3)', padding: '6px 14px', borderRadius: 8, width: 'fit-content' }}>
                  <TreePine size={14} />
                  <span>Comprehensive Heritage Profiles</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Bottom CTA ─────────────────────────────────────────────────── */}
        <section style={{ maxWidth: 860, margin: '0 auto', padding: '0 24px', textAlign: 'center' }}>
          <div
            className="stitch-glass-card"
            style={{
              padding: '50px 36px',
              border: '1px solid rgba(212, 175, 55, 0.4)',
              boxShadow: '0 0 50px rgba(212, 175, 55, 0.15)',
            }}
          >
            <h2 className="stitch-display-font" style={{ fontSize: 32, fontWeight: 700, color: '#FAF7F2', margin: '0 0 14px' }}>
              Begin Your Family's Archive Today
            </h2>
            <p style={{ color: '#A0AEC0', fontSize: 16, maxWidth: 540, margin: '0 auto 30px', fontWeight: 400 }}>
              Join thousands preserving their ancestry with beautiful visual genealogies and private archival storage.
            </p>
            <button onClick={handleStart} className="stitch-btn-primary" style={{ padding: '14px 36px', fontSize: 15 }}>
              <span>{session ? 'Return to Dashboard' : 'Create Free Heritage Account'}</span>
              <ArrowRight size={18} />
            </button>
          </div>
        </section>
      </main>

      {/* ─── Footer ───────────────────────────────────────────────────────── */}
      <footer style={{ background: '#080A0C', borderTop: '1px solid rgba(255, 255, 255, 0.08)', padding: '40px 24px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 20 }}>
          <div>
            <span className="stitch-display-font" style={{ fontSize: 20, fontWeight: 700, color: '#F2CA50' }}>VaerLine</span>
            <div style={{ fontSize: 12, color: '#718096', marginTop: 4 }}>
              © {new Date().getFullYear()} VaerLine Digital Heritage. All rights reserved.
            </div>
          </div>

          <div style={{ display: 'flex', gap: 24, fontSize: 13 }}>
            <Link to="/tree" style={{ color: '#A0AEC0', textDecoration: 'none' }}>Family Tree</Link>
            <Link to="/forum" style={{ color: '#A0AEC0', textDecoration: 'none' }}>Forum</Link>
            <Link to="/search" style={{ color: '#A0AEC0', textDecoration: 'none' }}>Kinship Search</Link>
            <Link to="/login" style={{ color: '#A0AEC0', textDecoration: 'none' }}>Sign In</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
