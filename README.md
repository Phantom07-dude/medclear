# MedClear

Plain-language explanations of your medicines: what each one is for, how to take it, a daily schedule, interaction warnings, and when to see a doctor.

Built for DSH Hacks V2 (AI x Healthcare).

**Not medical advice.** MedClear is an information tool. It does not diagnose or change doses.

## How it works
- `index.html`: the web app.
- `api/explain.js`: serverless function that calls the Gemini API (key stored as an environment variable, never in the code).

## Run / deploy
1. Deploy the repo on Vercel.
2. Add environment variable `GEMINI_API_KEY`. Optional: `GEMINI_MODEL` (default `gemini-2.5-flash`).

## AI use
Gemini powers the explanations. AI coding assistance (Claude) was used to help write the code.
