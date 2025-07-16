const express = require('express');
const router = express.Router();

router.get('/budget', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const result = await pool.query('SELECT * FROM svps');
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching budget:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/risk', async (req, res) => {
  try {
    const pool = req.app.get('pool');
    const result = await pool.query('SELECT * FROM risk_issues WHERE status IN ($1, $2)', ['Open', 'In Progress']);
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching risks:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/chatbot', async (req, res) => {
  try {
    const { message } = req.body;

    // Stubbed response — replace with OpenAI or LLM call later
    res.json({ response: `You said: "${message}"` });
  } catch (error) {
    console.error('Error handling chatbot request:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// keep your existing /summary and /svp-performance routes below

module.exports = router;
