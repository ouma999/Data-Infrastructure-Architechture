// routes/leads.js
// POST /api/leads           → save a contact form submission (public)
// GET  /api/leads           → view all leads (admin only)
// PUT  /api/leads/:id/status → update lead status (admin only)

const express = require('express');
const router  = express.Router();
const { getDB, sql } = require('../config/database');
const { protect }   = require('../middleware/auth');

// Save contact form — called when someone submits the form on your website
router.post('/', async (req, res) => {
  const { first_name, last_name, email, company, phone, message, service_id, source } = req.body;
  if (!first_name || !email)
    return res.status(400).json({ error: 'First name and email are required' });

  try {
    await getDB().request()
      .input('first_name', sql.NVarChar, first_name)
      .input('last_name',  sql.NVarChar, last_name  || '')
      .input('email',      sql.NVarChar, email)
      .input('company',    sql.NVarChar, company    || null)
      .input('phone',      sql.NVarChar, phone      || null)
      .input('message',    sql.NVarChar, message    || null)
      .input('service_id', sql.UniqueIdentifier, service_id || null)
      .input('source',     sql.NVarChar, source     || 'contact_form')
      .query(`INSERT INTO dbo.leads(id,first_name,last_name,email,company,phone,message,service_id,source)
              VALUES(NEWID(),@first_name,@last_name,@email,@company,@phone,@message,@service_id,@source)`);
    res.status(201).json({ success: true, message: 'Thank you! We will be in touch within 24 hours.' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// View all leads — admin only
router.get('/', protect, async (req, res) => {
  try {
    const result = await getDB().request().query(`
      SELECT l.id, l.first_name, l.last_name, l.email, l.company,
             l.status, l.source, l.created_at, s.title AS service_interest
      FROM   dbo.leads l
      LEFT JOIN dbo.services s ON s.id = l.service_id
      ORDER BY l.created_at DESC
    `);
    res.json({ success: true, data: result.recordset });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

// Update lead status — admin only
router.put('/:id/status', protect, async (req, res) => {
  const { status } = req.body;
  const validStatuses = ['new','contacted','qualified','proposal','closed_won','closed_lost'];
  if (!validStatuses.includes(status))
    return res.status(400).json({ error: 'Invalid status value' });
  try {
    await getDB().request()
      .input('id',     sql.UniqueIdentifier, req.params.id)
      .input('status', sql.NVarChar, status)
      .query('UPDATE dbo.leads SET status=@status WHERE id=@id');
    res.json({ success: true, message: 'Lead status updated' });
  } catch (err) { res.status(500).json({ error: err.message }); }
});

module.exports = router;