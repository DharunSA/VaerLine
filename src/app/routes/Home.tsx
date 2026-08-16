import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Users, Trophy, Sparkles, TrendingUp, Cake, ArrowRight, GitBranch, Heart, Phone, Gift } from 'lucide-react';
import WhatsAppIcon from '../../components/icons/WhatsAppIcon';
import { usePeopleStore } from '../../stores/peopleStore';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { getViewerPersonId } from '../../lib/viewerHelper';
import { computeRelationship } from '../../engine/relationshipLabel';
import SearchBar from '../../components/search/SearchBar';
import SearchResultCard from '../../components/search/SearchResultCard';
import FamilyStoryPanel from '../../components/ai/FamilyStoryPanel';
import NLAddMemberBar from '../../components/ai/NLAddMemberBar';
import WhatsAppWishModal, { type MilestoneCelebration } from '../../components/reminders/WhatsAppWishModal';
import { searchPeople } from '../../lib/fuzzySearch';
import familyTreeBg from '../../assets/Family_tree.jpeg';

export default function Home() {
  const people = usePeopleStore(s => s.people);
  const relationships = usePeopleStore(s => s.relationships);
  const graph = usePeopleStore(s => s.graph);
  const selectPerson = usePeopleStore(s => s.selectPerson);
  const openDrawer = useUIStore(s => s.openMemberDrawer);
  const focusPerson = useUIStore(s => s.focusPerson);
  const searchQuery = useUIStore(s => s.searchQuery);
  const user = useAuthStore(s => s.user);
  const navigate = useNavigate();

  const [activeCelebration, setActiveCelebration] = useState<MilestoneCelebration | null>(null);
  const [isWishModalOpen, setIsWishModalOpen] = useState(false);

  const peopleList = Object.values(people);

  // Viewer (me) — match logged-in user profile or fall back to bio self
  const viewerPersonId = useMemo(() => {
    return getViewerPersonId(people, user);
  }, [people, user]);

  // ── Stats ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => {
    if (peopleList.length === 0) return null;

    const withDob = peopleList.filter(p => p.dob);
    const living = peopleList.filter(p => !p.dod);
    const deceased = peopleList.filter(p => p.dod);

    const byYear = withDob.map(p => new Date(p.dob!).getFullYear());
    const oldest = byYear.length ? Math.min(...byYear) : null;
    const youngest = byYear.length ? Math.max(...byYear) : null;

    // Calculate max depth for generations
    let maxDepth = 0;
    const roots = peopleList.filter(p => (graph.parentsOf.get(p.id)?.length ?? 0) === 0);
    const getDepth = (id: string, depth: number): number => {
      const children = graph.childrenOf.get(id) ?? [];
      if (children.length === 0) return depth;
      return Math.max(...children.map(c => getDepth(c, depth + 1)));
    };
    for (const r of roots) {
      maxDepth = Math.max(maxDepth, getDepth(r.id, 1));
    }

    // Profession stats
    const professions = peopleList.filter(p => p.profession).map(p => p.profession!);
    const professionCounts = professions.reduce<Record<string, number>>((acc, p) => {
      acc[p] = (acc[p] ?? 0) + 1;
      return acc;
    }, {});
    const topProfession = Object.entries(professionCounts).sort((a, b) => b[1] - a[1])[0]?.[0];

    // Completeness
    const fields = ['dob', 'profession', 'location', 'bio', 'photoUrl'] as const;
    const totalPossible = peopleList.length * fields.length;
    const filled = peopleList.reduce((sum, p) => sum + fields.filter(f => p[f]).length, 0);
    const completeness = Math.round((filled / totalPossible) * 100);

    return {
      total: peopleList.length,
      living: living.length,
      deceased: deceased.length,
      generations: maxDepth + 1,
      oldest,
      youngest,
      topProfession,
      completeness,
    };
  }, [people, graph, peopleList]);

  // ── Upcoming Birthdays & Anniversaries (rolling 35-day window) ───────────
  const upcomingCelebrations = useMemo<MilestoneCelebration[]>(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const windowMs = 35 * 24 * 60 * 60 * 1000; // 35 days window

    const milestones: MilestoneCelebration[] = [];

    // 1. Birthdays
    for (const p of peopleList) {
      if (!p.dob || p.dod) continue;
      const bday = new Date(p.dob);
      if (isNaN(bday.getTime())) continue;

      let nextOccur = new Date(today.getFullYear(), bday.getMonth(), bday.getDate());
      if (nextOccur.getTime() < todayMs) {
        nextOccur = new Date(today.getFullYear() + 1, bday.getMonth(), bday.getDate());
      }

      const diffMs = nextOccur.getTime() - todayMs;
      if (diffMs <= windowMs) {
        const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));
        const turningAge = nextOccur.getFullYear() - bday.getFullYear();

        milestones.push({
          id: `bday-${p.id}`,
          type: 'birthday',
          person: p,
          date: p.dob,
          nextOccurrence: nextOccur,
          daysRemaining,
          turningAge,
        });
      }
    }

    // 2. Anniversaries
    const processedCouples = new Set<string>();
    for (const r of relationships) {
      if (r.type !== 'SPOUSE_OF' || !r.marriageDate) continue;
      const p1 = people[r.fromPersonId];
      const p2 = people[r.toPersonId];
      if (!p1 || !p2) continue;

      const coupleKey = [p1.id, p2.id].sort().join(':');
      if (processedCouples.has(coupleKey)) continue;
      processedCouples.add(coupleKey);

      const mDate = new Date(r.marriageDate);
      if (isNaN(mDate.getTime())) continue;

      let nextOccur = new Date(today.getFullYear(), mDate.getMonth(), mDate.getDate());
      if (nextOccur.getTime() < todayMs) {
        nextOccur = new Date(today.getFullYear() + 1, mDate.getMonth(), mDate.getDate());
      }

      const diffMs = nextOccur.getTime() - todayMs;
      if (diffMs <= windowMs) {
        const daysRemaining = Math.round(diffMs / (1000 * 60 * 60 * 24));
        const years = nextOccur.getFullYear() - mDate.getFullYear();

        let milestoneName = `${years}th Wedding Anniversary`;
        if (years === 50) milestoneName = '50th Golden Anniversary';
        else if (years === 25) milestoneName = '25th Silver Anniversary';
        else if (years === 60) milestoneName = '60th Diamond Anniversary';
        else if (years === 30) milestoneName = '30th Pearl Anniversary';
        else if (years === 40) milestoneName = '40th Ruby Anniversary';

        milestones.push({
          id: `anni-${coupleKey}`,
          type: 'anniversary',
          person: p1,
          spouse: p2,
          relationship: r,
          date: r.marriageDate,
          nextOccurrence: nextOccur,
          daysRemaining,
          anniversaryYears: years,
          anniversaryMilestoneName: milestoneName,
        });
      }
    }

    return milestones.sort((a, b) => a.daysRemaining - b.daysRemaining);
  }, [peopleList, relationships, people]);

  // ── Search results ────────────────────────────────────────────────────────
  const searchResults = useMemo(() => {
    if (!searchQuery) return [];
    const results = searchPeople(searchQuery, peopleList);
    return results.map(({ person }) => {
      const rel =
        viewerPersonId && person.id !== viewerPersonId
          ? computeRelationship(graph, people, viewerPersonId, person.id)
          : null;
      return { person, relationship: rel ?? undefined };
    });
  }, [searchQuery, peopleList, viewerPersonId, graph, people]);

  const handleOpenWish = (cel: MilestoneCelebration) => {
    setActiveCelebration(cel);
    setIsWishModalOpen(true);
  };

  return (
    <div style={{ height: '100%', overflowY: 'auto', position: 'relative' }}>
      {/* Subtle Hero Overlay Background */}
      <div
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: 380,
          backgroundImage: `linear-gradient(to bottom, rgba(18, 22, 26, 0.45), rgba(18, 22, 26, 0.98)), url(${familyTreeBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 20%',
          pointerEvents: 'none',
          zIndex: 0,
        }}
      />

      <div style={{ position: 'relative', zIndex: 1, padding: '36px 40px' }}>
        {/* Editorial Hero Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          style={{ marginBottom: 32 }}
        >
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
              marginBottom: 12,
            }}
          >
            <GitBranch size={14} />
            <span>Interactive Living Ancestry</span>
          </div>

          <h1
            className="font-serif"
            style={{
              fontSize: 42,
              fontWeight: 700,
              margin: '0 0 8px',
              color: 'var(--color-cream)',
              lineHeight: 1.1,
              letterSpacing: '-0.02em',
            }}
          >
            Vaerline — Your Roots, in One Line.
          </h1>
          <p style={{ color: 'var(--color-warm-gray)', fontSize: 16, margin: 0, maxWidth: 640, lineHeight: 1.5 }}>
            {peopleList.length === 0
              ? 'Plant your family roots and map generations with real-time AI parsing and topological graph rendering.'
              : `Preserving ${peopleList.length} family members across ${stats?.generations ?? 1} generation${(stats?.generations ?? 1) > 1 ? 's' : ''}. Map connections, explore lineages, and generate heirloom stories.`}
          </p>
        </motion.div>

        {/* Elevated AI Feature Input Bar & Quick Search */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 36, maxWidth: 1000 }}>
          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-amber-glow)', marginBottom: 8, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              ✨ Dual AI Member Parser
            </label>
            <NLAddMemberBar />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--color-warm-gray)', marginBottom: 8, letterSpacing: '0.03em', textTransform: 'uppercase' }}>
              🔍 Kinship & Name Search
            </label>
            <SearchBar placeholder="Search members by name, profession, or location…" />
          </div>
        </div>

        {/* Search results overlay */}
        <AnimatePresence>
          {searchQuery && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              style={{ marginBottom: 32 }}
            >
              <h2 style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 12 }}>
                {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} for "{searchQuery}"
              </h2>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 640 }}>
                {searchResults.map(({ person, relationship }) => (
                  <SearchResultCard
                    key={person.id}
                    person={person}
                    relationship={relationship}
                    onClick={() => {
                      selectPerson(person.id);
                      navigate('/tree');
                      setTimeout(() => { focusPerson(person.id); openDrawer(); }, 100);
                    }}
                  />
                ))}
                {searchResults.length === 0 && (
                  <p style={{ color: 'var(--text-muted)', fontSize: 14 }}>No members found matching "{searchQuery}"</p>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {!searchQuery && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 20 }}>
            {/* Stats cards */}
            {stats && (
              <>
                <StatCard icon={<Users size={20} />} label="Family Members" value={stats.total} color="var(--color-amber-glow)" />
                <StatCard icon={<TrendingUp size={20} />} label="Generations" value={stats.generations} color="var(--color-emerald-leaf)" />
                {stats.topProfession && (
                  <StatCard icon={<Trophy size={20} />} label="Top Profession" value={stats.topProfession} color="#5B6EA6" />
                )}
                <div className="stat-card" style={{ gridColumn: 'span 1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-sm)', background: 'rgba(229, 169, 60, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Sparkles size={18} color="var(--color-amber-glow)" />
                    </div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>Tree Completeness</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 10 }}>
                    <span className="font-serif" style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
                      {stats.completeness}%
                    </span>
                  </div>
                  <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3, overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${stats.completeness}%` }}
                      transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
                      style={{ height: '100%', background: 'var(--color-amber-glow)', borderRadius: 3 }}
                    />
                  </div>
                  <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 6 }}>
                    Add dates, professions, and bios to enrich heirloom records
                  </p>
                </div>
              </>
            )}

            {/* Upcoming Family Celebrations */}
            {upcomingCelebrations.length > 0 && (
              <div className="stat-card" style={{ gridColumn: '1 / -1', padding: '20px 22px' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <div>
                    <h3
                      className="font-serif"
                      style={{ fontSize: 18, fontWeight: 600, margin: 0, color: 'var(--color-cream)' }}
                    >
                      Upcoming Celebrations
                    </h3>
                    <p style={{ fontSize: 12, color: 'var(--color-warm-gray)', margin: '2px 0 0' }}>
                      Milestones in the next 35 days
                    </p>
                  </div>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '3px 9px',
                      borderRadius: 100,
                      background: 'var(--surface-1)',
                      border: '1px solid var(--surface-2)',
                      color: 'var(--color-warm-gray)',
                    }}
                  >
                    {upcomingCelebrations.length} upcoming
                  </span>
                </div>

                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
                    gap: 12,
                  }}
                >
                  {upcomingCelebrations.map(cel => {
                    const isBday = cel.type === 'birthday';
                    const celDate = cel.nextOccurrence.toLocaleDateString('en-IN', {
                      month: 'short',
                      day: 'numeric',
                    });

                    return (
                      <div
                        key={cel.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 14px',
                          background: 'var(--surface-0)',
                          border: '1px solid var(--surface-2)',
                          borderRadius: 'var(--radius-sm)',
                          gap: 12,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
                          <span style={{ fontSize: 16 }}>
                            {isBday ? '🎂' : '💍'}
                          </span>

                          <div style={{ minWidth: 0, flex: 1 }}>
                            <div
                              style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--color-cream)',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                              }}
                            >
                              {cel.person.name}
                              {cel.spouse ? ` & ${cel.spouse.name}` : ''}
                            </div>
                            <div
                              style={{
                                fontSize: 11,
                                color: 'var(--color-warm-gray)',
                                marginTop: 1,
                              }}
                            >
                              {isBday
                                ? `Turning ${cel.turningAge || ''} • ${celDate}`
                                : `${cel.anniversaryMilestoneName || 'Anniversary'} • ${celDate}`}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
                          <span
                            style={{
                              fontSize: 10,
                              fontWeight: 600,
                              padding: '2px 6px',
                              borderRadius: 3,
                              background: 'var(--surface-1)',
                              color: cel.daysRemaining === 0 ? 'var(--color-amber-glow)' : 'var(--color-warm-gray)',
                            }}
                          >
                            {cel.daysRemaining === 0
                              ? 'Today'
                              : cel.daysRemaining === 1
                              ? 'Tomorrow'
                              : `In ${cel.daysRemaining}d`}
                          </span>

                          <button
                            type="button"
                            onClick={() => handleOpenWish(cel)}
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '5px 11px',
                              background: '#1F3A2E',
                              border: '1px solid #2E7D5B',
                              borderRadius: 'var(--radius-sm)',
                              color: '#E8F5E9',
                              fontSize: 11,
                              fontWeight: 600,
                              cursor: 'pointer',
                              transition: 'all 140ms',
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.background = '#28543E';
                              e.currentTarget.style.borderColor = '#34D399';
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.background = '#1F3A2E';
                              e.currentTarget.style.borderColor = '#2E7D5B';
                            }}
                          >
                            <WhatsAppIcon size={12} color="#25D366" />
                            <span>Wish</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Family story */}
            <div style={{ gridColumn: '1 / -1' }}>
              <FamilyStoryPanel />
            </div>

            {/* All members grid */}
            {peopleList.length > 0 && (
              <div className="stat-card" style={{ gridColumn: '1 / -1' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 className="font-serif" style={{ fontSize: 22, fontWeight: 600, margin: 0 }}>
                    Family Directory
                  </h3>
                  <button
                    onClick={() => navigate('/tree')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: 'var(--color-amber-glow)',
                      fontSize: 13,
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                    }}
                  >
                    <span>View Interactive Canvas</span>
                    <ArrowRight size={14} />
                  </button>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 12 }}>
                  {peopleList.map(person => {
                    const rel = viewerPersonId && person.id !== viewerPersonId
                      ? computeRelationship(graph, people, viewerPersonId, person.id)
                      : null;
                    return (
                      <SearchResultCard
                        key={person.id}
                        person={person}
                        relationship={rel ?? undefined}
                        onClick={() => {
                          selectPerson(person.id);
                          navigate('/tree');
                          setTimeout(() => { focusPerson(person.id); openDrawer(); }, 100);
                        }}
                      />
                    );
                  })}
                </div>
              </div>
            )}

            {/* Empty state */}
            {peopleList.length === 0 && (
              <div style={{ gridColumn: '1 / -1' }} className="empty-state">
                <div style={{ fontSize: 72 }}>🌱</div>
                <h2 className="font-serif" style={{ fontSize: 28, color: 'var(--text-secondary)' }}>
                  Plant your family tree
                </h2>
                <p style={{ color: 'var(--text-muted)', maxWidth: 360, lineHeight: 1.6 }}>
                  Every great family tree starts with a single person. Add yourself, then your parents, siblings, and children. The tree will grow with your story.
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* WhatsApp Wish Interactive Modal */}
      <WhatsAppWishModal
        isOpen={isWishModalOpen}
        onClose={() => setIsWishModalOpen(false)}
        celebration={activeCelebration}
      />
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <motion.div
      className="stat-card"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 'var(--radius-sm)',
            background: `${color}20`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color,
          }}
        >
          {icon}
        </div>
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)' }}>{label}</span>
      </div>
      <div className="font-serif" style={{ fontSize: 32, fontWeight: 700, color: 'var(--text-primary)' }}>
        {value}
      </div>
    </motion.div>
  );
}
