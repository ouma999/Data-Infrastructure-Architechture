// routes/services.js
// GET  /api/services           → all services
// GET  /api/services/featured  → featured only
// GET  /api/services/:slug     → single service
// POST /api/services           → create (admin)
// PUT  /api/services/:id       → update (admin)
// DELETE /api/services/:id     → delete (admin)

const express = require('express');
const router  = express.Router();
const { getDB, sql } = require('../config/database');
const { protect }   = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const result = await getDB().request().query(
      'SELECT id,title,slug,short_desc,icon_name,category,is_featured,sort_order FROM dbo.services ORDER BY sort_order'
    );
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/featured', async (req, res) => {
  try {
    const result = await getDB().request().query(
      'SELECT id,title,slug,short_desc,icon_name,category FROM dbo.services WHERE is_featured=1 ORDER BY sort_order'
    );
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.get('/:slug', async (req, res) => {
  try {
    const result = await getDB().request()
      .input('slug', sql.NVarChar, req.params.slug)
      .query('SELECT * FROM dbo.services WHERE slug=@slug');
    if (!result.recordset.length) return res.status(404).json({ error: 'Service not found' });
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.post('/', protect, async (req, res) => {
  const { title, slug, short_desc, full_desc, icon_name, category, is_featured, sort_order } = req.body;
  if (!title || !slug) return res.status(400).json({ error: 'title and slug required' });
  try {
    await getDB().request()
      .input('title',       sql.NVarChar, title)
      .input('slug',        sql.NVarChar, slug)
      .input('short_desc',  sql.NVarChar, short_desc  || null)
      .input('full_desc',   sql.NVarChar, full_desc   || null)
      .input('icon_name',   sql.NVarChar, icon_name   || null)
      .input('category',    sql.NVarChar, category    || null)
      .input('is_featured', sql.Bit,      is_featured ? 1 : 0)
      .input('sort_order',  sql.SmallInt, sort_order  || 0)
      .query('INSERT INTO dbo.services(id,title,slug,short_desc,full_desc,icon_name,category,is_featured,sort_order) VALUES(NEWID(),@title,@slug,@short_desc,@full_desc,@icon_name,@category,@is_featured,@sort_order)');
    res.status(201).json({ success: true, message: 'Service created' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

router.delete('/:id', protect, async (req, res) => {
  try {
    await getDB().request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .query('DELETE FROM dbo.services WHERE id=@id');
    res.json({ success: true, message: 'Service deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;