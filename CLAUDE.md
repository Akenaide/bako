# bako
Chrome extension: auto-refresh on attack/summon in Granblue Fantasy. No tests and no build; check with `node --check *.js`.

Release: add a `## vX.Y` entry at the top of `README.md`, then `just release X.Y` bumps `version` in `manifest.json`, commits as `bump version to X.Y`, tags `vX.Y` and pushes. The tag push runs `.github/workflows/release.yml`, which zips the repo with `git archive` (leave files out with `export-ignore` in `.gitattributes`) and creates the GitHub release.
