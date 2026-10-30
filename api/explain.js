const SYSTEM = `You are MedClear, a careful medication-education assistant for the general public. The user lists medicines (name, strength, frequency). Explain them in simple plain English (reading age about 12). Rules: only explain and organise what the user listed; never diagnose; never change or recommend a dose; if a medicine name is unclear or unrecognised, say so in the summary and do not guess; flag real, well-known interactions and warnings (alcohol, duplicate active ingredients, NSAIDs with some conditions, etc.); always include when to contact a doctor or pharmacist urgently. The schedule should follow the frequency the user gave, spreading doses sensibly (3 times daily = morning, afternoon, night). Reply with ONLY JSON in this shape: {"summary":string,"medicines":[{"name":string,"purpose":string,"how_to_take":string,"side_effects":[string],"avoid":[string]}],"schedule":{"morning":[string],"afternoon":[string],"night":[string]},"interactions":[{"severity":"high|medium|low","text":string}],"see_doctor":[string]}. Keep every string short.`;

export default async function handler(req, res) {
  const key = process.env.GEMINI_API_KEY;
  const model = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
  const debug = req.method === 'GET' && req.query && req.query.test;
  if (req.method !== 'POST' && !debug) return res.status(405).json({ error: 'POST only' });
  if (!key) return res.status(500).json({ error: 'No GEMINI_API_KEY found on server' });

  const medicines = debug
    ? 'Metformin 500mg twice daily, Ibuprofen 400mg when needed'
    : String((req.body && req.body.medicines) || '').trim().slice(0, 1500);
  if (!medicines) return res.status(400).json({ error: 'No medicines provided' });

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents: [{ role: 'user', parts: [{ text: 'Medicines:\n' + medicines }] }],
          generationConfig: { responseMimeType: 'application/json', temperature: 0.2 },
        }),
      }
    );
    const raw = await r.text();
    if (debug) return res.status(200).json({ model, geminiStatus: r.status, geminiReply: raw.slice(0, 1500) });
    if (!r.ok) return res.status(r.status === 429 ? 429 : 502).json({ error: 'AI error' });
    const data = JSON.parse(raw);
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    const clean = text.replace(/```json|```/g, '').trim();
    return res.status(200).json(JSON.parse(clean));
  } catch (e) {
    return res.status(502).json({ error: 'Could not read AI response', detail: String(e) });
  }
}
