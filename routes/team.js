// routes/team.js
// GET /api/team             → all active team members
// GET /api/team/leadership  → leadership team only (for About page)
// GET /api/team/:id         → single team member
// POST /api/team            → add team member (admin only)
// PUT  /api/team/:id        → update team member (admin only)
// DELETE /api/team/:id      → remove team member (admin only)

const express = require('express');
const router  = express.Router();
const { getDB, sql } = require('../config/database');
const { protect }   = require('../middleware/auth');

// GET ALL ACTIVE TEAM MEMBERS
router.get('/', async (req, res) => {
  try {
    const result = await getDB().request().query(`
      SELECT id, full_name, role, bio, photo_url,
             linkedin_url, department, is_leadership, sort_order
      FROM   dbo.team_members
      WHERE  is_active = 1
      ORDER BY sort_order ASC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET LEADERSHIP ONLY
router.get('/leadership', async (req, res) => {
  try {
    const result = await getDB().request().query(`
      SELECT id, full_name, role, bio, photo_url, linkedin_url
      FROM   dbo.team_members
      WHERE  is_active = 1 AND is_leadership = 1
      ORDER BY sort_order ASC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// GET ONE TEAM MEMBER
router.get('/:id', async (req, res) => {
  try {
    const result = await getDB().request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .query('SELECT * FROM dbo.team_members WHERE id = @id AND is_active = 1');
    if (!result.recordset.length)
      return res.status(404).json({ error: 'Team member not found' });
    res.json({ success: true, data: result.recordset[0] });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// ADD TEAM MEMBER (admin only)
router.post('/', protect, async (req, res) => {
  const { full_name, role, bio, photo_url, linkedin_url,
          email, department, is_leadership, sort_order } = req.body;
  if (!full_name || !role)
    return res.status(400).json({ error: 'full_name and role are required' });
  try {
    await getDB().request()
      .input('full_name',    sql.NVarChar, full_name)
      .input('role',         sql.NVarChar, role)
      .input('bio',          sql.NVarChar, bio          || null)
      .input('photo_url',    sql.NVarChar, photo_url    || null)
      .input('linkedin_url', sql.NVarChar, linkedin_url || null)
      .input('email',        sql.NVarChar, email        || null)
      .input('department',   sql.NVarChar, department   || null)
      .input('is_leadership',sql.Bit,      is_leadership ? 1 : 0)
      .input('sort_order',   sql.SmallInt, sort_order   || 0)
      .query(`
        INSERT INTO dbo.team_members
          (id, full_name, role, bio, photo_url, linkedin_url,
           email, department, is_leadership, sort_order)
        VALUES
          (NEWID(), @full_name, @role, @bio, @photo_url, @linkedin_url,
           @email, @department, @is_leadership, @sort_order)
      `);
    res.status(201).json({ success: true, message: 'Team member added' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// UPDATE TEAM MEMBER (admin only)
router.put('/:id', protect, async (req, res) => {
  const { full_name, role, bio, photo_url, linkedin_url,
          department, is_leadership, sort_order } = req.body;
  try {
    await getDB().request()
      .input('id',           sql.UniqueIdentifier, req.params.id)
      .input('full_name',    sql.NVarChar, full_name)
      .input('role',         sql.NVarChar, role)
      .input('bio',          sql.NVarChar, bio          || null)
      .input('photo_url',    sql.NVarChar, photo_url    || null)
      .input('linkedin_url', sql.NVarChar, linkedin_url || null)
      .input('department',   sql.NVarChar, department   || null)
      .input('is_leadership',sql.Bit,      is_leadership ? 1 : 0)
      .input('sort_order',   sql.SmallInt, sort_order   || 0)
      .query(`
        UPDATE dbo.team_members
        SET full_name=@full_name, role=@role, bio=@bio,
            photo_url=@photo_url, linkedin_url=@linkedin_url,
            department=@department, is_leadership=@is_leadership,
            sort_order=@sort_order
        WHERE id = @id
      `);
    res.json({ success: true, message: 'Team member updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// SOFT DELETE — marks as inactive instead of permanently deleting
router.delete('/:id', protect, async (req, res) => {
  try {
    await getDB().request()
      .input('id', sql.UniqueIdentifier, req.params.id)
      .query('UPDATE dbo.team_members SET is_active = 0 WHERE id = @id');
    res.json({ success: true, message: 'Team member removed' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;