import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowRight, 
  MessageSquare, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  CloudCheck, 
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
          <a href="#ai" className="stitch-nav-link">AI Narratives</a>
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
              <span>Digital Heritage & Kinship Engine</span>
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
              Weave the threads of your lineage into a timeless digital tapestry. Cloud-powered mapping, secure archival, and beautifully crafted narratives for generations to come.
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
                    right: 24,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    flexWrap: 'wrap',
                    gap: 12,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#25D366', boxShadow: '0 0 10px #25D366' }} />
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#FAF7F2', letterSpacing: '0.02em' }}>
                      Interactive Live Canvas • 100% Cloud Synchronized
                    </span>
                  </div>
                  <button
                    onClick={() => navigate('/tree')}
                    style={{
                      background: 'rgba(18, 20, 22, 0.85)',
                      color: '#F2CA50',
                      border: '1px solid rgba(212, 175, 55, 0.4)',
                      borderRadius: 9999,
                      padding: '7px 18px',
                      fontSize: 12,
                      fontWeight: 600,
                      cursor: 'pointer',
                      backdropFilter: 'blur(10px)',
                      transition: 'all 150ms',
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#F2CA50';
                      e.currentTarget.style.color = '#121416';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = 'rgba(18, 20, 22, 0.85)';
                      e.currentTarget.style.color = '#F2CA50';
                    }}
                  >
                    Launch Full Canvas →
                  </button>
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
              Architected with reverence for ancestral roots and precision engineering for the future.
            </p>
          </div>

          <div className="stitch-bento-grid">
            {/* 1. Interactive Lineage Canvas */}
            <div
              className="stitch-glass-card stitch-bento-card-span2"
              style={{ padding: 36, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', position: 'relative', overflow: 'hidden', minHeight: 320 }}
            >
              <div style={{ position: 'relative', zIndex: 2, maxWidth: 440 }}>
                <span className="stitch-pill-badge" style={{ marginBottom: 16 }}>
                  Discovery
                </span>
                <h3 className="stitch-display-font" style={{ fontSize: 26, fontWeight: 600, color: '#FAF7F2', margin: '0 0 10px' }}>
                  Interactive Lineage Canvas
                </h3>
                <p style={{ color: '#A0AEC0', fontSize: 15, lineHeight: 1.6, margin: '0 0 20px' }}>
                  Trace roots with fluid Dagre-layered graph layouts. Calculate kinship degrees dynamically from any viewer perspective.
                </p>
                <button
                  onClick={() => navigate('/tree')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: '#F2CA50', background: 'none', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', padding: 0 }}
                >
                  <span>Explore Canvas</span>
                  <ArrowRight size={16} />
                </button>
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
                <p style={{ color: '#A0AEC0', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  Threaded discussions to share heirloom photos, debate historical findings, and connect relatives globally.
                </p>
              </div>

              <button
                onClick={() => navigate('/forum')}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255, 255, 255, 0.05)',
                  border: '1px solid rgba(212, 175, 55, 0.3)',
                  borderRadius: 12,
                  padding: '10px 16px',
                  color: '#F2CA50',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                  marginTop: 20,
                  transition: 'background 150ms',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'rgba(255, 255, 255, 0.05)')}
              >
                <span>Open Discussions</span>
                <ArrowRight size={14} />
              </button>
            </div>

            {/* 3. Milestone Engine */}
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
                  Milestone Engine
                </h3>
                <p style={{ color: '#A0AEC0', fontSize: 14, lineHeight: 1.6, margin: 0 }}>
                  Rolling 35-day birthday and anniversary scanner with 1-click tailored greetings delivered via WhatsApp.
                </p>
              </div>

              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: '#25D366', background: 'rgba(31, 58, 46, 0.6)', border: '1px solid rgba(46, 125, 91, 0.5)', padding: '6px 14px', borderRadius: 8, width: 'fit-content' }}>
                <CheckCircle2 size={14} />
                <span>1-Click wa.me Direct Send</span>
              </div>
            </div>

            {/* 4. AI Heritage Narratives */}
            <div
              id="ai"
              className="stitch-glass-card stitch-bento-card-span2"
              style={{ padding: 36, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', minHeight: 320 }}
            >
              <div style={{ maxWidth: 500 }}>
                <span className="stitch-pill-badge" style={{ marginBottom: 16 }}>
                  AI Powered
                </span>
                <h3 className="stitch-display-font" style={{ fontSize: 26, fontWeight: 600, color: '#FAF7F2', margin: '0 0 10px' }}>
                  AI Heritage Narratives
                </h3>
                <p style={{ color: '#A0AEC0', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
                  Transform dry dates into rich ancestral biographies. Our lineage generator synthesizes historical milestones to bring your family stories to life.
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className="stitch-btn-primary"
                  style={{ padding: '10px 24px', fontSize: 14 }}
                >
                  <Sparkles size={16} />
                  <span>Generate Family Story</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Social Proof / Testimonial ─────────────────────────────────── */}
        <section style={{ maxWidth: 1000, margin: '0 auto 100px', padding: '0 24px' }}>
          {/* Badges */}
          <div
            style={{
              borderTop: '1px solid rgba(255, 255, 255, 0.1)',
              borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
              padding: '24px 0',
              marginBottom: 48,
              display: 'flex',
              justifyContent: 'center',
              gap: 40,
              flexWrap: 'wrap',
              color: '#A0AEC0',
              fontSize: 14,
              fontWeight: 500,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Database size={17} color="#F2CA50" />
              <span>Supabase Cloud Sync</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <ShieldCheck size={17} color="#F2CA50" />
              <span>Row-Level Security</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <CloudCheck size={17} color="#F2CA50" />
              <span>Instant Cloud Redundancy</span>
            </div>
          </div>

          {/* Quote */}
          <div className="stitch-glass-card" style={{ padding: '40px 48px' }}>
            <span style={{ fontSize: 40, color: '#F2CA50', display: 'block', lineHeight: 1, marginBottom: 12 }}>“</span>
            <p
              className="font-serif"
              style={{
                fontSize: 'clamp(20px, 3vw, 26px)',
                color: '#FAF7F2',
                lineHeight: 1.4,
                margin: '0 0 24px',
                fontStyle: 'italic',
              }}
            >
              VaerLine didn’t just help us map our family tree; it gave us a beautifully designed, secure place to truly connect with our roots. It feels like a private digital museum for our heritage.
            </p>
            <div>
              <div style={{ fontWeight: 600, color: '#ffffff', fontSize: 16 }}>Eleanor Vance</div>
              <div style={{ color: '#A0AEC0', fontSize: 13 }}>Family Historian & Archivist</div>
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
              Join thousands preserving their ancestry with beautiful visual genealogies and cloud permanence.
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
