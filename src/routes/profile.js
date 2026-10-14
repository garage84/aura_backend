import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// Current user profile with calm contribution metrics
router.get('/', (req, res) => {
  res.json({ success: true, data: store.currentUser });
});

// Arrival mood check-in update
router.patch('/mood', (req, res) => {
  const { mood } = req.body;
  const allowedMoods = ["Heavy", "Lost", "Okay", "Hopeful", "Energized", null];

  if (!allowedMoods.includes(mood)) {
    return res.status(400).json({ success: false, message: "Invalid mood state" });
  }

  store.currentUser.currentMood = mood;
  res.json({ success: true, data: { currentMood: mood } });
});

export default router;
