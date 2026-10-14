import { Router } from 'express';
import { searchByMeaning } from '../services/semanticSearchService.js';

const router = Router();

// Explore rooms and search by meaning
router.get('/', (req, res) => {
  const { q } = req.query;
  const searchResults = searchByMeaning(q);
  res.json({ success: true, query: q || null, data: searchResults });
});

export default router;
