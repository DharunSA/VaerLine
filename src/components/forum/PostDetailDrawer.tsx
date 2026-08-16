import { useState } from 'react';
import {
  X,
  ThumbsUp,
  CheckCircle2,
  Clock,
  Send,
  UserCheck,
  TreePine,
  Share2,
  Tag,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useForumStore } from '../../stores/forumStore';
import { usePeopleStore } from '../../stores/peopleStore';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';

function getInitials(name: string): string {
  return name
    .split(' ')
    .slice(0, 2)
    .map(w => w[0]?.toUpperCase() ?? '')
    .join('');
}

export default function PostDetailDrawer() {
  const isOpen = useForumStore(s => s.isDetailDrawerOpen);
  const closeDrawer = useForumStore(s => s.closeDetailDrawer);
  const activePostId = useForumStore(s => s.activePostId);
  const posts = useForumStore(s => s.posts);
  const comments = useForumStore(s => s.comments);
  const addComment = useForumStore(s => s.addComment);
  const togglePostUpvote = useForumStore(s => s.togglePostUpvote);
  const toggleSolved = useForumStore(s => s.toggleSolved);

  const people = usePeopleStore(s => s.people);
  const selectPerson = usePeopleStore(s => s.selectPerson);
  const focusPerson = useUIStore(s => s.focusPerson);
  const openMemberDrawer = useUIStore(s => s.openMemberDrawer);
  const addToast = useUIStore(s => s.addToast);
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const [newCommentText, setNewCommentText] = useState('');
  const [isSending, setIsSending] = useState(false);

  const post = posts.find(p => p.id === activePostId);
  const postComments = (activePostId && comments[activePostId]) || [];
  const linkedPerson = post?.linkedPersonId ? people[post.linkedPersonId] : null;

  if (!isOpen || !post) return null;

  const handleSendComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommentText.trim()) return;

    setIsSending(true);
    await addComment(
      post.id,
      newCommentText.trim(),
      user?.fullName || 'Family Member',
      user?.id
    );
    setNewCommentText('');
    setIsSending(false);
    addToast('Reply posted to discussion', 'success');
  };

  const handleJumpToTree = () => {
    if (!linkedPerson) return;
    closeDrawer();
    selectPerson(linkedPerson.id);
    navigate('/tree');
    setTimeout(() => {
      focusPerson(linkedPerson.id);
      openMemberDrawer();
    }, 100);
  };

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeDrawer}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(10, 14, 18, 0.75)',
              backdropFilter: 'blur(6px)',
              zIndex: 60,
            }}
          />

          {/* Slide-in Drawer */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 26, stiffness: 300 }}
            style={{
              position: 'fixed',
              top: 0,
              right: 0,
              bottom: 0,
              width: 520,
              maxWidth: '100%',
              zIndex: 61,
              background: 'var(--surface-0)',
              borderLeft: '1.5px solid var(--surface-2)',
              boxShadow: 'var(--shadow-xl)',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
          >
            {/* Drawer Header */}
            <div
              style={{
                padding: '20px 24px',
                borderBottom: '1px solid var(--surface-2)',
                background: 'var(--surface-1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span
                  style={{
                    padding: '4px 10px',
                    borderRadius: 100,
                    fontSize: 11,
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.04em',
                    background: post.isSolved ? 'rgba(52, 211, 153, 0.15)' : 'rgba(229, 169, 60, 0.15)',
                    color: post.isSolved ? '#34D399' : 'var(--color-amber-glow)',
                    border: `1px solid ${post.isSolved ? 'rgba(52, 211, 153, 0.3)' : 'rgba(229, 169, 60, 0.3)'}`,
                  }}
                >
                  {post.isSolved ? '✓ Solved' : 'Open Inquiry'}
                </span>
                <span style={{ fontSize: 12, color: 'var(--color-warm-gray)' }}>
                  Category: <strong style={{ color: 'var(--color-cream)' }}>{post.category}</strong>
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => toggleSolved(post.id)}
                  title={post.isSolved ? 'Mark as Open' : 'Mark as Solved'}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '6px 12px',
                    borderRadius: 'var(--radius-sm)',
                    background: post.isSolved ? 'rgba(52, 211, 153, 0.15)' : 'var(--surface-0)',
                    border: '1px solid var(--surface-2)',
                    color: post.isSolved ? '#34D399' : 'var(--color-cream)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  <CheckCircle2 size={14} />
                  <span>{post.isSolved ? 'Solved' : 'Mark Solved'}</span>
                </button>

                <button
                  onClick={closeDrawer}
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--surface-0)',
                    border: '1px solid var(--surface-2)',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Scrollable Post Content & Thread */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
              {/* Author and Date Meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 42,
                    height: 42,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #E5A93C, #B47820)',
                    color: '#12161A',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontFamily: 'Cormorant Garamond, serif',
                    fontSize: 16,
                  }}
                >
                  {getInitials(post.authorName)}
                </div>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--color-cream)' }}>
                    {post.authorName}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: 'var(--color-warm-gray)' }}>
                    <Clock size={12} />
                    <span>Published on {formattedDate}</span>
                  </div>
                </div>
              </div>

              {/* Post Title */}
              <h1
                className="font-serif"
                style={{
                  fontSize: 24,
                  fontWeight: 700,
                  color: 'var(--color-cream)',
                  lineHeight: 1.25,
                  margin: '0 0 16px',
                }}
              >
                {post.title}
              </h1>

              {/* Main Content Body */}
              <div
                style={{
                  fontSize: 14,
                  color: 'var(--color-cream)',
                  lineHeight: 1.7,
                  background: 'var(--surface-1)',
                  padding: '18px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--surface-2)',
                  marginBottom: 20,
                  whiteSpace: 'pre-wrap',
                }}
              >
                {post.content}
              </div>

              {/* Linked Member Card if attached */}
              {linkedPerson && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '14px 18px',
                    background: 'rgba(229, 169, 60, 0.08)',
                    border: '1.5px solid rgba(229, 169, 60, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    marginBottom: 20,
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div
                      style={{
                        width: 38,
                        height: 38,
                        borderRadius: '50%',
                        background: 'var(--color-amber-glow)',
                        color: '#12161A',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: 700,
                        fontFamily: 'Cormorant Garamond, serif',
                      }}
                    >
                      {getInitials(linkedPerson.name)}
                    </div>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--color-amber-glow)', textTransform: 'uppercase' }}>
                        Linked Family Member
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--color-cream)' }}>
                        {linkedPerson.name} {linkedPerson.profession ? `• ${linkedPerson.profession}` : ''}
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleJumpToTree}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 6,
                      padding: '7px 12px',
                      background: 'var(--color-amber-glow)',
                      color: '#12161A',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    <TreePine size={14} />
                    <span>View in Tree</span>
                  </button>
                </div>
              )}

              {/* Tags & Upvote Bar */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: 20,
                  borderBottom: '1px solid var(--surface-2)',
                  marginBottom: 24,
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {post.tags.map(tag => (
                    <span
                      key={tag}
                      style={{
                        fontSize: 11,
                        padding: '3px 10px',
                        background: 'var(--surface-1)',
                        border: '1px solid var(--surface-2)',
                        borderRadius: 100,
                        color: 'var(--color-warm-gray)',
                      }}
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => togglePostUpvote(post.id, user?.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                    padding: '8px 16px',
                    background: post.hasUpvoted ? 'rgba(229, 169, 60, 0.2)' : 'var(--surface-1)',
                    border: `1.5px solid ${post.hasUpvoted ? 'var(--color-amber-glow)' : 'var(--surface-2)'}`,
                    borderRadius: 100,
                    color: post.hasUpvoted ? 'var(--color-amber-glow)' : 'var(--color-cream)',
                    fontWeight: 600,
                    fontSize: 13,
                    cursor: 'pointer',
                    transition: 'all 150ms',
                  }}
                >
                  <ThumbsUp size={15} />
                  <span>{post.upvotesCount} Helpful</span>
                </button>
              </div>

              {/* Threaded Discussion Section */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
                  <MessageSquare size={16} color="var(--color-amber-glow)" />
                  <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, color: 'var(--color-cream)' }}>
                    Family Responses ({postComments.length})
                  </h3>
                </div>

                {/* Comments List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {postComments.map(comment => (
                    <motion.div
                      key={comment.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: '14px 16px',
                        background: comment.isAcceptedAnswer
                          ? 'rgba(52, 211, 153, 0.08)'
                          : 'var(--surface-1)',
                        border: `1px solid ${comment.isAcceptedAnswer ? 'rgba(52, 211, 153, 0.35)' : 'var(--surface-2)'}`,
                        borderRadius: 'var(--radius-md)',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <div
                            style={{
                              width: 28,
                              height: 28,
                              borderRadius: '50%',
                              background: 'var(--surface-2)',
                              color: 'var(--color-cream)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: 11,
                              fontWeight: 700,
                            }}
                          >
                            {getInitials(comment.authorName)}
                          </div>
                          <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-cream)' }}>
                            {comment.authorName}
                          </span>
                        </div>

                        {comment.isAcceptedAnswer && (
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 700,
                              color: '#34D399',
                              display: 'flex',
                              alignItems: 'center',
                              gap: 4,
                              background: 'rgba(52, 211, 153, 0.15)',
                              padding: '2px 8px',
                              borderRadius: 100,
                            }}
                          >
                            <CheckCircle2 size={11} />
                            <span>Verified Answer</span>
                          </span>
                        )}
                      </div>

                      <p style={{ fontSize: 13, color: 'var(--color-cream)', lineHeight: 1.6, margin: 0 }}>
                        {comment.content}
                      </p>
                    </motion.div>
                  ))}

                  {postComments.length === 0 && (
                    <div
                      style={{
                        textAlign: 'center',
                        padding: '30px 16px',
                        background: 'var(--surface-1)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px dashed var(--surface-2)',
                      }}
                    >
                      <Sparkles size={24} color="var(--color-amber-glow)" style={{ margin: '0 auto 8px' }} />
                      <p style={{ fontSize: 13, color: 'var(--color-warm-gray)', margin: 0 }}>
                        No replies yet. Be the first family member to contribute knowledge!
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Bottom Reply Box */}
            <form
              onSubmit={handleSendComment}
              style={{
                padding: '16px 20px',
                borderTop: '1px solid var(--surface-2)',
                background: 'var(--surface-1)',
                display: 'flex',
                gap: 10,
                alignItems: 'center',
              }}
            >
              <input
                type="text"
                value={newCommentText}
                onChange={e => setNewCommentText(e.target.value)}
                placeholder="Write a response or share historical context…"
                className="vaerline-input"
                style={{ flex: 1, padding: '10px 14px' }}
              />
              <button
                type="submit"
                disabled={isSending || !newCommentText.trim()}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '10px 16px',
                  opacity: !newCommentText.trim() ? 0.6 : 1,
                  cursor: !newCommentText.trim() ? 'not-allowed' : 'pointer',
                }}
              >
                <Send size={15} />
                <span>Reply</span>
              </button>
            </form>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
