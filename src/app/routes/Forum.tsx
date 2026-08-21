import { useEffect, useMemo } from 'react';
import {
  MessageSquare,
  Plus,
  Search,
  CheckCircle2,
  ThumbsUp,
  Clock,
  Sparkles,
  HelpCircle,
  BookOpen,
  Camera,
  Calendar,
  Users,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForumStore, type ForumCategory } from '../../stores/forumStore';
import { usePeopleStore } from '../../stores/peopleStore';
import { useAuthStore } from '../../stores/authStore';
import CreatePostModal from '../../components/forum/CreatePostModal';
import PostDetailDrawer from '../../components/forum/PostDetailDrawer';

const CATEGORIES: { id: ForumCategory; label: string; icon: React.ReactNode }[] = [
  { id: 'all', label: 'All Discussions', icon: <Flame size={15} /> },
  { id: 'ancestry', label: 'Ancestry & Origins', icon: <span>🧬</span> },
  { id: 'missing_relatives', label: 'Missing Relatives', icon: <span>❓</span> },
  { id: 'stories', label: 'Stories & Lore', icon: <span>📜</span> },
  { id: 'photos', label: 'Old Photographs', icon: <span>📷</span> },
  { id: 'events', label: 'Celebrations & Events', icon: <span>🎉</span> },
  { id: 'general', label: 'General', icon: <span>💡</span> },
];

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function Forum() {
  const posts = useForumStore(s => s.posts);
  const fetchPosts = useForumStore(s => s.fetchPosts);
  const selectedCategory = useForumStore(s => s.selectedCategory);
  const setSelectedCategory = useForumStore(s => s.setSelectedCategory);
  const searchQuery = useForumStore(s => s.searchQuery);
  const setSearchQuery = useForumStore(s => s.setSearchQuery);
  const sortBy = useForumStore(s => s.sortBy);
  const setSortBy = useForumStore(s => s.setSortBy);
  const openCreateModal = useForumStore(s => s.openCreateModal);
  const openDetailDrawer = useForumStore(s => s.openDetailDrawer);
  const togglePostUpvote = useForumStore(s => s.togglePostUpvote);
  const people = usePeopleStore(s => s.people);
  const treeId = usePeopleStore(s => s.treeId);
  const user = useAuthStore(s => s.user);

  useEffect(() => {
    fetchPosts(user?.id, treeId || undefined);
  }, [fetchPosts, user?.id, treeId]);

  // Filter and sort posts
  const filteredPosts = useMemo(() => {
    return posts
      .filter(p => {
        const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
        const matchesSearch =
          !searchQuery ||
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())) ||
          p.authorName.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'upvotes') {
          return b.upvotesCount - a.upvotesCount;
        }
        if (sortBy === 'unanswered') {
          return a.commentsCount - b.commentsCount;
        }
        // default: newest
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [posts, selectedCategory, searchQuery, sortBy]);

  const solvedCount = useMemo(() => posts.filter(p => p.isSolved).length, [posts]);

  return (
    <div style={{ height: '100%', overflowY: 'auto', padding: '36px 40px', position: 'relative' }}>
      {/* Editorial Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '4px 14px',
              borderRadius: 100,
              background: 'rgba(229, 169, 60, 0.14)',
              border: '1px solid rgba(229, 169, 60, 0.3)',
              color: 'var(--color-amber-glow)',
              fontSize: 12,
              fontWeight: 600,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              marginBottom: 10,
            }}
          >
            <MessageSquare size={13} />
            <span>Genealogy Community Forum</span>
          </div>

          <h1
            className="font-serif"
            style={{
              fontSize: 38,
              fontWeight: 700,
              margin: '0 0 6px',
              color: 'var(--color-cream)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Family Queries & Discussions
          </h1>
          <p style={{ color: 'var(--color-warm-gray)', fontSize: 15, margin: 0, maxWidth: 640 }}>
            Connect with family members, post ancestor inquiries, identify vintage photos, and collaborate on unearthing shared lineage.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          onClick={openCreateModal}
          className="btn-primary"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            padding: '12px 20px',
            fontSize: 14,
            fontWeight: 600,
            borderRadius: 'var(--radius-md)',
            boxShadow: '0 4px 20px rgba(229, 169, 60, 0.35)',
          }}
        >
          <Plus size={18} />
          <span>Ask Question / Start Topic</span>
        </button>
      </div>

      {/* Quick Summary Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        <div className="stat-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'rgba(229, 169, 60, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MessageSquare size={18} color="var(--color-amber-glow)" />
          </div>
          <div>
            <div className="font-serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-cream)' }}>
              {posts.length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-warm-gray)' }}>Total Discussions</div>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'rgba(52, 211, 153, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircle2 size={18} color="#34D399" />
          </div>
          <div>
            <div className="font-serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-cream)' }}>
              {solvedCount}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-warm-gray)' }}>Solved Ancestry Inquiries</div>
          </div>
        </div>

        <div className="stat-card" style={{ padding: '14px 18px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'rgba(91, 110, 166, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users size={18} color="#5B6EA6" />
          </div>
          <div>
            <div className="font-serif" style={{ fontSize: 20, fontWeight: 700, color: 'var(--color-cream)' }}>
              {Object.keys(people).length}
            </div>
            <div style={{ fontSize: 11, color: 'var(--color-warm-gray)' }}>Linked Family Records</div>
          </div>
        </div>
      </div>

      {/* Category Filter Pills */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 12,
          marginBottom: 20,
          borderBottom: '1px solid var(--surface-2)',
        }}
      >
        {CATEGORIES.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              padding: '8px 16px',
              borderRadius: 100,
              background: selectedCategory === cat.id ? 'rgba(229, 169, 60, 0.18)' : 'var(--surface-1)',
              border: `1.5px solid ${selectedCategory === cat.id ? 'var(--color-amber-glow)' : 'var(--surface-2)'}`,
              color: selectedCategory === cat.id ? 'var(--color-amber-glow)' : 'var(--color-warm-gray)',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 150ms',
            }}
          >
            {cat.icon}
            <span>{cat.label}</span>
          </button>
        ))}
      </div>

      {/* Search & Sort Controls Toolbar */}
      <div style={{ display: 'flex', gap: 14, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Search Query Input */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'var(--surface-1)', padding: '8px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid var(--surface-2)', flex: 1, minWidth: 260, maxWidth: 500 }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search discussions by keyword, ancestor, or tags…"
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'var(--color-cream)',
              fontSize: 13,
              width: '100%',
            }}
          />
        </div>

        {/* Sort Select */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 12, color: 'var(--color-warm-gray)', fontWeight: 500 }}>Sort by:</span>
          <select
            value={sortBy}
            onChange={e => setSortBy(e.target.value as typeof sortBy)}
            className="vaerline-input"
            style={{ width: 'auto', padding: '6px 12px', fontSize: 13 }}
          >
            <option value="newest">🕒 Most Recent</option>
            <option value="upvotes">🔥 Most Upvoted</option>
            <option value="unanswered">💬 Unanswered</option>
          </select>
        </div>
      </div>

      {/* Discussion Posts Grid */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {filteredPosts.map(post => {
          const linked = post.linkedPersonId ? people[post.linkedPersonId] : null;
          const relativeTime = new Date(post.createdAt).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
          });

          return (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              onClick={() => openDetailDrawer(post.id)}
              className="search-card"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '20px 24px',
                cursor: 'pointer',
                background: 'var(--surface-1)',
              }}
            >
              {/* Upvote Button on Left */}
              <button
                type="button"
                onClick={e => {
                  e.stopPropagation();
                  togglePostUpvote(post.id, user?.id);
                }}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '8px 12px',
                  borderRadius: 'var(--radius-sm)',
                  background: post.hasUpvoted ? 'rgba(229, 169, 60, 0.2)' : 'var(--surface-0)',
                  border: `1.5px solid ${post.hasUpvoted ? 'var(--color-amber-glow)' : 'var(--surface-2)'}`,
                  color: post.hasUpvoted ? 'var(--color-amber-glow)' : 'var(--color-cream)',
                  cursor: 'pointer',
                  minWidth: 50,
                  flexShrink: 0,
                  transition: 'all 150ms',
                }}
              >
                <ThumbsUp size={16} />
                <span style={{ fontSize: 12, fontWeight: 700, marginTop: 4 }}>{post.upvotesCount}</span>
              </button>

              {/* Main Content Area */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6, flexWrap: 'wrap' }}>
                  {post.isSolved && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        background: 'rgba(52, 211, 153, 0.15)',
                        border: '1px solid rgba(52, 211, 153, 0.3)',
                        borderRadius: 100,
                        color: '#34D399',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      <CheckCircle2 size={12} />
                      <span>Solved</span>
                    </span>
                  )}

                  <span
                    style={{
                      padding: '2px 8px',
                      background: 'rgba(229, 169, 60, 0.12)',
                      border: '1px solid rgba(229, 169, 60, 0.25)',
                      borderRadius: 100,
                      color: 'var(--color-amber-glow)',
                      fontSize: 11,
                      fontWeight: 600,
                      textTransform: 'capitalize',
                    }}
                  >
                    {post.category.replace('_', ' ')}
                  </span>

                  {linked && (
                    <span
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
                        padding: '2px 8px',
                        background: 'rgba(58, 117, 92, 0.15)',
                        border: '1px solid rgba(58, 117, 92, 0.3)',
                        borderRadius: 100,
                        color: 'var(--color-sage-highlight)',
                        fontSize: 11,
                        fontWeight: 600,
                      }}
                    >
                      👤 {linked.name}
                    </span>
                  )}
                </div>

                <h3
                  className="font-serif"
                  style={{
                    fontSize: 19,
                    fontWeight: 700,
                    margin: '0 0 6px',
                    color: 'var(--color-cream)',
                    lineHeight: 1.3,
                  }}
                >
                  {post.title}
                </h3>

                <p
                  style={{
                    fontSize: 13,
                    color: 'var(--color-warm-gray)',
                    margin: '0 0 12px',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {post.content}
                </p>

                {/* Footer Meta */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'var(--text-muted)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <div
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: '50%',
                          background: 'var(--surface-2)',
                          color: 'var(--color-cream)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 10,
                          fontWeight: 700,
                        }}
                      >
                        {getInitials(post.authorName)}
                      </div>
                      <span style={{ color: 'var(--color-cream)', fontWeight: 500 }}>{post.authorName}</span>
                    </div>
                    <span>•</span>
                    <span>{relativeTime}</span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-amber-glow)', fontWeight: 600 }}>
                    <MessageSquare size={14} />
                    <span>{post.commentsCount} {post.commentsCount === 1 ? 'response' : 'responses'}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          );
        })}

        {filteredPosts.length === 0 && (
          <div className="empty-state" style={{ background: 'var(--surface-1)', borderRadius: 'var(--radius-lg)', border: '1px dashed var(--surface-2)' }}>
            <div style={{ fontSize: 48 }}>💬</div>
            <h2 className="font-serif" style={{ fontSize: 24, color: 'var(--color-cream)', margin: '0 0 6px' }}>
              No discussions found
            </h2>
            <p style={{ color: 'var(--text-muted)', maxWidth: 400, margin: '0 0 16px' }}>
              {searchQuery
                ? `No results matching "${searchQuery}". Try a different keyword or start a new inquiry.`
                : 'No topics created in this category yet. Be the first to start a conversation!'}
            </p>
            <button onClick={openCreateModal} className="btn-primary">
              <Plus size={16} />
              <span>Start New Discussion</span>
            </button>
          </div>
        )}
      </div>

      {/* Modals & Drawers */}
      <CreatePostModal />
      <PostDetailDrawer />
    </div>
  );
}
