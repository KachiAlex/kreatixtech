const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

// Create an SVG of the Kreatix Mail app icon — orange rounded square with white K
const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect x="32" y="32" width="448" height="448" rx="96" fill="#F2782E"/>
  <path d="M130 90h160v80l110-80v140L290 310l100 90H260L130 340z" fill="#fff"/>
</svg>`;

const buildDir = path.join(__dirname, 'build');
const pngOut = path.join(buildDir, 'icon.png');
const icoOut = path.join(buildDir, 'icon.ico');

async function buildIcon() {
  // Generate 512x512 PNG
  await sharp(Buffer.from(iconSvg)).png().toFile(pngOut);
  console.log('PNG icon created:', pngOut);

  // Generate ICO with multiple sizes
  const sizes = [256, 128, 64, 48, 32, 16];
  const buffers = [];
  for (const size of sizes) {
    const buf = await sharp(Buffer.from(iconSvg)).resize(size, size).png().toBuffer();
    buffers.push(buf);
  }

  const headerSize = 6;
  const dirEntrySize = 16;
  const dirSize = dirEntrySize * sizes.length;
  let dataOffset = headerSize + dirSize;

  const icoHeader = Buffer.alloc(headerSize);
  icoHeader.writeUInt16LE(0, 0);
  icoHeader.writeUInt16LE(1, 2);
  icoHeader.writeUInt16LE(sizes.length, 4);

  const dirEntries = [];
  for (let i = 0; i < sizes.length; i++) {
    const entry = Buffer.alloc(dirEntrySize);
    const size = sizes[i];
    const pngBuf = buffers[i];
    entry.writeUInt8(size >= 256 ? 0 : size, 0);
    entry.writeUInt8(size >= 256 ? 0 : size, 1);
    entry.writeUInt8(0, 2);
    entry.writeUInt8(0, 3);
    entry.writeUInt16LE(1, 4);
    entry.writeUInt16LE(32, 6);
    entry.writeUInt32LE(pngBuf.length, 8);
    entry.writeUInt32LE(dataOffset, 12);
    dirEntries.push(entry);
    dataOffset += pngBuf.length;
  }

  const ico = Buffer.concat([icoHeader, ...dirEntries, ...buffers]);
  fs.writeFileSync(icoOut, ico);
  console.log('ICO icon created:', icoOut);
}

buildIcon().catch(console.error);
