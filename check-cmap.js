// Inspect ToUnicode CMaps in resume.pdf: verify ligature glyphs (fi/fl/ft)
// map back to their character sequences (ATS text-layer health check).
const fs = require("fs");
const zlib = require("zlib");

const buf = fs.readFileSync("resume-core/resume.pdf");
const latin = buf.toString("latin1");

const streams = [];
let idx = 0;
while (true) {
  const start = latin.indexOf("stream\r\n", idx);
  const start2 = latin.indexOf("stream\n", idx);
  const s = start === -1 ? start2 : start2 === -1 ? start : Math.min(start, start2);
  if (s === -1) break;
  const e = latin.indexOf("endstream", s);
  if (e === -1) break;
  const dataStart = s + (latin[s + 6] === "\r" ? 8 : 7);
  streams.push(buf.slice(dataStart, e));
  idx = e + 9;
}

let cmaps = 0;
const interesting = [];
for (const s of streams) {
  let text = null;
  try {
    text = zlib.inflateSync(s).toString("latin1");
  } catch {
    continue;
  }
  if (!text.includes("beginbfchar") && !text.includes("beginbfrange")) continue;
  cmaps++;
  // find mappings whose unicode target decodes to fi/fl/ft/ti sequences
  const charBlocks = text.match(/beginbfchar([\s\S]*?)endbfchar/g) || [];
  for (const block of charBlocks) {
    const pairs = block.match(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/g) || [];
    for (const pair of pairs) {
      const m = pair.match(/<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>/);
      const uni = m[2].replace(/(..)(..)/g, (_, a, b) => {
        const code = parseInt(a + b, 16);
        return code >= 32 && code < 127 ? String.fromCharCode(code) : `\\u${a}${b}`;
      });
      if (/fi|fl|ft|ti/.test(uni) && uni.length <= 3) {
        interesting.push(`glyph <${m[1]}> -> "${uni}"`);
      }
    }
  }
}

console.log("ToUnicode CMaps:", cmaps);
console.log("Ligature mappings found:", interesting.length);
console.log(interesting.slice(0, 20).join("\n"));
