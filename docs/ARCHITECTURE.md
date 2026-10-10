# Robotcyb hub

The original scene geometry, Oracle and its modes, support addresses, sentiment actions and external token destinations are preserved.

- `legacy.css`: extracted original style; retained compatibility.
- `legacy-runtime.js`: original scenes and interaction classes. Constructor animation registrations use one `SceneClock`; render work pauses when the tab is hidden, capped at 30 fps (12 with reduced motion), DPR limited to 1.5.
- `runtime.js`: scheduler and resilient local storage. Sentiment is local device data.
- `modern.css` / `modern.js`: responsive hub composition, readable token section, prompts, keyboard controls and sound visibility handling.
- `robot-mind.js` / `ai-worker.js`: background local AI loading, bounded conversations and corrected factual project guide. No server credentials.
- `locales.js` / `i18n.js`: English default, Russian and Simplified Chinese interface catalogue. User-generated chat text is excluded from automatic rewriting.
- `agents/`, `data/projects.json`, `llms.txt`: static project identity and explicit capability/status limits. llms.txt is a convention, not an access-control mechanism.

CicadaFarm links point to Cloudflare Pages. Repositories are marked as research, not fictitious available products. Wallets/signing are not performed by the companion.
