// ─── Live Stream Config (YouTube Live) ────────────────────────────────────
//
// HOW TO GO LIVE:
//   1. Start the stream on YouTube Studio
//   2. Copy the YouTube Live video ID from the stream URL
//      e.g. youtube.com/watch?v=abc123  →  LIVE_ID = 'abc123'
//   3. Set IS_LIVE = true and drop the ID below
//   4. Save & deploy — banner and TV screen update automatically
//   5. When stream ends, set IS_LIVE = false and clear LIVE_ID
//
// Both LiveStreamSection (/videos TV embed) and LiveSignal (site-wide banner)
// pull from here — one change updates everything.

export const IS_LIVE    = false
export const LIVE_ID    = ''          // YouTube Live video ID
export const LIVE_TITLE = 'Live with Algee'
