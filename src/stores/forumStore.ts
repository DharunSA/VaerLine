import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './authStore';
import { useUIStore } from './uiStore';

export type ForumCategory =
  | 'all'
  | 'ancestry'
  | 'missing_relatives'
  | 'stories'
  | 'photos'
  | 'events'
  | 'general';

export interface ForumPost {
  id: string;
  treeId?: string;
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  category: ForumCategory;
  tags: string[];
  linkedPersonId?: string;
  isSolved: boolean;
  upvotesCount: number;
  hasUpvoted?: boolean;
  commentsCount: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ForumComment {
  id: string;
  postId: string;
  authorId?: string;
  authorName: string;
  authorAvatar?: string;
  content: string;
  parentCommentId?: string;
  upvotesCount: number;
  hasUpvoted?: boolean;
  isAcceptedAnswer: boolean;
  createdAt: string;
}

export type ForumSortOption = 'newest' | 'upvotes' | 'unanswered';

interface ForumStore {
  // State
  posts: ForumPost[];
  comments: Record<string, ForumComment[]>; // postId -> comments[]
  activePostId: string | null;
  selectedCategory: ForumCategory;
  searchQuery: string;
  sortBy: ForumSortOption;
  isLoading: boolean;
  isCreateModalOpen: boolean;
  isDetailDrawerOpen: boolean;
  error: string | null;

