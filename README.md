# MedSynthea demo

Clickable 15-step revenue-cycle prototype. It reuses the MedSynthea design system (styles, shared components, RCM shell). It has no backend and makes no API calls. All data is sample data kept in `localStorage`.

## Run

```bash
pnpm install
pnpm dev        # http://localhost:3100
```

Login: `medsynthea-demo@medsynthea.com` / `med@1122`

## The journey

1 Registration → 2 Appointment → 3 Eligibility (auto-verified) → 4 Audio upload → 5 Transcription →
6 Clinical note → 7 Coding → 8 Patient estimate → 9 Denial prevention (always "No") → 10 Claim (837P) →
11 Submission → 12 Claim status (auto notifications) → 13 ERA (835) → 14 EOB (PDF download) → 15 Reconciliation

Step 3 includes **prior authorization** for the surgery visit type, submitted by a payer-portal bot or as an X12 278 request. Step 11 offers **EDI or payer web-portal** submission.

Other modules:

- **AR caller agent** (`/dashboard/ar`): a worklist of unpaid and denied claims, and a live call screen (phone menu, hold, streaming transcript, field extraction, call summary). Its post-call actions change the data: corrected claim, records upload through the portal, expedite.
- **AI assistant** (`/dashboard/assistant`): answers questions from the live demo data. It tolerates typos and remembers "this patient". The question guide is `docs/MedSynthea-Demo-AI-Assistant-Questions.docx`.
- The dashboard, AI assistant and notification center are ports of the real Frontend components (`RcmConsolePage`, `AiAssistant`, Notification Center), fed by demo data.

The demo login is **Dr. Tom Advert** (Family Medicine). **Rizwan Khan** is seeded with an office visit today that has not started yet (eligibility is the next step).

The recorded visit (`src/demo/rlqVisit.ts`) is used for everything a user brings in: every new appointment, every uploaded recording and every uploaded note. It always gives:

- **Transcript:** the Deepgram transcript of the demo recording (`audio.mp3`, 9:42), in `src/demo/rlqVisitTranscript.ts`.
- **Note:** the signed SOAP note for right lower quadrant abdominal pain, including its amendment.
- **Codes:** R10.31, R68.81, R19.4, R68.2 (review) and CPT 99213 (review). "Upload clinical note" on the coding step reads these codes from an uploaded note.
- **Price:** 99213 is billed at $95.19 (2026 Medicare national non-facility rate), place of service 11, copay only.

The seeded sample visits keep their own notes (ER viral syndrome, ER chest pain, renal-exploration operative report).

To restore the sample data, clear the site's local storage in the browser.

## Where things live

- `src/demo/` holds the domain types, reference data (payers, providers, steps), clinical templates, billing math, seed data, store and PDF generation.
- `src/components/demo/` holds the shell, step panels and list-page scaffold.
- `src/app/dashboard/` holds the routes.

## Deploy on Vercel

Import the repository in Vercel. No environment variables are needed.

- Framework: Next.js (detected, also set in `vercel.json`)
- Install: `pnpm install --frozen-lockfile`
- Build: `pnpm build`
- Node: 20 or newer

All data is generated in the browser and kept in `localStorage`, so there is no backend to configure.
