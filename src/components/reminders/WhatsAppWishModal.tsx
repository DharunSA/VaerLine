import { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Copy,
  Check,
  Phone,
  ExternalLink,
  Edit2,
} from 'lucide-react';
import WhatsAppIcon from '../icons/WhatsAppIcon';
import type { Person, Relationship } from '../../engine/types';
import { usePeopleStore } from '../../stores/peopleStore';
import { useUIStore } from '../../stores/uiStore';
import { useAuthStore } from '../../stores/authStore';
import { getViewerPersonId } from '../../lib/viewerHelper';
import { computeRelationship } from '../../engine/relationshipLabel';

export interface MilestoneCelebration {
  id: string;
  type: 'birthday' | 'anniversary';
  person: Person;
  spouse?: Person;
  relationship?: Relationship;
  date: string;
  nextOccurrence: Date;
  daysRemaining: number;
  turningAge?: number;
  anniversaryYears?: number;
  anniversaryMilestoneName?: string;
}

interface WhatsAppWishModalProps {
  isOpen: boolean;
  onClose: () => void;
  celebration: MilestoneCelebration | null;
}

type WishTone = 'heartfelt' | 'traditional' | 'playful' | 'group_broadcast';

const TONES: { id: WishTone; label: string }[] = [
  { id: 'heartfelt', label: 'Heartfelt' },
  { id: 'traditional', label: 'Traditional' },
  { id: 'playful', label: 'Playful' },
  { id: 'group_broadcast', label: 'Family Group' },
];

function cleanPhoneNumber(phone?: string): string {
  if (!phone) return '';
  const cleaned = phone.replace(/[^0-9+]/g, '');
  if (cleaned.startsWith('+')) return cleaned.replace('+', '');
  if (cleaned.length === 10) return `91${cleaned}`;
  return cleaned;
}

