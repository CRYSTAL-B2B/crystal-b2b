import { gzipSync } from "node:zlib";

const origin = process.argv[2] ?? "http://127.0.0.1:3011";
const response = await fetch(origin);

if (!response.ok) {
  throw new Error(`Не удалось загрузить ${origin}: ${response.status}`);
}

const html = await response.text();
const sources = [
  ...new Set(
    [...html.matchAll(/<script[^>]+src="([^"]+\.js[^"]*)"/g)].map((match) => match[1]),
  ),
];
const chunks = [];

for (const source of sources) {
  const chunkResponse = await fetch(new URL(source, origin));
  const bytes = Buffer.from(await chunkResponse.arrayBuffer());
  chunks.push({
    source: source.split("?")[0],
    raw: bytes.length,
    gzip: gzipSync(bytes).length,
  });
}

chunks.sort((a, b) => b.gzip - a.gzip);
for (const chunk of chunks) {
  console.log(`${(chunk.gzip / 1024).toFixed(1)} KB gzip\t${chunk.source}`);
}

const totalRaw = chunks.reduce((sum, chunk) => sum + chunk.raw, 0);
const totalGzip = chunks.reduce((sum, chunk) => sum + chunk.gzip, 0);
console.log(`TOTAL\t${(totalGzip / 1024).toFixed(1)} KB gzip / ${(totalRaw / 1024).toFixed(1)} KB raw`);
