# bako
Granblue fantasy (gbf) auto refresh on attack

## v4.3
- Split summon reload from attack reload: new "Summon" toggle in the popup.
- All toggles now default to off (they're reset on every extension reload).

## v4.2
- Added a reload mode option for the raid-entry action: choose between back & forward (default), back only, or a full reload.

## v4.1
- Added a "Raid entry" reload option: reloads once, immediately, the first time you join a raid (deduped per raid id), off by default.
- Restyled the popup for readability (sectioned layout, no functional changes).

## v4.0
- Migrated to Manifest V3 (service worker background, `chrome.alarms` + tab back/forward instead of the old blocking reload).
- Fixed a race/deadlock in the farm-redirect lock (`ongoingRedirect`) that could loop or get stuck.
- Fixed the popup's redirect-timeout slider not restoring its saved value.
- Widened the farm-redirect URL match to catch the current `resultmulti/*` result endpoint.
- Tightened default delays (redirect ~200ms, jitter ~100-300ms) closer to real reaction time.
- Dropped dead `http://` permissions/URLs now that the game is https-only.
