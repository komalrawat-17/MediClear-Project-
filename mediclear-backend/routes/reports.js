import express from 'express';
import { supabase } from '../config/supabaseClient.js';

const router = express.Router();

// GET /api/reports/history - Returns list of all previous reports uploaded by this user
router.get('/history', async (req, res) => {
  try {
    const userId = req.user.id;

    const { data, error } = await supabase
      .from('reports')
      .select('id, uploaded_at, file_type')
      .eq('user_id', userId)
      .order('uploaded_at', { ascending: false });

    if (error) throw error;
    return res.status(200).json({ success: true, reports: data });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// GET /api/reports/trends - Compiles values for specific tests across time for graphing
router.get('/trends', async (req, res) => {
  try {
    const userId = req.user.id;

    // Fetch all test values linked to reports belonging to this user
    const { data, error } = await supabase
      .from('test_values')
      .select(`
        test_name,
        value,
        reports!inner(uploaded_at, user_id)
      `)
      .eq('reports.user_id', userId);

    if (error) throw error;

    // Group the results by test name so the frontend can easily plot individual charts
    const trends = data.reduce((acc, current) => {
      const name = current.test_name.toLowerCase().trim();
      if (!acc[name]) acc[name] = [];
      
      acc[name].push({
        date: current.reports.uploaded_at,
        value: parseFloat(current.value) || current.value // Parse to number if possible for line charts
      });
      return acc;
    }, {});

    return res.status(200).json({ success: true, trends });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;