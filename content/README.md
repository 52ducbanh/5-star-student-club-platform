# Reviewed Facebook news snapshots

`facebook-news-2026-10-25.json` contains six recent substantive posts from the public [5SS UET fanpage](https://www.facebook.com/5ss.uet), verified in the owner's logged-in browser on 2026-10-25. It includes the Club Expo post by ĐTN–HSV UET shared by the fanpage. Profile/cover changes, comments and personal activity are excluded. Bodies are concise summaries with original source credit, not full transcripts. The publication timestamps use Vietnam time; activity dates in the body may differ from publication dates.

Covers are copied into `client/public/assets/news/2026-10/` and served by Vercel, avoiding expiring Facebook CDN links. Only matching post covers are included. No account cookies, credentials, reactions, comment author data or signed CDN URLs are committed.

Build/deploy the static covers first. Then build the server's shared database configuration and preview the import:

```powershell
npm run build:server
node scripts/import-facebook-news.cjs --dry-run
```

After reviewing the preview, use `--apply` with the intended backend database environment. The importer defaults to dry-run, uses verified TLS in production, backs up existing news to ignored `scratch/`, locks the news table during apply, inserts only missing slugs/source URLs and checks that existing articles are unchanged. It never seeds events, registers anyone, changes game data or runs automatically on server startup. Repeating the import skips existing articles. Keep database URLs out of command arguments, Git and client variables.

For this deployment, production credentials are loaded only through the existing ignored local environment wrapper. Keep raw browser evidence and backup reports in ignored `scratch/`. Future updates require a new verified snapshot or deliberately reviewed edits; this is not a scheduled Facebook synchronization service.
