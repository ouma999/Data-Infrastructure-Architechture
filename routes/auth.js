// routes/auth.js — Handles admin login
// POST /api/auth/login  → returns a JWT token if credentials are correct

const express  = require('express');
const router   = express.Router();
const bcrypt   = require('bcryptjs');
const jwt      = require('jsonwebtoken');
const { getDB, sql } = require('../config/database');

router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: 'Email and password are required' });

  try {
    const db     = getDB();
    const result = await db.request()
      .input('email', sql.NVarChar, email)
      .query('SELECT * FROM dbo.team_members WHERE email = @email AND is_active = 1');

    if (result.recordset.length === 0)
      return res.status(401).json({ error: 'Invalid email or password' });

    const user          = result.recordset[0];
    const passwordMatch = await bcrypt.compare(password, user.password_hash);
    if (!passwordMatch)
      return res.status(401).json({ error: 'Invalid email or password' });

    // Create a token that expires in 8 hours
    const token = jwt.sign(
      { id: user.id, name: user.full_name, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ success: true, token, user: { name: user.full_name, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;