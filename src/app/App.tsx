import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useLocation, Navigate, Link } from 'react-router-dom';
import { LayoutDashboard, TreePine, Search, Plus, MessageSquare, Settings as SettingsIcon } from 'lucide-react';
import { AnimatePresence } from 'framer-motion';

import Landing from './routes/Landing';
import Login from './routes/Login';
import Signup from './routes/Signup';
import Home from './routes/Home';
import Tree from './routes/Tree';
import SearchPage from './routes/Search';
import Person from './routes/Person';
import Forum from './routes/Forum';
import ResetPassword from './routes/ResetPassword';
import Settings from './routes/Settings';
import AddMemberModal from '../components/member/AddMemberModal';
import MemberDrawer from '../components/member/MemberDrawer';
import ToastContainer from '../components/ui/ToastContainer';
import AuthModal from '../components/auth/AuthModal';
import UserMenu from '../components/auth/UserMenu';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';


import '../styles/globals.css';

function DashboardLayout({ children }: { children: React.ReactNode }) {
  const openAddModal = useUIStore(s => s.openAddMemberModal);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--color-canvas)' }}>
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        {/* Logo Header */}
        <div className="sidebar-logo">
          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #F2CA50, #D4AF37)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(242, 202, 80, 0.35)',
              }}
            >
              <TreePine size={22} color="#12161A" />
            </div>
            <div>
              <div
                className="font-display"
                style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-cream)', lineHeight: 1.1, letterSpacing: '-0.01em' }}
              >
                VaerLine
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-warm-gray)', letterSpacing: '0.04em', marginTop: 2 }}>
                Your roots, in one line.
              </div>
            </div>
          </Link>
        </div>

        {/* Navigation Items */}
        <div style={{ padding: '16px 8px', flex: 1 }}>
          {[
            { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
            { to: '/tree', icon: TreePine, label: 'Family Tree' },
            { to: '/search', icon: Search, label: 'Search & Kinship' },
            { to: '/forum', icon: MessageSquare, label: 'Discussions & Queries' },
            { to: '/settings', icon: SettingsIcon, label: 'Profile & Settings' },
          ].map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} />
              <span>{label}</span>
            </NavLink>
          ))}


        </div>

        {/* Add Member Button */}
        <div style={{ padding: '12px 16px 16px' }}>
          <button
            className="btn-primary"
            onClick={openAddModal}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              borderRadius: 'var(--radius-md)',
              padding: '11px',
              fontWeight: 600,
              boxShadow: '0 4px 16px rgba(229, 169, 60, 0.3)',
            }}
          >
            <Plus size={18} />
            <span>Add Member</span>
          </button>
        </div>

        {/* User Account / Profile Menu */}
        <UserMenu />
      </nav>

      {/* Main Content View */}
      <main style={{ flex: 1, overflow: 'hidden', position: 'relative', backgroundColor: 'var(--color-canvas)' }}>
        {children}
      </main>
    </div>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const user = useAuthStore(s => s.user);
  const session = useAuthStore(s => s.session);
  const isLoading = useAuthStore(s => s.isLoading);

  if (isLoading) {
    return (
      <div style={{ display: 'flex', height: '100vh', width: '100vw', alignItems: 'center', justifyContent: 'center', backgroundColor: '#0C0E10' }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #F2CA50, #D4AF37)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 15px rgba(242, 202, 80, 0.35)',
          }}>
            <TreePine size={24} color="#12161A" />
          </div>
          <div style={{ color: '#F2CA50', fontSize: 14, fontWeight: 600 }}>Loading your family archive...</div>
        </div>
      </div>
    );
  }

  if (!user && !session) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function AppLayout() {
  const initializeAuth = useAuthStore(s => s.initializeAuth);
  const location = useLocation();

  // Initialize live Supabase Auth on startup
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* Public Standalone Flow */}
          <Route path="/" element={<Landing />} />
          <Route path="/landing" element={<Landing />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/register" element={<Signup />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Dashboard App Routes (Protected) */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Home />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/home"
            element={<Navigate to="/dashboard" replace />}
          />
          <Route
            path="/tree"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Tree />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/search"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div style={{ height: '100%', overflowY: 'auto' }}>
                    <SearchPage />
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/forum"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <div style={{ height: '100%', overflowY: 'auto' }}>
                    <Forum />
                  </div>
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/person/:personId"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Person />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/settings"
            element={
              <ProtectedRoute>
                <DashboardLayout>
                  <Settings />
                </DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AnimatePresence>

      {/* Global Modals & Drawers */}
      <AddMemberModal />
      <MemberDrawer />
      <ToastContainer />
      <AuthModal />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
