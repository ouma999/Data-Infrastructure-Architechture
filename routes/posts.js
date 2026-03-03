// routes/posts.js
// GET /api/posts           → all published posts
// GET /api/posts/featured  → featured posts (for homepage)
// GET /api/posts/:slug     → single post
// POST /api/posts          → create (admin only)
// PUT  /api/posts/:id      → update (admin only)
// DELETE /api/posts/:id    → delete (admin only)

const express = require('express');
const router  = express.Router();
const { getDB, sql } = require('../config/database');
const { protect }   = require('../middleware/auth');

// GET ALL PUBLISHED POSTS
router.get('/', async (req, res) => {
  try {
    const result = await getDB().request().query(`
      SELECT p.id, p.title, p.slug, p.excerpt, p.category,
             p.read_time_mins, p.views, p.published_at,
             p.cover_image_url,
             tm.full_name AS author_name
      FROM   dbo.posts p
      LEFT JOIN dbo.team_members tm ON tm.id = p.author_id
      WHERE  p.is_published = 1
      ORDER BY p.published_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET FEATURED POSTS
router.get('/featured', async (req, res) => {
  try {
    const result = await getDB().request().query(`
      SELECT p.id, p.title, p.slug, p.excerpt, p.category,
             p.read_time_mins, p.cover_image_url, p.published_at,
             tm.full_name AS author_name
      FROM   dbo.posts p
      LEFT JOIN dbo.team_members tm ON tm.id = p.author_id
      WHERE  p.is_published = 1 AND p.is_featured = 1
      ORDER BY p.published_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET ONE POST BY SLUG + increment view count
router.get('/:slug', async (req, res) => {
  try {
    const db = getDB();

    // Increment the view counter every time someone reads this post
    await db.request()
      .input('slug', sql.NVarChar, req.params.slug)
      .query('UPDATE dbo.posts SET views = views + 1 WHERE slug = @slug');

    const result = await db.request()
      .input('slug', sql.NVarChar, req.params.slug)
      .query(`
        SELECT p.*, tm.full_name AS author_name, tm.photo_url AS author_photo
        FROM   dbo.posts p
        LEFT JOIN dbo.team_members tm ON tm.id = p.author_id
        WHERE  p.slug = @slug AND p.is_published = 1
      `);

    if (!result.recordset.length)
      return res.status(404).json({ error: 'Post not found' });
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// CREATE POST (admin only)
router.post('/', protect, async (req, res) => {
  const { title, slug, excerpt, content, category,
          cover_image_url, read_time_mins, author_id, is_featured } = req.body;
  if (!title || !slug)
    return res.status(400).json({ error: 'title and slug are required' });
  try {
    await getDB().request()
      .input('title',           sql.NVarChar,        title)
      .input('slug',            sql.NVarChar,        slug)
      .input('excerpt',         sql.NVarChar,        excerpt         || null)
      .input('content',         sql.NVarChar,        content         || null)
      .input('category',        sql.NVarChar,        category        || null)
      .input('cover_image_url', sql.NVarChar,        cover_image_url || null)
      .input('read_time_mins',  sql.SmallInt,        read_time_mins  || null)
      .input('author_id',       sql.UniqueIdentifier, author_id      || null)
      .input('is_featured',     sql.Bit,             is_featured ? 1 : 0)
      .query(`
        INSERT INTO dbo.posts
          (id, title, slug, excerpt, content, category,
           cover_image_url, read_time_mins, author_id, is_featured, is_published, published_at)
        VALUES
          (NEWID(), @title, @slug, @excerpt, @content, @category,
           @cover_image_url, @read_time_mins, @author_id, @is_featured, 1, GETDATE())
      `);
    res.status(201).json({ success: true, message: 'Post created' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPDATE POST (admin only)
router.put('/:id', protect, async (req, res) => {
  const { title, excerpt, content, category, cover_image_url, is_featured, is_published } = req.body;
  try {
    await getDB().request()
      .input('id',              sql.UniqueIdentifier, req.params.id)
      .input('title',           sql.NVarChar, title)
      .input('excerpt',         sql.NVarChar, excerpt         || null)
      .input('content',         sql.NVarChar, content         || null)
      .input('category',        sql.NVarChar, category        || null)
      .input('cover_image_url', sql.NVarChar, cover_image_url || null)
      .input('is_featured',     sql.Bit,      is_featured  ? 1 : 0)
      .input('is_published',    sql.Bit,      is_published ? 1 : 0)
      .query(`
        UPDATE dbo.posts
        SET title=@title, excerpt=@excerpt, content=@content,
            category=@category, cover_image_url=@cover_image_url,
            is_featured=@is_featured, is_published=@is_published
        WHERE id = @id
      `);
    res.json({ success: true, message: 'Post updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// DELETE POST (admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    await getDB().request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .query('DELETE FROM dbo.posts WHERE id = @id');
    res.json({ success: true, message: 'Post deleted' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;