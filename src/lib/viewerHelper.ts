import type { Person } from '../engine/types';
import type { UserProfile } from '../stores/authStore';

/**
 * Centrally computes the viewer (active person node) in the family tree
 * based on the logged-in user profile.
 */
export function getViewerPersonId(
  people: Record<string, Person> | Person[],
  user: UserProfile | null
): string | null {
  const peopleList = Array.isArray(people) ? people : Object.values(people);
  if (peopleList.length === 0) return null;

  const isDemoUser = !user || user.email === 'aditya.sharma@vaerline.family';

  // 1. If a real user is authenticated (e.g. Dharun)
  if (user && !isDemoUser) {
    const cleanUserName = user.fullName.trim().toLowerCase();
    const userFirstName = cleanUserName.split(' ')[0];

    // Exact full name match (e.g. "Dharun SA" === "Dharun SA")
    const exactMatch = peopleList.find(p => p.name.trim().toLowerCase() === cleanUserName);
    if (exactMatch) return exactMatch.id;

    // Partial / prefix match (e.g. "Dharun" in "Dharun SA" or "Dharun Kumar")
    const partialMatch = peopleList.find(p => {
      const pClean = p.name.trim().toLowerCase();
      const pFirstName = pClean.split(' ')[0];
      return pClean.includes(cleanUserName) || cleanUserName.includes(pClean) || pFirstName === userFirstName;
    });
    if (partialMatch) return partialMatch.id;

    // Match by Supabase User ID or creator
    const matchById = peopleList.find(p => p.id === user.id || p.createdBy === user.id);
    if (matchById) return matchById.id;

    // If logged in as Dharun and not in tree, return null so it doesn't mistakenly identify as Aditya
    return null;
  }

  // 2. Unauthenticated / Guest fallback (prioritize Dharun SA)
  const dharun = peopleList.find(p => p.name.toLowerCase().includes('dharun'));
  if (dharun) return dharun.id;

  const bioSelf = peopleList.find(p =>
    p.bio?.toLowerCase().includes("that's me") ||
    p.bio?.toLowerCase().includes("thats me") ||
    p.bio?.toLowerCase().includes("this is me")
  );
  if (bioSelf) return bioSelf.id;

  return peopleList[0]?.id || null;
}
