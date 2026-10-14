import { Router } from 'express';
import { store } from '../db/store.js';
import { screenContent } from '../services/aiModerationService.js';

const router = Router();

// Feed of conversations with optional filtering
router.get('/', (req, res) => {
  const { quiet, community } = req.query;
  let result = [...store.conversations];

  if (community) {
    result = result.filter(c => c.communitySlug === community);
  } else if (quiet === 'true') {
    result = result.filter(c => store.currentUser.joinedCommunitySlugs.includes(c.communitySlug));
  }

  res.json({
    success: true,
    count: result.length,
    data: result
  });
});

// Single conversation by ID
router.get('/:id', (req, res) => {
  const { id } = req.params;
  const conv = store.conversations.find(c => c.id === id);
  if (!conv) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }

  res.json({
    success: true,
    data: conv
  });
});

// Toggle empathy reactions (i_relate, i_hear_you, im_curious)
router.post('/:id/reactions', (req, res) => {
  const { id } = req.params;
  const { reactionType } = req.body;

  const validReactions = ['i_relate', 'i_hear_you', 'im_curious'];
  if (!validReactions.includes(reactionType)) {
    return res.status(400).json({ success: false, message: "Invalid reaction type" });
  }

  const conv = store.conversations.find(c => c.id === id);
  if (!conv) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }

  const isReacted = conv.userReacted[reactionType];
  if (isReacted) {
    conv.userReacted[reactionType] = false;
    conv.reactions[reactionType] = Math.max(0, conv.reactions[reactionType] - 1);
  } else {
    conv.userReacted[reactionType] = true;
    conv.reactions[reactionType] += 1;
  }

  res.json({
    success: true,
    data: {
      reactions: conv.reactions,
      userReacted: conv.userReacted
    }
  });
});

// Post shallow chronological reply with safety check
router.post('/:id/replies', (req, res) => {
  const { id } = req.params;
  const { body } = req.body;

  if (!body || !body.trim()) {
    return res.status(400).json({ success: false, message: "Reply body cannot be empty" });
  }

  const conv = store.conversations.find(c => c.id === id);
  if (!conv) {
    return res.status(404).json({ success: false, message: "Conversation not found" });
  }

  const screening = screenContent(body);
  if (!screening.allowed) {
    return res.status(422).json({
      success: false,
      message: screening.reason || "Content held for moderator review.",
      supportNotice: screening.supportNotice
    });
  }

  const newReply = {
    id: `rep-${Date.now()}`,
    authorUsername: store.currentUser.username,
    timeAgo: "Just now",
    body: body.trim()
  };

  conv.replies.push(newReply);
  store.currentUser.conversationsJoined += 1;

  res.status(201).json({
    success: true,
    message: "Reply posted calmly",
    data: newReply
  });
});

export default router;
