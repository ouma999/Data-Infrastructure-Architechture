// routes/caseStudies.js
// GET /api/case-studies           → all case studies
// GET /api/case-studies/featured  → featured only (for homepage)
// GET /api/case-studies/:slug     → single case study
// POST /api/case-studies          → create (admin only)
// DELETE /api/case-studies/:id    → delete (admin only)

const express = require('express');
const router  = express.Router();
const { getDB, sql } = require('../config/database');
const { protect }   = require('../middleware/auth');

// GET ALL
router.get('/', async (req, res) => {
  try {
    const result = await getDB().request().query(`
      SELECT cs.id, cs.title, cs.slug, cs.industry, cs.country,
             cs.key_metric, cs.banner_emoji, cs.is_featured, cs.published_at,
             c.name  AS client_name,
             s.title AS service_title
      FROM   dbo.case_studies cs
      LEFT JOIN dbo.clients  c ON c.id = cs.client_id
      LEFT JOIN dbo.services s ON s.id = cs.service_id
      ORDER BY cs.published_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET FEATURED ONLY
router.get('/featured', async (req, res) => {
  try {
    const result = await getDB().request().query(`
      SELECT cs.id, cs.title, cs.slug, cs.industry,
             cs.key_metric, cs.banner_emoji, cs.published_at,
             c.name  AS client_name,
             s.title AS service_title
      FROM   dbo.case_studies cs
      LEFT JOIN dbo.clients  c ON c.id = cs.client_id
      LEFT JOIN dbo.services s ON s.id = cs.service_id
      WHERE  cs.is_featured = 1
      ORDER BY cs.published_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET ONE BY SLUG
router.get('/:slug', async (req, res) => {
  try {
    const result = await getDB().request()
      .input('slug', sql.NVarChar, req.params.slug)
      .query(`
        SELECT cs.*, c.name AS client_name, s.title AS service_title
        FROM   dbo.case_studies cs
        LEFT JOIN dbo.clients  c ON c.id = cs.client_id
        LEFT JOIN dbo.services s ON s.id = cs.service_id
        WHERE  cs.slug = @slug
      `);
    if (!result.recordset.length)
      return res.status(404).json({ error: 'Case study not found' });
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE (admin only)
router.post('/', protect, async (req, res) => {
  const { title, slug, industry, country, challenge, solution,
          results, key_metric, banner_emoji, client_id, service_id, is_featured } = req.body;
  if (!title || !slug)
    return res.status(400).json({ error: 'title and slug are required' });
  try {
    await getDB().request()
      .input('title',        sql.NVarChar,        title)
      .input('slug',         sql.NVarChar,        slug)
      .input('industry',     sql.NVarChar,        industry     || null)
      .input('country',      sql.NVarChar,        country      || null)
      .input('challenge',    sql.NVarChar,        challenge    || null)
      .input('solution',     sql.NVarChar,        solution     || null)
      .input('results',      sql.NVarChar,        results      || null)
      .input('key_metric',   sql.NVarChar,        key_metric   || null)
      .input('banner_emoji', sql.NVarChar,        banner_emoji || null)
      .input('client_id',    sql.UniqueIdentifier, client_id   || null)
      .input('service_id',   sql.UniqueIdentifier, service_id  || null)
      .input('is_featured',  sql.Bit,             is_featured ? 1 : 0)
      .query(`
        INSERT INTO dbo.case_studies
          (id, title, slug, industry, country, challenge, solution,
           results, key_metric, banner_emoji, client_id, service_id, is_featured, published_at)
        VALUES
          (NEWID(), @title, @slug, @industry, @country, @challenge, @solution,
           @results, @key_metric, @banner_emoji, @client_id, @service_id, @is_featured, GETDATE())
      `);
    res.status(201).json({ success: true, message: 'Case study created' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    await getDB().request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .query('DELETE FROM dbo.case_studies WHERE id = @id');
    res.json({ success: true, message: 'Case study deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;