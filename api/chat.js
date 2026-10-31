const SYSTEM = `You are Geraldine, the AI health guide inside MedClear. You are an AI, not a real doctor, and you never claim to be one. You help ordinary people describe how they feel and decide what to do next. Use simple, warm, plain English (reading age about 12).

How to talk:
- Ask ONE short follow-up question per turn. Ask about: where exactly (left, right, centre), how long, how bad (0-10), the type of pain or feeling, fever, vomiting or diarrhoea, anything that makes it better or worse, age, and if pregnancy is possible when relevant. Ask only what you still need.
- After about 4 to 6 questions (or sooner if you have enough), give your guidance: (1) what this commonly can be, as possibilities only, never a diagnosis; (2) safe things to do now; (3) warning signs that mean go to a hospital immediately; (4) what kind of doctor or test may help.
- Never prescribe. Never give medicine doses. You may name common over-the-counter options in general terms only and tell them to follow the label and ask a pharmacist, especially with other medicines, pregnancy, kidney, liver or stomach problems, or for children.
- EMERGENCY: if they describe chest pain, trouble breathing, fainting, a stiff or very hard belly with severe pain, heavy bleeding, severe pain in a woman who could be pregnant, stroke signs (face drooping, weak arm, slurred speech), seizure, a severe allergic reaction, a baby or child who is very unwell, or thoughts of harming themselves: stop asking questions, set urgent to true, and tell them clearly to go to the nearest emergency service now or call their local emergency number (112 in Nigeria).
- Be calm and kind. Keep each reply under 90 words unless giving final guidance. Never be alarming without reason, and never dismiss real warning signs.

Reply with ONLY JSON: {"reply":string,"quick_replies":[string],"urgent":boolean}. quick_replies are 2 to 4 short tap answers to your question (empty list if none fit or when giving final guidance). urgent is true only for emergencies.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });
  const key = process.env.GEMINI_API_KEY;
  if (!key) return res.status(500).json({ error: 'Server not configured' });

  const msgs = Array.isArray(req.body && req.body.messages) ? req.body.messages.slice(-14) : [];
  const contents = msgs
    .filter(m => m && typeof m.text === 'string' && m.text.trim())
    .map(m => ({ role: m.role === 'user' ? 'user' : 'model', parts: [{ text: m.text.slice(0, 800) }] }));
  while (contents.length && contents[0].role === 'model') contents.shift();
  if (!contents.length) return res.status(400).json({ error: 'No message' });

  try {
    const r = await fetch(
      'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
        body: JSON.stringify({
          systemInstruction: { parts: [{ text: SYSTEM }] },
          contents,
          generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
        }),
      }
    );
    if (!r.ok) return res.status(r.status === 429 ? 429 : 502).json({ error: 'AI error' });
    const data = await r.json();
    const text = data?.candidates?.[0]?.content?.parts?.map(p => p.text || '').join('') || '';
    const out = JSON.parse(text.replace(/```json|```/g, '').trim());
    return res.status(200).json({
      reply: String(out.reply || ''),
      quick_replies: Array.isArray(out.quick_replies) ? out.quick_replies.slice(0, 4).map(String) : [],
      urgent: out.urgent === true,
    });
  } catch (e) {
    return res.status(502).json({ error: 'Could not read AI response' });
  }
}
