import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Home as HomeIcon, TreePine, Search, Plus, MessageSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import Home from './routes/Home';
import Tree from './routes/Tree';
import SearchPage from './routes/Search';
import Person from './routes/Person';
import Forum from './routes/Forum';
import ResetPassword from './routes/ResetPassword';
import AddMemberModal from '../components/member/AddMemberModal';
import MemberDrawer from '../components/member/MemberDrawer';
import ToastContainer from '../components/ui/ToastContainer';
import AuthModal from '../components/auth/AuthModal';
import UserMenu from '../components/auth/UserMenu';
import { usePeopleStore } from '../stores/peopleStore';
import { useUIStore } from '../stores/uiStore';
import { useAuthStore } from '../stores/authStore';
import { useForumStore } from '../stores/forumStore';

import '../styles/globals.css';

function AppLayout() {
  const initializeTree = usePeopleStore(s => s.initializeTree);
  const openAddModal = useUIStore(s => s.openAddMemberModal);
  const initializeAuth = useAuthStore(s => s.initializeAuth);
  const fetchPosts = useForumStore(s => s.fetchPosts);
  const location = useLocation();

  // Initialize live Supabase Auth, Cloud Tree, and Forum on first load
  useEffect(() => {
    initializeAuth();
    initializeTree();
    fetchPosts();
  }, [initializeAuth, initializeTree, fetchPosts]);

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', backgroundColor: 'var(--color-canvas)' }}>
      {/* Sidebar Navigation */}
      <nav className="sidebar">
        {/* Logo Header */}
        <div className="sidebar-logo">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 12,
                background: 'linear-gradient(135deg, #E5A93C, #B47820)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 15px rgba(229, 169, 60, 0.35)',
              }}
            >
              <TreePine size={22} color="#12161A" />
            </div>
            <div>
              <div
                className="font-serif"
                style={{ fontSize: 22, fontWeight: 700, color: 'var(--color-cream)', lineHeight: 1.1, letterSpacing: '-0.01em' }}
              >
                Vaerline
              </div>
              <div style={{ fontSize: 11, color: 'var(--color-warm-gray)', letterSpacing: '0.04em', marginTop: 2 }}>
                Your roots, in one line.
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <div style={{ padding: '16px 8px', flex: 1 }}>
          {[
            { to: '/', icon: HomeIcon, label: 'Home' },
            { to: '/tree', icon: TreePine, label: 'Family Tree' },
            { to: '/search', icon: Search, label: 'Search & Kinship' },
            { to: '/forum', icon: MessageSquare, label: 'Discussions & Queries' },
          ].map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
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
        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route
              path="/"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ height: '100%' }}
                >
                  <Home />
                </motion.div>
              }
            />
            <Route
              path="/tree"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ height: '100%' }}
                >
                  <Tree />
                </motion.div>
              }
            />
            <Route
              path="/search"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ height: '100%', overflowY: 'auto' }}
                >
                  <SearchPage />
                </motion.div>
              }
            />
            <Route
              path="/forum"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ height: '100%', overflowY: 'auto' }}
                >
                  <Forum />
                </motion.div>
              }
            />
            <Route
              path="/person/:personId"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ height: '100%' }}
                >
                  <Person />
                </motion.div>
              }
            />
            <Route
              path="/reset-password"
              element={
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15 }}
                  style={{ height: '100%' }}
                >
                  <ResetPassword />
                </motion.div>
              }
            />
          </Routes>
        </AnimatePresence>

        {/* Global Modals & Drawers */}
        <AddMemberModal />
        <MemberDrawer />
        <ToastContainer />
        <AuthModal />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout />
    </BrowserRouter>
  );
}
