# bako
Granblue fantasy (gbf) auto refresh on attack

## v4.0
- Migrated to Manifest V3 (service worker background, `chrome.alarms` + tab back/forward instead of the old blocking reload).
- Fixed a race/deadlock in the farm-redirect lock (`ongoingRedirect`) that could loop or get stuck.
- Fixed the popup's redirect-timeout slider not restoring its saved value.
- Widened the farm-redirect URL match to catch the current `resultmulti/*` result endpoint.
- Tightened default delays (redirect ~200ms, jitter ~100-300ms) closer to real reaction time.
- Dropped dead `http://` permissions/URLs now that the game is https-only.
