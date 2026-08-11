// @ts-nocheck - standalone Bun runtime script, not part of the Next.js bundle
// Bun reverse proxy: port 3000 (public) -> 3001 (Next.js)
// Keeps the public surface on port 3000 while Next runs on 3001.
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
      // Copy headers, dropping hop-by-hop ones
      const headers = new Headers(res.headers);
      headers.delete('connection');
      headers.delete('keep-alive');
      headers.delete('transfer-encoding');
      return new Response(res.body, {
        status: res.status,
        statusText: res.statusText,
        headers,
      });
    } catch (e) {
      return new Response(`Proxy error: ${(e as Error).message}`, { status: 502 });
    }
  },
});

console.log(`Proxy running on :3000 -> ${TARGET}`);
