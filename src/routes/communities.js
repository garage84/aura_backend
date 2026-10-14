import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// List all community rooms
router.get('/', (req, res) => {
  res.json({ success: true, data: store.communities });
});

// Community room details by slug
router.get('/:slug', (req, res) => {
  const { slug } = req.params;
  const community = store.communities.find(c => c.slug === slug);
  if (!community) {
    return res.status(404).json({ success: false, message: "Community room not found" });
  }

  const isJoined = store.currentUser.joinedCommunitySlugs.includes(slug);
  res.json({ success: true, data: { ...community, isJoined } });
});

// Join community room
router.post('/:slug/join', (req, res) => {
  const { slug } = req.params;
  const community = store.communities.find(c => c.slug === slug);
  if (!community) {
    return res.status(404).json({ success: false, message: "Community room not found" });
  }

  if (!store.currentUser.joinedCommunitySlugs.includes(slug)) {
    store.currentUser.joinedCommunitySlugs.push(slug);
  }

  res.json({
    success: true,
    message: `Joined ${community.name}`,
    data: { isJoined: true, joinedCommunitySlugs: store.currentUser.joinedCommunitySlugs }
  });
});

// Leave community room
router.post('/:slug/leave', (req, res) => {
  const { slug } = req.params;
  const community = store.communities.find(c => c.slug === slug);
  if (!community) {
    return res.status(404).json({ success: false, message: "Community room not found" });
  }

  store.currentUser.joinedCommunitySlugs = store.currentUser.joinedCommunitySlugs.filter(s => s !== slug);

  res.json({
    success: true,
    message: `Left ${community.name}`,
    data: { isJoined: false, joinedCommunitySlugs: store.currentUser.joinedCommunitySlugs }
  });
});

export default router;
