# MedClear

MedClear helps people understand their health in plain language.

Built for DSH Hacks V2 (AI x Healthcare).

**Not medical advice.** MedClear gives information only. It does not diagnose, prescribe or give personal doses, and it does not replace a doctor or pharmacist.

## What it does

### 1. Medicine explainer
Type in the medicines you were prescribed (name, strength, how often). MedClear explains:
- what each medicine is for and how to take it
- a simple morning, afternoon and night schedule
- warnings and interactions (for example alcohol, or two medicines that should not be mixed)
- when to see a doctor or pharmacist

### 2. Talk to Geraldine (AI health guide)
For people who do not feel well. Geraldine is an AI, not a real doctor. She asks one clear question at a time (where, how long, how strong, fever or vomiting), then gives:
- common possible causes (never a diagnosis)
- safe things to do now
- warning signs that mean go to a hospital immediately
- what kind of doctor or test may help

If someone describes an emergency, she stops asking questions and tells them to get urgent help. She never prescribes and never gives doses.

## Responsible AI choices
- Clear "AI, not a real doctor" labels on every screen
- Emergency banner and emergency stop in the chat
- No prescriptions and no personal doses
- Always points to a pharmacist or the medicine label for dosing

## How it works
- `index.html`: medicine explainer page
- `chat.html`: Geraldine chat page
- `api/explain.js` and `api/chat.js`: serverless functions that call the Gemini API (the key is kept as an environment variable, never in the code)

## Run / deploy
1. Deploy the repo on Vercel.
2. Add the environment variable `GEMINI_API_KEY`.

## AI use
Gemini powers the explanations and the chat. AI coding assistance (Claude) was used to help write the code. The idea, the product decisions and the safety rules were set by the builder, who is trained in pharmacy.
