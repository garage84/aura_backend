import { Router } from 'express';
import { store } from '../db/store.js';

const router = Router();

// Retrieve immutable moderation audit logs
router.get('/audit-logs', (req, res) => {
  res.json({
    success: true,
    data: store.auditLogs
  });
});

export default router;
