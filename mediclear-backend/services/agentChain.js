import { aiClient, AI_MODEL } from "../config/aiClient.js";

// STEP 1: EXTRACT
// Reads raw report text and pulls out every test value as structured data.
export async function extractTestValues(reportText) {
  const prompt = `You are a medical lab report parser. Extract every test value from the report text below.

Return ONLY a JSON array, no other text, in this exact format:
[
  { "test_name": "...", "value": "...", "reference_range": "..." }
]

If a reference range isn't stated, use an empty string.

Report text:
"""
${reportText}
"""`;

  const response = await aiClient.chat.completions.create({
    model: AI_MODEL,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0].message.content;
  const cleaned = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error("AI did not return valid JSON for the extract step: " + raw);
  }

  return parsed;
}

// STEP 2: SELF-ASSESSMENT
// For each extracted value, the agent decides for itself whether it's
// clearly normal/abnormal, or ambiguous and needs deeper reasoning (Step 3).
export async function selfAssessValues(extractedValues) {
  const prompt = `You are a medical lab report reviewer. For each test value below,
decide whether it is CLEARLY normal or clearly abnormal, OR whether it is
AMBIGUOUS/BORDERLINE and needs a closer, second look.

Mark a value as AMBIGUOUS (is_ambiguous: true) if ANY of these apply:
- The value is within roughly 10% of either edge of the reference range
  (e.g. range is 4000-11000, and the value is 11500 — that's borderline, not clearly abnormal)
- The reference range itself is vague, missing, or open-ended (e.g. "<200")
  and the value is only slightly beyond that threshold
- The clinical significance genuinely depends on more context than the number alone

Only mark is_ambiguous: false when the value is either solidly within the
normal range, or significantly outside it (not just marginally).

Test values:
${JSON.stringify(extractedValues, null, 2)}

Return ONLY a JSON array, no other text, in this exact format:
[
  {
    "test_name": "...",
    "is_ambiguous": true or false,
    "preliminary_status": "Normal" or "Monitor" or "Consult Doctor Soon" or null,
    "reasoning": "one short sentence explaining the decision"
  }
]

Rules:
- If is_ambiguous is true, set preliminary_status to null.
- If is_ambiguous is false, you must provide a confident preliminary_status.`;

  const response = await aiClient.chat.completions.create({
    model: AI_MODEL,
    messages: [{ role: "user", content: prompt }],
  });

  const raw = response.choices[0].message.content;
  const cleaned = raw.replace(/```json|```/g, "").trim();

  let parsed;
  try {
    parsed = JSON.parse(cleaned);
  } catch (err) {
    throw new Error("AI did not return valid JSON for the self-assess step: " + raw);
  }

  return parsed;
}