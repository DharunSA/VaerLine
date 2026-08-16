import { useState } from 'react';
import { X, Sparkles, Tag, UserCheck, MessageSquare, Check, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForumStore, type ForumCategory } from '../../stores/forumStore';
import { usePeopleStore } from '../../stores/peopleStore';
import { useAuthStore } from '../../stores/authStore';

const CATEGORY_OPTIONS: { value: ForumCategory; label: string; icon: string; desc: string }[] = [
  { value: 'ancestry', label: 'Ancestry & Origins', icon: '🧬', desc: 'Ancestral roots, village origins & migration history' },
  { value: 'missing_relatives', label: 'Missing Relatives & Tree Queries', icon: '❓', desc: 'Seeking records, lost branches & unverified relations' },
  { value: 'stories', label: 'Stories & Lore', icon: '📜', desc: 'Oral history, anecdotes & cherished family memories' },
  { value: 'photos', label: 'Old Photographs', icon: '📷', desc: 'Identify relatives in vintage photographs & portraits' },
  { value: 'events', label: 'Celebrations & Reunions', icon: '🎉', desc: 'Planning gatherings, milestones & anniversaries' },
  { value: 'general', label: 'General Discussion', icon: '💡', desc: 'Open family chat & heirloom preservation ideas' },
];

