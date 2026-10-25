#!/usr/bin/env node
// One-time, reviewed content import. This does not scrape Facebook or run at startup.
const fs = require('node:fs');
const path = require('node:path');
const { createRequire } = require('node:module');
const { randomUUID, createHash } = require('node:crypto');

const root = path.resolve(__dirname, '..');
const serverRequire = createRequire(path.join(root, 'server/package.json'));
serverRequire('dotenv').config({ path: path.join(root, 'server/.env'), quiet: true });
const { Client } = serverRequire('pg');
const { databaseOptions } = require('../server/dist/config/database.config.js');
const args = process.argv.slice(2);
if (args.some(arg => !['--apply', '--dry-run'].includes(arg)) || (args.includes('--apply') && args.includes('--dry-run'))) {
  throw new Error('Usage: node scripts/import-facebook-news.cjs [--dry-run | --apply]');
}
const apply = args.includes('--apply');
const manifest = JSON.parse(fs.readFileSync(path.join(root, 'content/facebook-news-2026-10-25.json'), 'utf8'));
const seen = new Set();
for (const post of manifest.posts) {
  if (!post.slug || seen.has(post.slug) || !post.title || !post.excerpt || !post.tag ||
      !Array.isArray(post.body) || post.body.length === 0 || post.body.some(p => typeof p !== 'string' || !p.trim()) ||
      !Number.isFinite(Date.parse(post.publishedAt)) || Date.parse(post.publishedAt) > Date.now()) {
    throw new Error('Invalid or duplicate article: ' + (post.slug || 'missing slug'));
  }
  const source = new URL(post.sourceUrl);
  if (source.protocol !== 'https:' || source.hostname !== 'www.facebook.com') throw new Error('Unexpected source URL');
  const asset = path.resolve(root, 'client/public', '.' + post.imageUrl);
  const assetRoot = path.resolve(root, 'client/public/assets/news') + path.sep;
  if (!asset.startsWith(assetRoot) || !fs.existsSync(asset)) throw new Error('Missing first-party cover: ' + post.slug);
  seen.add(post.slug);
}

const config = databaseOptions(process.env);
const client = new Client({ connectionString: config.url, ssl: config.ssl,
  connectionTimeoutMillis: config.extra.connectionTimeoutMillis });
const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
const backupPath = path.join(root, 'scratch', `news-before-facebook-import-${timestamp}.private.json`);
let committed = false;

(async () => {
  await client.connect();
  await client.query('BEGIN');
  await client.query("SET LOCAL lock_timeout = '10s'");
  await client.query("SET LOCAL statement_timeout = '30s'");
  if (apply) await client.query('LOCK TABLE public.news IN SHARE ROW EXCLUSIVE MODE');
  const existing = (await client.query('SELECT * FROM public.news ORDER BY id')).rows;
  const inserted = [], skipped = [];
  if (apply) {
    fs.mkdirSync(path.dirname(backupPath), { recursive: true });
    fs.writeFileSync(backupPath, JSON.stringify({ at: new Date().toISOString(), news: existing }, null, 2) + '\n', { flag: 'wx' });
  }
  for (const post of manifest.posts) {
    const duplicate = await client.query(`SELECT id, slug FROM public.news n
      WHERE n.slug = $1 OR EXISTS (
        SELECT 1 FROM jsonb_array_elements_text(n.body) AS paragraph(value)
        WHERE strpos(paragraph.value, $2) > 0
      ) LIMIT 1`, [post.slug, post.sourceUrl]);
    if (duplicate.rowCount) { skipped.push(post.slug); continue; }
    if (!apply) { inserted.push({ slug: post.slug }); continue; }
    const body = [...post.body, `Nguồn: ${post.sourcePublisher}. ${post.sourceUrl}`];
    const id = randomUUID();
    await client.query(`INSERT INTO public.news
      (id, slug, title, excerpt, body, tag, "imageUrl", "publishedAt")
      VALUES ($1,$2,$3,$4,$5::jsonb,$6,$7,$8)`,
    [id, post.slug, post.title, post.excerpt, JSON.stringify(body), post.tag, post.imageUrl, post.publishedAt]);
    inserted.push({ id, slug: post.slug });
  }
  if (apply) {
    // A reviewed import adds rows only; existing content must remain byte-for-byte unchanged.
    const after = (await client.query('SELECT * FROM public.news WHERE id = ANY($1::uuid[]) ORDER BY id', [existing.map(n => n.id)])).rows;
    const hash = value => createHash('sha256').update(JSON.stringify(value)).digest('hex');
    if (hash(existing) !== hash(after)) throw new Error('Existing news changed; cancelling import');
    await client.query('COMMIT');
    committed = true;
    const reportPath = backupPath.replace('.private.json', '.report.json');
    fs.writeFileSync(reportPath, JSON.stringify({ at: new Date().toISOString(), manifest: 'content/facebook-news-2026-10-25.json',
      inserted, skipped, preservedExisting: existing.length, backupPath }, null, 2) + '\n', { flag: 'wx' });
    console.log('Content import committed. Backup:', backupPath);
  } else await client.query('ROLLBACK');
  console.log(JSON.stringify({ mode: apply ? 'apply' : 'dry-run', articles: manifest.posts.length,
    insertCount: inserted.length, skipCount: skipped.length, slugs: inserted.map(p => p.slug) }, null, 2));
})().catch(async error => {
  if (!committed) await client.query('ROLLBACK').catch(() => {});
  console.error(committed ? 'Import committed, but report writing failed.' : 'Import cancelled; no content changes committed.', error.code || error.message);
  process.exitCode = 1;
}).finally(() => client.end());
