import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './authStore';
import { usePeopleStore } from './peopleStore';
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
  fetchPosts: (currentUserId?: string, targetTreeId?: string) => Promise<void>;
  fetchPostComments: (postId: string) => Promise<void>;
  createPost: (post: {
    title: string;
    content: string;
    category: ForumCategory;
    tags: string[];
    linkedPersonId?: string;
    authorName: string;
    authorId?: string;
    treeId?: string;
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

export const useForumStore = create<ForumStore>((set, get) => ({
  posts: [],
  comments: {},
  activePostId: null,
  selectedCategory: 'all',
  searchQuery: '',
  sortBy: 'newest',
  isLoading: false,
  isCreateModalOpen: false,
  isDetailDrawerOpen: false,
  error: null,

  fetchPosts: async (currentUserId?: string, targetTreeId?: string) => {
    try {
      set({ isLoading: true, error: null });

      const session = (await supabase.auth.getSession()).data.session;
      const activeUserId = currentUserId || session?.user?.id || useAuthStore.getState().user?.id;
      const activeTreeId = targetTreeId || usePeopleStore.getState().treeId;

      let query = supabase.from('forum_posts').select('*').order('created_at', { ascending: false });

      if (activeTreeId) {
        query = query.eq('tree_id', activeTreeId);
      } else if (activeUserId) {
        query = query.eq('author_id', activeUserId);
      }

      const [{ data: postsData, error: pErr }, { data: commentsData }, { data: allVotes }] = await Promise.all([
        query,
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

      if (postsData) {
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
        set({ posts: [], isLoading: false });
      }
    } catch (err: unknown) {
      console.warn('[Vaerline Forum] Query notice:', err);
      set({ posts: [], isLoading: false });
    }
  },

  fetchPostComments: async (postId: string) => {
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
    const treeId = postData.treeId || usePeopleStore.getState().treeId || undefined;
    const authorId = postData.authorId || useAuthStore.getState().user?.id || undefined;
    const authorName = postData.authorName || useAuthStore.getState().user?.fullName || 'Family Contributor';

    const newPost: ForumPost = {
      id: newId,
      treeId,
      authorName,
      authorId,
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

    try {
      await supabase.from('forum_posts').insert({
        id: newId,
        tree_id: treeId || null,
        author_name: newPost.authorName,
        author_id: authorId || null,
        title: newPost.title,
        content: newPost.content,
        category: newPost.category,
        tags: newPost.tags,
        linked_person_id: newPost.linkedPersonId || null,
        is_solved: false,
        upvotes_count: 1,
      });

      if (authorId) {
        await supabase.from('forum_votes').upsert({
          post_id: newId,
          user_id: authorId,
          vote_type: 1,
        });
      }
    } catch (err) {
      console.error('[Vaerline Forum] Failed to persist post to Supabase:', err);
    }

    return newId;
  },

  addComment: async (postId, content, authorName, authorId, parentCommentId) => {
    const commentId = uuidv4();
    const currentUserId = authorId || useAuthStore.getState().user?.id || undefined;
    const currentUserName = authorName || useAuthStore.getState().user?.fullName || 'Family Member';

    const newComment: ForumComment = {
      id: commentId,
      postId,
      authorName: currentUserName,
      authorId: currentUserId,
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

    try {
      await supabase.from('forum_comments').insert({
        id: commentId,
        post_id: postId,
        author_name: newComment.authorName,
        author_id: currentUserId || null,
        content: newComment.content,
        parent_comment_id: parentCommentId || null,
      });
    } catch (err) {
      console.error('[Vaerline Forum] Failed to persist comment to Supabase:', err);
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

    set(s => ({
      posts: s.posts.map(p =>
        p.id === postId ? { ...p, hasUpvoted: willUpvote, upvotesCount: newCount } : p
      ),
    }));

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

    try {
      await supabase
        .from('forum_posts')
        .update({ is_solved: newSolved })
        .eq('id', postId);
    } catch (err) {
      console.warn('[Vaerline Forum] Toggle solved notice:', err);
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