export default function CreatePostModal() {
  const isOpen = useForumStore(s => s.isCreateModalOpen);
  const closeCreateModal = useForumStore(s => s.closeCreateModal);
  const createPost = useForumStore(s => s.createPost);
  const people = usePeopleStore(s => s.people);
  const user = useAuthStore(s => s.user);

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState<ForumCategory>('ancestry');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>(['Genealogy']);
  const [linkedPersonId, setLinkedPersonId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  if (!isOpen) return null;

  const peopleList = Object.values(people);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ',') && tagInput.trim()) {
      e.preventDefault();
      const cleanTag = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(cleanTag) && tags.length < 5) {
        setTags([...tags, cleanTag]);
      }
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setTags(tags.filter(t => t !== tagToRemove));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError('Please provide a descriptive title for your query or discussion.');
      return;
    }
    if (!content.trim()) {
      setFormError('Please add details or background context.');
      return;
    }

    setIsSubmitting(true);
    setFormError('');

    await createPost({
      title: title.trim(),
      content: content.trim(),
      category,
      tags,
      linkedPersonId: linkedPersonId || undefined,
      authorName: user?.fullName || 'Family Contributor',
      authorId: user?.id,
    });

    setIsSubmitting(false);
    setTitle('');
    setContent('');
    setTags(['Genealogy']);
    setLinkedPersonId('');
  };

  return (
    <AnimatePresence>
      <div className="modal-overlay" onClick={closeCreateModal}>
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="modal-content"
          onClick={e => e.stopPropagation()}
          style={{
            maxWidth: 620,
            maxHeight: '90vh',
            display: 'flex',
            flexDirection: 'column',
            background: 'var(--surface-0)',
            border: '1.5px solid var(--surface-2)',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
          }}
        >
          {/* Accent header bar */}
          <div style={{ height: 4, flexShrink: 0, background: 'linear-gradient(90deg, #E5A93C, #3A755C)' }} />

          {/* Modal Header */}
          <div
            style={{
              padding: '20px 24px',
              borderBottom: '1px solid var(--surface-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 'var(--radius-sm)',
                  background: 'rgba(229, 169, 60, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <MessageSquare size={18} color="var(--color-amber-glow)" />
              </div>
              <div>
                <h2 className="font-serif" style={{ fontSize: 22, fontWeight: 700, margin: 0, color: 'var(--color-cream)' }}>
                  Start a Family Discussion or Query
                </h2>
                <p style={{ fontSize: 12, color: 'var(--color-warm-gray)', margin: 0 }}>
                  Share questions, unearth lineage clues, and preserve stories with your family.
                </p>
              </div>
            </div>

            <button
              onClick={closeCreateModal}
              style={{
                width: 32,
                height: 32,
                borderRadius: '50%',
                background: 'var(--surface-1)',
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

          {/* Modal Body Form */}
          <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: 18, overflowY: 'auto', flex: 1 }}>
            {formError && (
              <div
                style={{
                  padding: '10px 14px',
                  background: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: 'var(--radius-sm)',
                  color: '#FCA5A5',
                  fontSize: 13,
                }}
              >
                {formError}
              </div>
            )}

            {/* Category Selector */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-amber-glow)', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Topic Category
              </label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: 8 }}>
                {CATEGORY_OPTIONS.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    style={{
                      padding: '10px 12px',
                      background: category === cat.value ? 'rgba(229, 169, 60, 0.16)' : 'var(--surface-1)',
                      border: `1.5px solid ${category === cat.value ? 'var(--color-amber-glow)' : 'var(--surface-2)'}`,
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 150ms',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                      <span style={{ fontSize: 14 }}>{cat.icon}</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: category === cat.value ? 'var(--color-amber-glow)' : 'var(--color-cream)' }}>
                        {cat.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', marginBottom: 6 }}>
                Discussion Title / Question
              </label>
              <input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="e.g. Seeking information regarding grandmother Meena's ancestral home in Mysore"
                className="vaerline-input"
                style={{ fontSize: 14, fontWeight: 500 }}
              />
            </div>

            {/* Linked Family Member */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', marginBottom: 6 }}>
                <UserCheck size={14} color="var(--color-amber-glow)" />
                <span>Link to Family Tree Member (Optional)</span>
              </label>
              <select
                value={linkedPersonId}
                onChange={e => setLinkedPersonId(e.target.value)}
                className="vaerline-input"
                style={{ cursor: 'pointer' }}
              >
                <option value="">-- No specific member attached --</option>
                {peopleList.map(p => (
                  <option key={p.id} value={p.id}>
                    👤 {p.name} {p.profession ? `(${p.profession})` : ''}
                  </option>
                ))}
              </select>
            </div>

            {/* Content Textarea */}
            <div>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', marginBottom: 6 }}>
                Detailed Question or Story
              </label>
              <textarea
                value={content}
                onChange={e => setContent(e.target.value)}
                rows={5}
                placeholder="Describe your inquiry, share dates, known locations, or background details that family members can chime in on…"
                className="vaerline-input"
                style={{ resize: 'vertical', lineHeight: 1.6 }}
              />
            </div>

            {/* Tags */}
            <div>
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', marginBottom: 6 }}>
                <Tag size={13} color="var(--color-emerald-leaf)" />
                <span>Tags (Press Enter to add)</span>
              </label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 8 }}>
                {tags.map(t => (
                  <span
                    key={t}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                      padding: '3px 10px',
                      background: 'rgba(58, 117, 92, 0.2)',
                      border: '1px solid rgba(58, 117, 92, 0.4)',
                      borderRadius: 100,
                      color: 'var(--color-sage-highlight)',
                      fontSize: 12,
                    }}
                  >
                    #{t}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(t)}
                      style={{ background: 'none', border: 'none', color: 'inherit', cursor: 'pointer', padding: 0, marginLeft: 2 }}
                    >
                      ✕
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={e => setTagInput(e.target.value)}
                onKeyDown={handleAddTag}
                placeholder="Type tag and press Enter (e.g. #Jaipur, #1950s, #OralHistory)"
                className="vaerline-input"
              />
            </div>

            {/* Submit Actions */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                type="button"
                onClick={closeCreateModal}
                className="btn-secondary"
                style={{ padding: '10px 18px' }}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn-primary"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 22px',
                  boxShadow: '0 4px 16px rgba(229, 169, 60, 0.3)',
                }}
              >
                {isSubmitting ? (
                  <>
                    <div className="spinner" style={{ width: 16, height: 16 }} />
                    <span>Publishing…</span>
                  </>
                ) : (
                  <>
                    <Check size={16} />
                    <span>Publish Discussion</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
