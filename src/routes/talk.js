import { Router } from 'express';
import { store } from '../db/store.js';
import { screenContent } from '../services/aiModerationService.js';

const router = Router();

// Post new conversation with AI safety screening
router.post('/', (req, res) => {
  const { title, body, communitySlug, isAnonymous, topic } = req.body;

  if (!title || !title.trim() || !body || !body.trim()) {
    return res.status(400).json({ success: false, message: "Title and body are required." });
  }

  const community = store.communities.find(c => c.slug === communitySlug);
  if (!community) {
    return res.status(400).json({ success: false, message: "Invalid community room selected." });
  }

  const screening = screenContent(body, title);
  if (!screening.allowed) {
    return res.status(422).json({
      success: false,
      message: screening.reason || "Content flagged by safety screening.",
      supportNotice: screening.supportNotice,
      decision: screening.decision
    });
  }

  const newPost = {
    id: `post-${Date.now()}`,
    communitySlug,
    authorUsername: isAnonymous ? null : store.currentUser.username,
    isAnonymous: Boolean(isAnonymous),
    timeAgo: "Just now",
    title: title.trim(),
    body: body.trim(),
    topic: topic || "Shared Thought",
    reactions: { i_relate: 0, i_hear_you: 0, im_curious: 0 },
    userReacted: { i_relate: false, i_hear_you: false, im_curious: false },
    replies: []
  };

  store.conversations.unshift(newPost);
  store.currentUser.experiencesShared += 1;
  store.currentUser.conversationsJoined += 1;

  res.status(201).json({
    success: true,
    message: "Conversation created successfully",
    data: newPost
  });
});

export default router;
