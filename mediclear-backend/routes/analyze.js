
import express from "express";
import { requireAuth } from "../middleware/requireAuth.js";
import { supabase } from "../config/supabaseClient.js";
import { extractTestValues, selfAssessValues, deeperReasoning } from "../services/agentChain.js";

const router = express.Router();

router.post("/", requireAuth, async (req, res) => {
  const { reportText } = req.body;

  if (!reportText || reportText.trim().length === 0) {
    return res.status(400).json({ error: "reportText is required." });
  }

  try {
    // Every agent_logs row needs a report_id to point to, so we create
    // the report record first, before running any AI steps.
    const { data: report, error: reportError } = await supabase
      .from("reports")
      .insert({
        user_id: req.user.id,
        file_type: "text",
        raw_text: reportText,
        status: "processing",
      })
      .select()
      .single();

    if (reportError) throw reportError;

    // STEP 1: Extract
    const extractStart = Date.now();
    const extractedValues = await extractTestValues(reportText);
    const extractDuration = Date.now() - extractStart;

    await supabase.from("agent_logs").insert({
      report_id: report.id,
      step_name: "extract",
      reasoning_output: extractedValues,
      duration_ms: extractDuration,
    });

    // STEP 2: Self-assessment
    const assessStart = Date.now();
    const assessedValues = await selfAssessValues(extractedValues);
    const assessDuration = Date.now() - assessStart;

    await supabase.from("agent_logs").insert({
      report_id: report.id,
      step_name: "self_assess",
      reasoning_output: assessedValues,
      duration_ms: assessDuration,
    });

    // STEP 3: Deeper reasoning — only for values flagged ambiguous in Step 2
    const ambiguousValues = assessedValues.filter((v) => v.is_ambiguous);

    const deeperResults = [];
    for (const ambiguousValue of ambiguousValues) {
      const originalValue = extractedValues.find(
        (v) => v.test_name === ambiguousValue.test_name
      );

      const deepStart = Date.now();
      const result = await deeperReasoning(ambiguousValue, originalValue);
      const deepDuration = Date.now() - deepStart;

      await supabase.from("agent_logs").insert({
        report_id: report.id,
        step_name: "deep_reasoning",
        reasoning_output: result,
        duration_ms: deepDuration,
      });

      deeperResults.push(result);
    }

    res.status(200).json({
      message: "Steps 1-3 (extract, self-assess, deep reasoning) complete.",
      reportId: report.id,
      assessedValues,
      deeperResults,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Analysis failed: " + err.message });
  }
});

export default router;