# Analytics verification report

Tested in a real headless Microsoft Edge browser using Playwright against a local HTTP server. All tests passed. External requests were intercepted: the enabled case substitutes an empty Google loader and inspects the queued GA commands; the blocked case aborts the request. No real Measurement ID or production data was used.

## Passed browser checks

- unconfigured: complete perfect mixed quiz (1350 points), locked answers on reload, saved progress, no app errors
- blocked: complete perfect mixed quiz (1350 points), locked answers on reload, saved progress, no app errors
- missing: complete perfect mixed quiz (1350 points), locked answers on reload, saved progress, no app errors
- opt-in: no Google request beforehand; event allowlist, 80% category completion, retry, lessons, no replay, withdrawal preserves progress and prevents requests
- Global Privacy Control: complete mixed quiz without app errors
- blocked localStorage: complete mixed quiz without app errors

## Additional verification

- JavaScript syntax checks passed for script.js and analytics.js.
- The original analytics tests below were run before the branding change. The rename updates branding, license attribution, analytics globals/titles, and the 404 repository path; training logic and stored-data keys are unchanged.
- Original scamspotter.v1 storage key/schema and progress validation are preserved.
- Source review confirms default disabled config, numeric/enum event allowlists, bounded pending queue, denied ad consent, suppressed automatic page view, and query/referrer exclusion.
- A no-referrer document policy was added after browser tests; this metadata-only change does not change app behavior.

## Limits

These tests validate app behavior, dispatch commands and privacy boundaries, not the real Google library, its cookie behavior, or server receipt. Real GA4 Realtime verification and property-side privacy settings remain the owner's setup steps after supplying a Measurement ID. No live GitHub repository was modified or deployed; this is the updated source package from the original task's local project.

## ScamVanta rename verification

Passed a fresh Edge browser smoke check: header/title and About branding, renamed analytics module availability, starting a quiz, submitting an answer, locked answer and saved progress after reload, and no app errors. JavaScript syntax checks passed. All remaining old-name references are the deliberately preserved internal storage keys and their documentation.