  // Actions
  fetchPosts: (currentUserId?: string) => Promise<void>;
  fetchPostComments: (postId: string) => Promise<void>;
  createPost: (post: {
    title: string;
    content: string;
    category: ForumCategory;
    tags: string[];
    linkedPersonId?: string;
    authorName: string;
    authorId?: string;
  }) => Promise<string>;
  addComment: (
    postId: string,
    content: string,
    authorName: string,
    authorId?: string,
    parentCommentId?: string
  ) => Promise<void>;
  togglePostUpvote: (postId: string, currentUserId?: string) => Promise<void>;
  toggleSolved: (postId: string) => Promise<void>;
  setSelectedCategory: (category: ForumCategory) => void;
  setSearchQuery: (q: string) => void;
  setSortBy: (sort: ForumSortOption) => void;
  openCreateModal: () => void;
  closeCreateModal: () => void;
  openDetailDrawer: (postId: string) => void;
  closeDetailDrawer: () => void;
}

const isSupabaseConfigured = () => {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  return Boolean(url && key && !url.includes('placeholder'));
};

const SEED_FORUM_POSTS: ForumPost[] = [
  {
    id: '20000000-0000-0000-0000-000000000001',
    authorName: 'Dharun SA',
    title: 'Seeking ancestral village records for Raj Sharma in Rajasthan (circa 1940)',
    content: 'Grandfather Raj mentioned his ancestral home was situated near Jaipur in the early 1940s before moving to Mumbai. Does anyone hold the family property register or land deed numbers from that generation?',
    category: 'ancestry',
    tags: ['jaipur', 'property-records', 'raj-sharma'],
    linkedPersonId: '10000000-0000-0000-0000-000000000001',
    isSolved: true,
    upvotesCount: 14,
    hasUpvoted: false,
    commentsCount: 2,
    createdAt: '2026-08-01T10:00:00.000Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000002',
    authorName: 'Priya Sharma',
    title: 'Photograph Identification: 1974 Family Gathering in Bangalore',
    content: 'We discovered a black-and-white print from a summer gathering at the Cubbon Park pavilion. Can anyone confirm if the gentleman standing third from the left is great-uncle Ramesh?',
    category: 'photos',
    tags: ['vintage-photo', 'bangalore', '1974-reunion'],
    linkedPersonId: '10000000-0000-0000-0000-000000000004',
    isSolved: true,
    upvotesCount: 8,
    hasUpvoted: false,
    commentsCount: 1,
    createdAt: '2026-08-04T14:30:00.000Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000003',
    authorName: 'Kavya Sharma',
    title: 'Oral History Project: Recording Grandfather Raj’s Teaching Stories',
    content: 'I am starting an audio archive capturing Grandfather Raj’s 40 years of teaching memoirs across Mumbai municipal schools. Please share questions or topics you would like included in the interview series!',
    category: 'stories',
    tags: ['oral-history', 'memoirs', 'audio-archive'],
    linkedPersonId: '10000000-0000-0000-0000-000000000006',
    isSolved: false,
    upvotesCount: 11,
    hasUpvoted: false,
    commentsCount: 0,
    createdAt: '2026-08-08T09:15:00.000Z',
  },
  {
    id: '20000000-0000-0000-0000-000000000004',
    authorName: 'Sunita Kapoor',
    title: 'Upcoming 50th Golden Anniversary Reunion in December 2026',
    content: 'Mark your calendars for our grand family milestone celebration! We are putting together an heirloom recipe book featuring Grandma Meena’s traditional culinary secrets. Please submit your favorite recipes.',
    category: 'events',
    tags: ['golden-anniversary', 'family-reunion', 'recipes'],
    linkedPersonId: '10000000-0000-0000-0000-000000000007',
    isSolved: false,
    upvotesCount: 16,
    hasUpvoted: false,
    commentsCount: 0,
    createdAt: '2026-08-10T16:45:00.000Z',
  },
];

const SEED_COMMENTS: Record<string, ForumComment[]> = {
  '20000000-0000-0000-0000-000000000001': [
    {
      id: '30000000-0000-0000-0000-000000000001',
      postId: '20000000-0000-0000-0000-000000000001',
      authorName: 'Sunita Kapoor',
      content: 'I recall Uncle Dev mentioning that the family register was maintained in the Amber tehsil office before 1952. Let me check our father’s diary tonight.',
      upvotesCount: 4,
      hasUpvoted: false,
      isAcceptedAnswer: false,
      createdAt: '2026-08-01T12:00:00.000Z',
    },
    {
      id: '30000000-0000-0000-0000-000000000002',
      postId: '20000000-0000-0000-0000-000000000001',
      authorName: 'Arjun Sharma',
      content: 'Yes! The village was called Nawalgarh in Jhunjhunu district. I have the scanned copy of the 1956 migration certificate which lists the ancestral plot number.',
      upvotesCount: 9,
      hasUpvoted: false,
      isAcceptedAnswer: true,
      createdAt: '2026-08-01T15:30:00.000Z',
    },
  ],
  '20000000-0000-0000-0000-000000000002': [
    {
      id: '30000000-0000-0000-0000-000000000003',
      postId: '20000000-0000-0000-0000-000000000002',
      authorName: 'Arjun Sharma',
      content: 'The gentleman on the left with the pocket watch is indeed great-uncle Ramesh! He visited Bangalore during the summer of 1974 for my graduation ceremony.',
      upvotesCount: 7,
      hasUpvoted: false,
      isAcceptedAnswer: true,
      createdAt: '2026-08-04T16:00:00.000Z',
    },
  ],
};

export const useForumStore = create<ForumStore>((set, get) => ({
  posts: SEED_FORUM_POSTS,
  comments: SEED_COMMENTS,
  activePostId: null,
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'newest',
  isLoading: false,
  isCreateModalOpen: false,
  isDetailDrawerOpen: false,
  error: null,

  fetchPosts: async (currentUserId?: string) => {
    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      set({ isLoading: true, error: null });

      const session = (await supabase.auth.getSession()).data.session;
      const activeUserId = currentUserId || session?.user?.id || useAuthStore.getState().user?.id;

      const [{ data: postsData, error: pErr }, { data: commentsData }, { data: allVotes }] = await Promise.all([
        supabase.from('forum_posts').select('*').order('created_at', { ascending: false }),
        supabase.from('forum_comments').select('id, post_id'),
        supabase.from('forum_votes').select('post_id, user_id').is('comment_id', null),
      ]);

      if (pErr) throw pErr;

      // Group comment counts per post
      const commentCounts: Record<string, number> = {};
      for (const c of (commentsData ?? [])) {
        if (c.post_id) {
          commentCounts[c.post_id] = (commentCounts[c.post_id] || 0) + 1;
        }
      }

      // Group vote counts & identify if current user voted
      const voteCounts: Record<string, number> = {};
      const userVotedPostIds = new Set<string>();

      for (const v of (allVotes ?? [])) {
        if (v.post_id) {
          voteCounts[v.post_id] = (voteCounts[v.post_id] || 0) + 1;
          if (activeUserId && v.user_id === activeUserId) {
            userVotedPostIds.add(v.post_id);
          }
        }
      }

      if (postsData && postsData.length > 0) {
        const mapped: ForumPost[] = postsData.map(p => {
          const countFromVotes = voteCounts[p.id];
          const totalUpvotes = countFromVotes !== undefined ? countFromVotes : (p.upvotes_count || 0);

          return {
            id: p.id,
            treeId: p.tree_id,
            authorId: p.author_id,
            authorName: p.author_name,
            authorAvatar: p.author_avatar,
            title: p.title,
            content: p.content,
            category: (p.category as ForumCategory) || 'general',
            tags: p.tags || [],
            linkedPersonId: p.linked_person_id,
            isSolved: p.is_solved || false,
            upvotesCount: totalUpvotes,
            hasUpvoted: userVotedPostIds.has(p.id),
            commentsCount: commentCounts[p.id] || 0,
            createdAt: p.created_at,
            updatedAt: p.updated_at,
          };
        });
        set({ posts: mapped, isLoading: false });
      } else {
        set({ posts: SEED_FORUM_POSTS, isLoading: false });
      }
    } catch (err: unknown) {
      console.warn('[Vaerline Forum] Supabase query notice:', err);
      set({ posts: SEED_FORUM_POSTS, isLoading: false });
    }
  },

  fetchPostComments: async (postId: string) => {
    if (!isSupabaseConfigured()) {
      return;
    }

    try {
      const { data, error } = await supabase
        .from('forum_comments')
        .select('*')
        .eq('post_id', postId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      if (data) {
        const mapped: ForumComment[] = data.map(c => ({
          id: c.id,
          postId: c.post_id,
          authorId: c.author_id,
          authorName: c.author_name,
          authorAvatar: c.author_avatar,
          content: c.content,
          parentCommentId: c.parent_comment_id,
          upvotesCount: c.upvotes_count || 0,
          isAcceptedAnswer: c.is_accepted_answer || false,
          createdAt: c.created_at,
        }));
        set(s => ({
          comments: { ...s.comments, [postId]: mapped },
          posts: s.posts.map(p =>
            p.id === postId ? { ...p, commentsCount: mapped.length } : p
          ),
        }));
      }
    } catch (err) {
      console.warn('[Vaerline Forum] Fetch comments notice:', err);
    }
  },

  createPost: async (postData) => {
    const newId = uuidv4();
    const newPost: ForumPost = {
      id: newId,
      authorName: postData.authorName || 'Family Contributor',
      authorId: postData.authorId,
      title: postData.title,
      content: postData.content,
      category: postData.category,
      tags: postData.tags,
      linkedPersonId: postData.linkedPersonId,
      isSolved: false,
      upvotesCount: 1,
      hasUpvoted: true,
      commentsCount: 0,
      createdAt: new Date().toISOString(),
    };

    // Optimistic store update
    set(s => ({
      posts: [newPost, ...s.posts],
      isCreateModalOpen: false,
    }));

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('forum_posts').insert({
          id: newId,
          author_name: newPost.authorName,
          author_id: newPost.authorId || null,
          title: newPost.title,
          content: newPost.content,
          category: newPost.category,
          tags: newPost.tags,
          linked_person_id: newPost.linkedPersonId || null,
          is_solved: false,
          upvotes_count: 1,
        });

        if (postData.authorId) {
          await supabase.from('forum_votes').upsert({
            post_id: newId,
            user_id: postData.authorId,
            vote_type: 1,
          });
        }
      } catch (err) {
        console.error('[Vaerline Forum] Failed to persist post to Supabase:', err);
      }
    }

    return newId;
  },

  addComment: async (postId, content, authorName, authorId, parentCommentId) => {
    const commentId = uuidv4();
    const newComment: ForumComment = {
      id: commentId,
      postId,
      authorName: authorName || 'Family Member',
      authorId,
      content,
      parentCommentId,
      upvotesCount: 0,
      isAcceptedAnswer: false,
      createdAt: new Date().toISOString(),
    };

    set(s => {
      const existing = s.comments[postId] || [];
      const updatedPosts = s.posts.map(p =>
        p.id === postId ? { ...p, commentsCount: p.commentsCount + 1 } : p
      );
      return {
        comments: { ...s.comments, [postId]: [...existing, newComment] },
        posts: updatedPosts,
      };
    });

    if (isSupabaseConfigured()) {
      try {
        await supabase.from('forum_comments').insert({
          id: commentId,
          post_id: postId,
          author_name: newComment.authorName,
          author_id: newComment.authorId || null,
          content: newComment.content,
          parent_comment_id: parentCommentId || null,
        });
      } catch (err) {
        console.error('[Vaerline Forum] Failed to persist comment to Supabase:', err);
      }
    }
  },

  togglePostUpvote: async (postId: string, currentUserId?: string) => {
    const session = (await supabase.auth.getSession()).data.session;
    const activeUserId = currentUserId || session?.user?.id || useAuthStore.getState().user?.id;

    if (!activeUserId) {
      useAuthStore.getState().openAuthModal('login');
      useUIStore.getState().addToast('Please sign in to upvote discussions', 'info');
      return;
    }

    const { posts } = get();
    const target = posts.find(p => p.id === postId);
    if (!target) return;

    const willUpvote = !target.hasUpvoted;
    const delta = willUpvote ? 1 : -1;
    const newCount = Math.max(0, target.upvotesCount + delta);

    // Optimistic UI state update
    set(s => ({
      posts: s.posts.map(p =>
        p.id === postId ? { ...p, hasUpvoted: willUpvote, upvotesCount: newCount } : p
      ),
    }));

    if (isSupabaseConfigured()) {
      try {
        if (willUpvote) {
          const { error: insErr } = await supabase.from('forum_votes').upsert({
            post_id: postId,
            user_id: activeUserId,
            vote_type: 1,
          });
          if (insErr && insErr.code !== '23505') {
            console.error('[Vaerline Forum] Vote upsert notice:', insErr.message);
          }
        } else {
          const { error: delErr } = await supabase
            .from('forum_votes')
            .delete()
            .eq('post_id', postId)
            .eq('user_id', activeUserId);
          if (delErr) {
            console.error('[Vaerline Forum] Vote delete notice:', delErr.message);
          }
        }

        await supabase
          .from('forum_posts')
          .update({ upvotes_count: newCount })
          .eq('id', postId);
      } catch (err) {
        console.warn('[Vaerline Forum] Upvote update notice:', err);
      }
    }
  },

  toggleSolved: async (postId: string) => {
    const { posts } = get();
    const target = posts.find(p => p.id === postId);
    if (!target) return;

    const newSolved = !target.isSolved;
    set(s => ({
      posts: s.posts.map(p =>
        p.id === postId ? { ...p, isSolved: newSolved } : p
      ),
    }));

    if (isSupabaseConfigured()) {
      try {
        await supabase
          .from('forum_posts')
          .update({ is_solved: newSolved })
          .eq('id', postId);
      } catch (err) {
        console.warn('[Vaerline Forum] Toggle solved notice:', err);
      }
    }
  },

  setSelectedCategory: (category) => set({ selectedCategory: category }),
  setSearchQuery: (q) => set({ searchQuery: q }),
  setSortBy: (sort) => set({ sortBy: sort }),
  openCreateModal: () => set({ isCreateModalOpen: true }),
  closeCreateModal: () => set({ isCreateModalOpen: false }),
  openDetailDrawer: (postId) => {
    set({ activePostId: postId, isDetailDrawerOpen: true });
    get().fetchPostComments(postId);
  },
  closeDetailDrawer: () => set({ activePostId: null, isDetailDrawerOpen: false }),
}));
