import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type { Person, Relationship, Graph, NewPerson, RelationInput } from '../engine/types';
import { buildGraph } from '../engine/graph';
import { supabase } from '../lib/supabaseClient';
import { buildSearchIndex } from '../lib/fuzzySearch';

interface PeopleStore {
  // Data
  treeId: string | null;
  people: Record<string, Person>;
  relationships: Relationship[];
  graph: Graph;

  // Selection
  selectedPersonId: string | null;

  // Loading states
  loading: boolean;
  error: string | null;

  // Actions
  setTreeId: (treeId: string) => void;
  fetchTree: (treeId: string) => Promise<void>;
  addPerson: (person: NewPerson, relation: RelationInput | null) => Promise<string>;
  addRelationship: (fromPersonId: string, toPersonId: string, type: 'PARENT' | 'CHILD' | 'SPOUSE' | 'SIBLING', isAdopted?: boolean) => Promise<void>;
  updateRelationship: (relationshipId: string, patch: Partial<Relationship>) => Promise<void>;
  removeRelationship: (relationshipId: string) => Promise<void>;
  editPerson: (id: string, patch: Partial<Person>) => Promise<void>;
  deletePerson: (id: string) => Promise<void>;
  selectPerson: (id: string | null) => void;

  // Cloud user initialization & reset
  initializeTree: () => Promise<void>;
  initializeUserTree: (userId: string, userName?: string) => Promise<void>;
  clearTree: () => void;
}

/** Recompute the graph whenever relationships change */
function recomputeGraph(rels: Relationship[]): Graph {
  return buildGraph(rels);
}

