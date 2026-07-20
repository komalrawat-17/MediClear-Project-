import express from 'express';
import multer from 'multer';
import { extractTextFromFile } from '../services/extractText.js';
import { runAgenticChain } from '../services/agentChain.js';
import { supabase } from '../config/supabaseClient.js'; 
import { requireAuth } from '../middleware/requireAuth.js'; 

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

// Protect the route with requireAuth so req.user.id is fully populated from the JWT token
router.post('/', requireAuth, upload.single('report'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const userId = req.user?.id; 
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized. Please sign in again.' });
    }

    // 1. Live Text Extraction Step (PDF or OCR)
    const { text, fileType } = await extractTextFromFile(req.file);

    // 2. Save report details to Supabase database
    const { data: reportData, error: reportError } = await supabase
      .from('reports')
      .insert([{ user_id: userId, file_type: fileType, raw_text: text }])
      .select()
      .single();

    if (reportError) throw reportError;
    const reportId = reportData.id;

    // 3. Run the live multi-step AI reasoning workflow
    const agentResult = await runAgenticChain(text);
    
    // 4. Record intermediate execution agent steps to logs
    if (agentResult.logs && agentResult.logs.length > 0) {
      const formattedLogs = agentResult.logs.map(log => ({
        report_id: reportId,
        step_name: log.step_name,
        reasoning_output: log.reasoning_output
      }));
      
      await supabase.from('agent_logs').insert(formattedLogs);
    }

    // 5. Store final verified patient test values
    let finalResults = agentResult?.extractedValues || [];

    if (finalResults.length > 0) {
      const formattedValues = finalResults.map(val => ({
        report_id: reportId,
        test_name: val.test_name,
        value: val.value,
        reference_range: val.reference_range,
        status: val.status, 
        explanation: val.explanation
      }));

      const { error: valuesError } = await supabase.from('test_values').insert(formattedValues);
      if (valuesError) throw valuesError;
    }

    // 6. Return seamless live response payload to frontend
    return res.status(200).json({
      success: true,
      reportId: reportId,
      results: finalResults
    });

  } catch (error) {
    console.error('Pipeline Processing Error:', error);
    return res.status(500).json({ error: 'Failed to process lab report securely.' });
  }
});

export default router;