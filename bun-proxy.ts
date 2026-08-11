// @ts-nocheck - standalone Bun runtime script, not part of the Next.js bundle
// Bun reverse proxy: port 3000 (public) -> 3001 (Next.js)
// Keeps the public surface on port 3000 while Next runs on 3001.
//
// IMPORTANT: return the upstream Response object AS-IS. Reconstructing a new
// Response (even copying headers) corrupts compressed/streaming bodies —
// Next's prerender cache can serve Content-Encoding: gzip with the encoding
// mismatch, which browsers cannot inflate (renders as an empty page).
const TARGET = 'http://127.0.0.1:3001';

const server = Bun.serve({
  port: 3000,
  hostname: '0.0.0.0',
  async fetch(req) {
    const url = new URL(req.url);
    const targetUrl = TARGET + url.pathname + url.search;
    try {
      const res = await fetch(targetUrl, {
        method: req.method,
        headers: req.headers,
        body: req.method === 'GET' || req.method === 'HEAD' ? undefined : await req.arrayBuffer(),
        redirect: 'manual',
      });
      // Pass through untouched — preserves Content-Encoding, chunked streaming, etag, etc.
      return res;
    } catch (e) {
      return new Response(`Proxy error: ${(e as Error).message}`, { status: 502 });
    }
  },
});

console.log(`Proxy running on :3000 -> ${TARGET}`);
