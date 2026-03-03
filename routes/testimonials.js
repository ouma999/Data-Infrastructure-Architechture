// routes/testimonials.js
// GET /api/testimonials          → all testimonials
// GET /api/testimonials/featured → featured only

const express = require('express');
const router  = express.Router();
const { getDB, sql } = require('../config/database');

router.get('/', async (req, res) => {
  try {
    const result = await getDB().request().query(
      'SELECT id,author_name,author_role,quote,rating,is_featured FROM dbo.testimonials ORDER BY created_at DESC'
    );
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/featured', async (req, res) => {
  try {
    const result = await getDB().request().query(
      'SELECT id,author_name,author_role,quote,rating FROM dbo.testimonials WHERE is_featured=1'
    );
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;