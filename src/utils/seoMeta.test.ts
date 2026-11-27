import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { injectRouteSeoHtml, resolveRouteSeo, OG_IMAGE_PATH } from './seoMeta.ts';

const indexHtml = fs.readFileSync(path.resolve(process.cwd(), 'index.html'), 'utf8');

test('resolveRouteSeo canonicalizes /connect alias to /campaign', () => {
  const meta = resolveRouteSeo('/connect?utm_source=instagram');
  assert.equal(meta.canonicalPath, '/campaign');
  assert.match(meta.title, /SG FINANCE/);
});

test('resolveRouteSeo marks /admin as noIndex', () => {
  const meta = resolveRouteSeo('/admin');
  assert.equal(meta.noIndex, true);
});

test('injectRouteSeoHtml outputs absolute HTTPS og:image, twitter:image, og:url, and canonical link', () => {
  const baseUrl = 'https://sgfinance.example.com';
  const rendered = injectRouteSeoHtml(indexHtml, '/services', baseUrl);

  assert.match(rendered, /<title>Financial Services \| SG FINANCE/);
  assert.match(
    rendered,
    new RegExp(`<link rel="canonical" href="${baseUrl}/services" />`)
  );
  assert.match(
    rendered,
    new RegExp(`<meta property="og:url" content="${baseUrl}/services" />`)
  );
  assert.match(
    rendered,
    new RegExp(`<meta property="og:image" content="${baseUrl}${OG_IMAGE_PATH}" />`)
  );
  assert.match(
    rendered,
    new RegExp(`<meta name="twitter:image" content="${baseUrl}${OG_IMAGE_PATH}" />`)
  );
  assert.doesNotMatch(rendered, /__SITE_BASE_URL__/);
  assert.doesNotMatch(rendered, /__SITE_OG_IMAGE_URL__/);
});

test('injectRouteSeoHtml sets robots noindex on /admin', () => {
  const rendered = injectRouteSeoHtml(indexHtml, '/admin', 'https://sgfinance.example.com');
  assert.match(rendered, /<meta name="robots" content="noindex, nofollow" \/>/);
});
