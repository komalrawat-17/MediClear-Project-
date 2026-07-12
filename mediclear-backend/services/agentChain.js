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

// STEP 3: DEEPER REASONING
// Only runs on values Step 2 flagged as ambiguous. Cross-references how far
// the value deviates from its reference range, and how clinically significant
// that specific test type typically is, before finalizing a judgment.
export async function deeperReasoning(ambiguousValue, originalValue) {
  const prompt = `You are a senior medical reviewer doing a closer, second look
at one specific lab test value that was flagged as borderline/ambiguous.

Test details:
- Test name: ${originalValue.test_name}
- Value: ${originalValue.value}
- Reference range: ${originalValue.reference_range}
- Initial reasoning from first-pass review: ${ambiguousValue.reasoning}

Do a deeper analysis considering:
1. How far, proportionally, does this value deviate from the reference range edge?
2. How clinically significant is this specific test type generally? (e.g. a
   mildly elevated WBC count is often less urgent than a mildly abnormal
   creatinine, since creatinine relates to kidney function)
3. Based on both of these, what is the appropriate urgency level?

Return ONLY a JSON object, no other text, in this exact format:
{
  "test_name": "...",
  "deviation_analysis": "one sentence on how far/significant the deviation is",
  "clinical_context": "one sentence on why this test type matters (or doesn't) at this level",
  "final_status": "Normal" or "Monitor" or "Consult Doctor Soon"
}`;

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
    throw new Error("AI did not return valid JSON for the deeper reasoning step: " + raw);
  }

  return parsed;
}