export default function WhatsAppWishModal({
  isOpen,
  onClose,
  celebration,
}: WhatsAppWishModalProps) {
  const people = usePeopleStore(s => s.people);
  const graph = usePeopleStore(s => s.graph);
  const editPerson = usePeopleStore(s => s.editPerson);
  const addToast = useUIStore(s => s.addToast);
  const user = useAuthStore(s => s.user);

  const viewerPersonId = useMemo(() => getViewerPersonId(people, user), [people, user]);
  const viewer = viewerPersonId ? people[viewerPersonId] : null;

  const [selectedTone, setSelectedTone] = useState<WishTone>('heartfelt');
  const [customMessage, setCustomMessage] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isEditingPhone, setIsEditingPhone] = useState(false);
  const [copied, setCopied] = useState(false);

  const kinshipLabel = useMemo(() => {
    if (!celebration || !viewerPersonId || celebration.person.id === viewerPersonId) {
      return null;
    }
    const rel = computeRelationship(graph, people, viewerPersonId, celebration.person.id);
    return rel?.label ?? null;
  }, [celebration, viewerPersonId, graph, people]);

  useEffect(() => {
    if (celebration) {
      const currentPerson = people[celebration.person.id];
      const initialPhone = currentPerson?.phone || celebration.person.phone || '';
      setPhoneNumber(initialPhone);
      setSelectedTone('heartfelt');
      setCopied(false);
      setIsEditingPhone(!initialPhone);
    }
  }, [celebration, people]);

  const generatedTemplates = useMemo(() => {
    if (!celebration) return { heartfelt: '', traditional: '', playful: '', group_broadcast: '' };

    const viewerName = viewer?.name?.split(' ')[0] || 'Dharun';
    const personName = celebration.person.name.split(' ')[0];
    const kinship = kinshipLabel ? kinshipLabel.toLowerCase() : 'family';

    if (celebration.type === 'birthday') {
      const age = celebration.turningAge;
      const ageStr = age ? `${age}th ` : '';

      return {
        heartfelt: `Dear ${personName},\n\nWishing you a very Happy ${ageStr}Birthday! 🎂\n\nThank you for being such a cherished ${kinship} and for all the warmth and joy you bring to our family. Wishing you good health, peace, and happiness in the year ahead.\n\nWarmly,\n${viewerName}`,
        
        traditional: `Respected ${celebration.person.name},\n\nWarmest greetings on your ${ageStr}Birthday. 🙏\n\nMay you be blessed with abundant health, long life, and prosperity. We seek your blessings and celebrate this milestone with gratitude.\n\nPranaam,\n${viewerName} & Family`,
        
        playful: `Happy ${ageStr}Birthday ${personName}! 🥳🎉\n\nWishing you a wonderful day filled with celebration, laughter, and great memories. Have a great one!\n\nBest,\n${viewerName}`,
        
        group_broadcast: `*Family Birthday Milestone*\n\nWishing *${celebration.person.name}* a very Happy ${ageStr}Birthday today! 🎉\n\nMay this year bring health, happiness, and peace.\n\n— Vaerline Family`,
      };
    } else {
      const spouseName = celebration.spouse ? celebration.spouse.name.split(' ')[0] : 'Partner';
      const yearsStr = celebration.anniversaryYears ? `${celebration.anniversaryYears}th ` : '';
      const milestoneTitle = celebration.anniversaryMilestoneName || `${yearsStr}Wedding Anniversary`;

      return {
        heartfelt: `Happy ${milestoneTitle} to ${personName} & ${spouseName}! 💐\n\nYour journey together is a beautiful inspiration to our family. Wishing you continued love, companionship, and shared joy in all the years to come.\n\nWith love,\n${viewerName}`,
        
        traditional: `Heartiest Congratulations to ${celebration.person.name} & ${celebration.spouse?.name || ''} on your ${milestoneTitle}. 🙏\n\nMay your bond be blessed with enduring happiness, peace, and health.\n\nPranaam,\n${viewerName} & Family`,
        
        playful: `Happy ${yearsStr}Anniversary to ${personName} & ${spouseName}! 🥂✨\n\nHere’s to celebrating many more wonderful chapters together!\n\nCheers,\n${viewerName}`,
        
        group_broadcast: `*Family Wedding Anniversary*\n\nHeartiest Congratulations to *${celebration.person.name} & ${celebration.spouse?.name || ''}* on their *${milestoneTitle}* today! 💐✨\n\n— Vaerline Family`,
      };
    }
  }, [celebration, viewer, kinshipLabel]);

  useEffect(() => {
    if (generatedTemplates[selectedTone]) {
      setCustomMessage(generatedTemplates[selectedTone]);
    }
  }, [selectedTone, generatedTemplates]);

  if (!isOpen || !celebration) return null;

  const handleSavePhone = async () => {
    if (celebration && phoneNumber.trim()) {
      await editPerson(celebration.person.id, { phone: phoneNumber.trim() });
      setIsEditingPhone(false);
      addToast('Phone number saved', 'success');
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(customMessage);
    setCopied(true);
    addToast('Message copied to clipboard', 'info');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = () => {
    const cleaned = cleanPhoneNumber(phoneNumber);
    const encoded = encodeURIComponent(customMessage);
    const url = cleaned
      ? `https://wa.me/${cleaned}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;

    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const formattedDate = celebration.nextOccurrence.toLocaleDateString('en-IN', {
    month: 'short',
    day: 'numeric',
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 16,
            background: 'rgba(10, 14, 18, 0.75)',
            backdropFilter: 'blur(8px)',
          }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            style={{
              width: 520,
              maxWidth: '100%',
              maxHeight: '90vh',
              display: 'flex',
              flexDirection: 'column',
              background: 'var(--surface-0)',
              border: '1px solid var(--surface-2)',
              borderRadius: 'var(--radius-lg)',
              boxShadow: '0 20px 48px rgba(0, 0, 0, 0.45)',
              overflow: 'hidden',
            }}
          >
            {/* Minimal Header with WhatsApp Logo */}
            <div
              style={{
                padding: '18px 22px',
                borderBottom: '1px solid var(--surface-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div
                  style={{
                    width: 36,
                    height: 36,
                    borderRadius: 10,
                    background: 'rgba(37, 211, 102, 0.12)',
                    border: '1px solid rgba(37, 211, 102, 0.3)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#25D366',
                    boxShadow: '0 2px 8px rgba(37, 211, 102, 0.15)',
                    flexShrink: 0,
                  }}
                >
                  <WhatsAppIcon size={19} color="#25D366" />
                </div>
                <div>
                  <h2
                    className="font-serif"
                    style={{ fontSize: 18, fontWeight: 600, margin: 0, color: 'var(--color-cream)' }}
                  >
                    Send WhatsApp Wish
                  </h2>
                  <div style={{ fontSize: 12, color: 'var(--color-warm-gray)', marginTop: 2 }}>
                    Personalized greeting for {celebration.person.name}
                    {celebration.spouse ? ` & ${celebration.spouse.name}` : ''}
                  </div>
                </div>
              </div>

              <button
                onClick={onClose}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: '50%',
                  background: 'var(--surface-1)',
                  border: '1px solid var(--surface-2)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'background 120ms',
                }}
              >
                <X size={15} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 22px', overflowY: 'auto', flex: 1 }}>
              {/* Minimal Milestone Badge */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '12px 14px',
                  background: 'var(--surface-1)',
                  border: '1px solid var(--surface-2)',
                  borderRadius: 'var(--radius-sm)',
                  marginBottom: 16,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ fontSize: 15 }}>
                    {celebration.type === 'birthday' ? '🎂' : '💍'}
                  </span>
                  <div>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--color-cream)' }}>
                      {celebration.type === 'birthday'
                        ? `${celebration.person.name} • Turning ${celebration.turningAge || ''}`
                        : `${celebration.person.name} & ${celebration.spouse?.name || ''} • ${celebration.anniversaryMilestoneName || 'Anniversary'}`}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--color-warm-gray)', marginLeft: 8 }}>
                      ({formattedDate})
                    </span>
                  </div>
                </div>

                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 4,
                    background: 'var(--surface-2)',
                    color: celebration.daysRemaining === 0 ? 'var(--color-amber-glow)' : 'var(--color-warm-gray)',
                  }}
                >
                  {celebration.daysRemaining === 0
                    ? 'Today'
                    : celebration.daysRemaining === 1
                    ? 'Tomorrow'
                    : `In ${celebration.daysRemaining}d`}
                </span>
              </div>

              {/* Phone Input Row */}
              <div style={{ marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-warm-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Phone Number
                  </label>
                  {!isEditingPhone && (
                    <button
                      type="button"
                      onClick={() => setIsEditingPhone(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--color-amber-glow)',
                        fontSize: 11,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                      }}
                    >
                      <Edit2 size={11} /> Edit
                    </button>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      flex: 1,
                      background: 'var(--surface-1)',
                      border: '1px solid var(--surface-2)',
                      borderRadius: 'var(--radius-sm)',
                      padding: '7px 12px',
                    }}
                  >
                    <Phone size={13} color="var(--color-warm-gray)" />
                    <input
                      type="text"
                      value={phoneNumber}
                      onChange={e => setPhoneNumber(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleSavePhone();
                        }
                      }}
                      placeholder="e.g. +91 98765 43210"
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

                  {isEditingPhone && (
                    <button
                      type="button"
                      onClick={handleSavePhone}
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: 12 }}
                    >
                      Save
                    </button>
                  )}
                </div>
              </div>

              {/* Minimalist Segmented Tone Selector */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-warm-gray)', display: 'block', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Tone
                </label>
                <div
                  style={{
                    display: 'flex',
                    background: 'var(--surface-1)',
                    padding: 3,
                    borderRadius: 'var(--radius-sm)',
                    border: '1px solid var(--surface-2)',
                    gap: 2,
                  }}
                >
                  {TONES.map(t => {
                    const isSelected = selectedTone === t.id;
                    return (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setSelectedTone(t.id)}
                        style={{
                          flex: 1,
                          padding: '6px 8px',
                          background: isSelected ? 'var(--surface-2)' : 'transparent',
                          border: 'none',
                          borderRadius: 4,
                          color: isSelected ? 'var(--color-cream)' : 'var(--color-warm-gray)',
                          fontSize: 12,
                          fontWeight: isSelected ? 600 : 500,
                          cursor: 'pointer',
                          transition: 'all 120ms ease',
                        }}
                      >
                        {t.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Message Editor */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--color-warm-gray)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                    Message
                  </label>
                  <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
                    {customMessage.length} chars
                  </span>
                </div>

                <textarea
                  value={customMessage}
                  onChange={e => setCustomMessage(e.target.value)}
                  rows={6}
                  className="vaerline-input"
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    fontSize: 13,
                    lineHeight: 1.5,
                    resize: 'vertical',
                    fontFamily: 'inherit',
                  }}
                />
              </div>
            </div>

            {/* Clean Action Footer */}
            <div
              style={{
                padding: '14px 22px',
                borderTop: '1px solid var(--surface-2)',
                background: 'var(--surface-0)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 10,
              }}
            >
              <button
                type="button"
                onClick={handleCopy}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  background: 'var(--surface-1)',
                  border: '1px solid var(--surface-2)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--color-cream)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                {copied ? <Check size={13} color="var(--color-amber-glow)" /> : <Copy size={13} />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>

              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  type="button"
                  onClick={onClose}
                  style={{
                    padding: '8px 14px',
                    background: 'transparent',
                    border: '1px solid var(--surface-2)',
                    borderRadius: 'var(--radius-sm)',
                    color: 'var(--color-warm-gray)',
                    fontSize: 12,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>

                <button
                  type="button"
                  onClick={handleSendWhatsApp}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 7,
                    padding: '8px 16px',
                    background: '#1F3A2E',
                    color: '#E8F5E9',
                    border: '1px solid #2E7D5B',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 150ms',
                    boxShadow: '0 2px 8px rgba(37, 211, 102, 0.15)',
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
                  <WhatsAppIcon size={15} color="#25D366" />
                  <span>Open WhatsApp</span>
                  <ExternalLink size={11} style={{ opacity: 0.7 }} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
