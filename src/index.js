import express from 'express';
import cors from 'cors';

import communitiesRouter from './routes/communities.js';
import conversationsRouter from './routes/conversations.js';
import talkRouter from './routes/talk.js';
import exploreRouter from './routes/explore.js';
import profileRouter from './routes/profile.js';
import moderationRouter from './routes/moderation.js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`[AURA-API] ${req.method} ${req.url}`);
  next();
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', product: 'AURA Modular Monolith API' });
});

// Modular routes
app.use('/api/communities', communitiesRouter);
app.use('/api/conversations', conversationsRouter);
app.use('/api/talk', talkRouter);
app.use('/api/explore', exploreRouter);
app.use('/api/profile', profileRouter);
app.use('/api/moderation', moderationRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error('[AURA-API-ERROR]', err);
  res.status(500).json({ success: false, message: 'Internal server error' });
});

app.listen(PORT, () => {
  console.log(`AURA API running on port ${PORT}`);
});
