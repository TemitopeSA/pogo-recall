# Pogo Recall — concept prototype

A clickable, high-fidelity prototype of **Pogo Recall**, a win-back intelligence workflow inside Pogo's Signals area:
**Detect → Understand → Win back → Prove**. Includes an 11-step guided tour, a mock Pogo agent, a live campaign builder
with forecast and consumer-app preview, and receipt-verified results.

All brands, people, receipts and results are fictional mock data. No backend, no network calls.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
```

Key locations:
- `src/data/` — centralized mock data, campaign forecast model, agent responses
- `src/components/tour/` — state-driven tour engine (`tourSteps.ts` defines the 11 steps)
- `src/pages/` — Detect, Understand, Campaign, Results, Chat and supporting pages