export const usePeopleStore = create<PeopleStore>((set, get) => ({
  treeId: null,
  people: {},
  relationships: [],
  graph: buildGraph([]),
  selectedPersonId: null,
  loading: false,
  error: null,

  setTreeId: (treeId) => set({ treeId }),

  fetchTree: async (treeId) => {
    set({ loading: true, error: null });
    try {
      const [{ data: peopleData, error: pErr }, { data: relData, error: rErr }] = await Promise.all([
        supabase.from('people').select('*').eq('tree_id', treeId),
        supabase.from('relationships').select('*').eq('tree_id', treeId),
      ]);

      if (pErr) console.warn('[Vaerline Cloud] fetchTree people notice:', pErr.message);
      if (rErr) console.warn('[Vaerline Cloud] fetchTree rel notice:', rErr.message);

      if (peopleData && peopleData.length > 0) {
        const people: Record<string, Person> = {};
        for (const p of peopleData) {
          people[p.id] = {
            id: p.id,
            treeId: p.tree_id,
            name: p.name,
            gender: p.gender ?? 'unspecified',
            dob: p.dob ?? undefined,
            dod: p.dod ?? undefined,
            phone: p.phone ?? undefined,
            photoUrl: p.photo_url ?? undefined,
            profession: p.profession ?? undefined,
            location: p.location ?? undefined,
            bio: p.bio ?? undefined,
          };
        }

        const relationships: Relationship[] = (relData ?? []).map(r => ({
          id: r.id,
          treeId: r.tree_id,
          type: r.type,
          fromPersonId: r.from_person_id,
          toPersonId: r.to_person_id,
          marriageDate: r.marriage_date ?? undefined,
          isAdopted: r.is_adopted ?? false,
          isDivorced: r.is_divorced ?? false,
        }));

        const graph = recomputeGraph(relationships);
        buildSearchIndex(Object.values(people));

        set({ treeId, people, relationships, graph, loading: false });
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.warn('[Vaerline Cloud] fetchTree notice:', err);
      set({ error: String(err), loading: false });
    }
  },

  addPerson: async (newPerson, relation) => {
    const { treeId, people, relationships } = get();

    // Generate local ID for immediate optimistic update
    const personId = uuidv4();
    const person: Person = {
      id: personId,
      treeId: treeId ?? '',
      ...newPerson,
    };

    const newRelationships: Relationship[] = [];
    // Track edge keys to deduplicate
    const edgeSet = new Set<string>(
      relationships.map(r => `${r.type}:${r.fromPersonId}:${r.toPersonId}`)
    );

    const addEdge = (type: Relationship['type'], from: string, to: string, extra: Partial<Relationship> = {}) => {
      const key = `${type}:${from}:${to}`;
      const reverseKey = `${type}:${to}:${from}`;
      // For SPOUSE_OF, treat bidirectional as same
      if (edgeSet.has(key) || (type === 'SPOUSE_OF' && edgeSet.has(reverseKey))) return;
      edgeSet.add(key);
      newRelationships.push({
        id: uuidv4(),
        treeId: treeId ?? '',
        type,
        fromPersonId: from,
        toPersonId: to,
        ...extra,
      });
    };

    if (relation) {
      const { anchorPersonId, type, isAdopted } = relation;
      const graph = get().graph;

      if (type === 'SPOUSE') {
        addEdge('SPOUSE_OF', personId, anchorPersonId);
      } else if (type === 'PARENT') {
        // new person is parent of anchor
        addEdge('PARENT_OF', personId, anchorPersonId, { isAdopted });

        // If anchor already has an existing parent, link new parent as spouse of existing parent
        const existingParents = graph.parentsOf.get(anchorPersonId) ?? [];
        for (const existingParentId of existingParents) {
          if (existingParentId !== personId) {
            addEdge('SPOUSE_OF', personId, existingParentId);
          }
        }
      } else if (type === 'CHILD') {
        // new person is child of anchor
        addEdge('PARENT_OF', anchorPersonId, personId, { isAdopted });

        // Auto-link new child to anchor's spouse if present
        const spouses = graph.spousesOf.get(anchorPersonId) ?? [];
        for (const spouseId of spouses) {
          if (spouseId !== personId) {
            addEdge('PARENT_OF', spouseId, personId, { isAdopted });
          }
        }
      } else if (type === 'SIBLING') {
        // Find anchor's parents and link new person as child of each
        const anchorParents = graph.parentsOf.get(anchorPersonId) ?? [];
        for (const parentId of anchorParents) {
          addEdge('PARENT_OF', parentId, personId);
        }
      }
    }

    // Optimistic update
    const updatedPeople = { ...people, [personId]: person };
    const updatedRelationships = [...relationships, ...newRelationships];
    const graph = recomputeGraph(updatedRelationships);
    buildSearchIndex(Object.values(updatedPeople));
    set({ people: updatedPeople, relationships: updatedRelationships, graph });

    // Persist to Supabase if connected
    if (treeId) {
      try {
        await supabase.from('people').insert({
          id: personId,
          tree_id: treeId,
          name: person.name,
          gender: person.gender,
          dob: person.dob ?? null,
          dod: person.dod ?? null,
          phone: person.phone ?? null,
          photo_url: person.photoUrl ?? null,
          profession: person.profession ?? null,
          location: person.location ?? null,
          bio: person.bio ?? null,
        });

        if (newRelationships.length > 0) {
          await supabase.from('relationships').insert(
            newRelationships.map(r => ({
              id: r.id,
              tree_id: r.treeId,
              type: r.type,
              from_person_id: r.fromPersonId,
              to_person_id: r.toPersonId,
              is_adopted: r.isAdopted ?? false,
              is_divorced: r.isDivorced ?? false,
            }))
          );
        }
      } catch (err) {
        console.error('Failed to persist to Supabase:', err);
      }
    }

    return personId;
  },

  addRelationship: async (fromPersonId, toPersonId, type, isAdopted) => {
    const { treeId, relationships } = get();

    const newRelationships: Relationship[] = [];
    const edgeSet = new Set<string>(
      relationships.map(r => `${r.type}:${r.fromPersonId}:${r.toPersonId}`)
    );

    const addEdge = (relType: Relationship['type'], from: string, to: string, extra: Partial<Relationship> = {}) => {
      const key = `${relType}:${from}:${to}`;
      const reverseKey = `${relType}:${to}:${from}`;
      if (edgeSet.has(key) || (relType === 'SPOUSE_OF' && edgeSet.has(reverseKey))) return;
      edgeSet.add(key);
      newRelationships.push({
        id: uuidv4(),
        treeId: treeId ?? '',
        type: relType,
        fromPersonId: from,
        toPersonId: to,
        ...extra,
      });
    };

    const graph = get().graph;

    if (type === 'SPOUSE') {
      addEdge('SPOUSE_OF', fromPersonId, toPersonId);
    } else if (type === 'PARENT') {
      // fromPerson is parent of toPerson
      addEdge('PARENT_OF', fromPersonId, toPersonId, { isAdopted });
      const existingParents = graph.parentsOf.get(toPersonId) ?? [];
      for (const pId of existingParents) {
        if (pId !== fromPersonId) {
          addEdge('SPOUSE_OF', fromPersonId, pId);
        }
      }
    } else if (type === 'CHILD') {
      // fromPerson is child of toPerson
      addEdge('PARENT_OF', toPersonId, fromPersonId, { isAdopted });
      const spouses = graph.spousesOf.get(toPersonId) ?? [];
      for (const sId of spouses) {
        if (sId !== fromPersonId) {
          addEdge('PARENT_OF', sId, fromPersonId, { isAdopted });
        }
      }
    } else if (type === 'SIBLING') {
      const parents = graph.parentsOf.get(toPersonId) ?? [];
      for (const pId of parents) {
        addEdge('PARENT_OF', pId, fromPersonId);
      }
    }

    const updatedRels = [...relationships, ...newRelationships];
    const newGraph = recomputeGraph(updatedRels);
    set({ relationships: updatedRels, graph: newGraph });

    if (treeId && newRelationships.length > 0) {
      try {
        await supabase.from('relationships').insert(
          newRelationships.map(r => ({
            id: r.id,
            tree_id: r.treeId,
            type: r.type,
            from_person_id: r.fromPersonId,
            to_person_id: r.toPersonId,
            is_adopted: r.isAdopted ?? false,
            is_divorced: r.isDivorced ?? false,
          }))
        );
      } catch (err) {
        console.error('Failed to save relationship to Supabase:', err);
      }
    }
  },

  updateRelationship: async (relationshipId, patch) => {
    const { treeId, relationships } = get();
    const updatedRels = relationships.map(r => {
      if (r.id === relationshipId) {
        return { ...r, ...patch };
      }
      return r;
    });
    const graph = recomputeGraph(updatedRels);
    set({ relationships: updatedRels, graph });

    if (treeId) {
      await supabase.from('relationships').update(patch).eq('id', relationshipId);
    }
  },

  removeRelationship: async (relationshipId) => {
    const { treeId, relationships } = get();
    const updatedRels = relationships.filter(r => r.id !== relationshipId);
    const graph = recomputeGraph(updatedRels);
    set({ relationships: updatedRels, graph });

    if (treeId) {
      await supabase.from('relationships').delete().eq('id', relationshipId);
    }
  },

  editPerson: async (id, patch) => {
    const { treeId, people, relationships } = get();
    const existing = people[id];
    if (!existing) return;

    // Merge patch on top of existing to avoid overwriting undefined fields
    const updated: Person = {
      ...existing,
      ...Object.fromEntries(
        Object.entries(patch).filter(([, v]) => v !== undefined)
      ),
    };
    const updatedPeople = { ...people, [id]: updated };
    buildSearchIndex(Object.values(updatedPeople));

    // Only recompute graph if structural data changed (relationships are unchanged here,
    // so skip the redundant buildGraph call for name/bio/photo edits)
    set({ people: updatedPeople });

    if (treeId) {
      try {
        const { error } = await supabase.from('people').update({
          name: updated.name,
          gender: updated.gender,
          dob: updated.dob ?? null,
          dod: updated.dod ?? null,
          phone: updated.phone ?? null,
          photo_url: updated.photoUrl ?? null,
          profession: updated.profession ?? null,
          location: updated.location ?? null,
          bio: updated.bio ?? null,
        }).eq('id', id);

        if (error) {
          console.error('[Vaerline Cloud] Error updating person in Supabase:', error.message);
        } else {
          console.log('[Vaerline Cloud] Person updated in Supabase:', id, updated.name);
        }
      } catch (err) {
        console.error('[Vaerline Cloud] Exception updating person in Supabase:', err);
      }
    }

    // Only recompute graph if relationships exist (structural integrity)
    if (relationships.length > 0) {
      const graph = recomputeGraph(relationships);
      set({ graph });
    }
  },

  deletePerson: async (id) => {
    const { treeId, people, relationships } = get();
    const updatedPeople = { ...people };
    delete updatedPeople[id];
    const updatedRels = relationships.filter(
      r => r.fromPersonId !== id && r.toPersonId !== id
    );
    const graph = recomputeGraph(updatedRels);
    buildSearchIndex(Object.values(updatedPeople));
    // Clear selectedPersonId if the deleted person was selected
    set({
      people: updatedPeople,
      relationships: updatedRels,
      graph,
      selectedPersonId: null,
    });

    if (treeId) {
      try {
        const { error } = await supabase.from('people').delete().eq('id', id);
        if (error) console.error('[Vaerline Cloud] Error deleting person from Supabase:', error.message);
      } catch (err) {
        console.error('[Vaerline Cloud] Exception deleting person from Supabase:', err);
      }
    }
  },

  selectPerson: (id) => set({ selectedPersonId: id }),

  clearTree: () => {
    set({
      treeId: null,
      people: {},
      relationships: [],
      graph: buildGraph([]),
      selectedPersonId: null,
      loading: false,
      error: null,
    });
  },

  initializeUserTree: async (userId: string, userName?: string) => {
    try {
      // Guard against double-initialization (e.g. multiple onAuthStateChange fires)
      const currentTreeId = get().treeId;
      if (currentTreeId) {
        console.log('[Vaerline Cloud] Tree already initialized:', currentTreeId);
        return;
      }

      set({ loading: true, error: null });

      // 1. Check if this user is a MEMBER of someone else's tree via tree_members
      const { data: memberRows } = await supabase
        .from('tree_members')
        .select('tree_id, role')
        .eq('user_id', userId)
        .limit(1);

      if (memberRows && memberRows.length > 0) {
        // This user was invited — load the shared tree
        const sharedTreeId = memberRows[0].tree_id;
        console.log('[Vaerline Cloud] Member user found — loading shared tree:', sharedTreeId);
        await get().fetchTree(sharedTreeId);
        return;
      }

      // 2. Look for a tree owned by this specific user in Supabase
      const { data: userTrees, error: treeErr } = await supabase
        .from('trees')
        .select('*')
        .eq('owner_id', userId)
        .order('created_at', { ascending: true })
        .limit(1);

      if (treeErr) {
        console.warn('[Vaerline Cloud] Query user trees notice:', treeErr.message);
      }

      if (userTrees && userTrees.length > 0) {
        // Existing tree found for this user
        const activeTreeId = userTrees[0].id;
        await get().fetchTree(activeTreeId);
      } else {
        // Brand new user: Create a private tree and root person in Supabase
        const activeTreeId = uuidv4();
        const rootPersonId = uuidv4();
        const displayName = userName && userName.trim() !== '' ? userName : 'Family Creator';

        const { error: insertTreeErr } = await supabase.from('trees').insert({
          id: activeTreeId,
          name: `${displayName}'s Family Lineage`,
          owner_id: userId,
        });

        if (insertTreeErr) {
          console.warn('[Vaerline Cloud] Error creating user tree:', insertTreeErr.message);
        }

        const rootPerson: Person = {
          id: rootPersonId,
          treeId: activeTreeId,
          name: displayName,
          gender: 'unspecified',
          bio: 'Root member of this family lineage.',
        };

        const { error: insertPersonErr } = await supabase.from('people').insert({
          id: rootPersonId,
          tree_id: activeTreeId,
          name: rootPerson.name,
          gender: rootPerson.gender,
          bio: rootPerson.bio,
        });

        if (insertPersonErr) {
          console.warn('[Vaerline Cloud] Error creating root person:', insertPersonErr.message);
        }

        const people: Record<string, Person> = { [rootPersonId]: rootPerson };
        const relationships: Relationship[] = [];
        const graph = buildGraph(relationships);
        buildSearchIndex([rootPerson]);

        set({
          treeId: activeTreeId,
          people,
          relationships,
          graph,
          selectedPersonId: rootPersonId,
          loading: false,
        });
      }
    } catch (err) {
      console.error('[Vaerline Cloud] Error in initializeUserTree:', err);
      set({ error: String(err), loading: false });
    }
  },

  initializeTree: async () => {
    try {
      set({ loading: true, error: null });

      const { data: trees, error: treeErr } = await supabase
        .from('trees')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(1);

      if (treeErr) {
        console.warn('[Vaerline Cloud] Query trees notice:', treeErr.message);
        set({ loading: false });
        return;
      }

      if (trees && trees.length > 0) {
        await get().fetchTree(trees[0].id);
      } else {
        set({ loading: false });
      }
    } catch (err) {
      console.error('[Vaerline Cloud] Error initializing tree:', err);
      set({ loading: false });
    }
  },
}));
