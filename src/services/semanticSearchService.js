import { store } from '../db/store.js';

// Concept and semantic mapping search
export function searchByMeaning(query) {
  if (!query || !query.trim()) {
    return {
      communities: store.communities,
      conversations: store.conversations
    };
  }

  const q = query.toLowerCase().trim();

  const semanticConcepts = [
    {
      keywords: ["falling behind", "late", "everyone else", "imposter", "ahead of me", "unproductive", "career"],
      communitySlugs: ["career-anxiety", "college-life"],
      topics: ["Imposter Syndrome", "Career Anxiety", "Exam Pressure"]
    },
    {
      keywords: ["burnout", "tired", "wet cement", "exhausted", "numb", "heavy", "drained"],
      communitySlugs: ["career-anxiety", "mental-wellbeing"],
      topics: ["Burnout", "Low Energy Days", "Overwhelm"]
    },
    {
      keywords: ["lonely", "alone", "new city", "silence", "unpacking", "solitude", "strangers"],
      communitySlugs: ["moving-to-a-new-city", "college-life"],
      topics: ["First Month Loneliness", "Solo Living", "Campus Solitude"]
    },
    {
      keywords: ["books", "reading", "stoic", "philosophy", "marcus aurelius", "meditations"],
      communitySlugs: ["books"],
      topics: ["Philosophy for Everyday Life", "Slow Reading"]
    },
    {
      keywords: ["startup", "founder", "building", "bootstrapping", "hustle", "risk"],
      communitySlugs: ["entrepreneurship"],
      topics: ["Bootstrapping", "Loneliness of Solo Building"]
    }
  ];

  let matchedCommunitySlugs = new Set();
  let matchedTopics = new Set();

  semanticConcepts.forEach(concept => {
    if (concept.keywords.some(k => q.includes(k))) {
      concept.communitySlugs.forEach(s => matchedCommunitySlugs.add(s));
      concept.topics.forEach(t => matchedTopics.add(t));
    }
  });

  const matchedCommunities = store.communities.filter(c => {
    return matchedCommunitySlugs.has(c.slug) ||
           c.name.toLowerCase().includes(q) ||
           c.purpose.toLowerCase().includes(q) ||
           c.topics.some(t => t.toLowerCase().includes(q));
  });

  const matchedConversations = store.conversations.filter(conv => {
    return matchedCommunitySlugs.has(conv.communitySlug) ||
           matchedTopics.has(conv.topic) ||
           conv.title.toLowerCase().includes(q) ||
           conv.body.toLowerCase().includes(q);
  });

  return {
    communities: matchedCommunities.length > 0 ? matchedCommunities : store.communities,
    conversations: matchedConversations
  };
}
