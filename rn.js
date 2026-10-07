const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ASSET_DIR = path.join(__dirname, "assets");
const ALLOWED_EXT = new Set([
  ".jpg", ".jpeg", ".png", ".gif", ".webp", ".bmp", ".avif",
]);

function random24() {
  return crypto.randomBytes(12).toString("hex");
}

function listImages() {
  if (!fs.existsSync(ASSET_DIR)) {
    fs.mkdirSync(ASSET_DIR, { recursive: true });
    return [];
  }

  return fs
    .readdirSync(ASSET_DIR)
    .filter((name) => {
      const ext = path.extname(name).toLowerCase();
      return ALLOWED_EXT.has(ext);
    })
    .sort();
}

function buildManifest() {
  const files = listImages();
  const manifest = [];

  for (const file of files) {
    const ext = path.extname(file);
    const newName = `${random24()}${ext}`;
    const oldPath = path.join(ASSET_DIR, file);
    const newPath = path.join(ASSET_DIR, newName);

    if (oldPath !== newPath) {
      fs.renameSync(oldPath, newPath);
    }

    manifest.push({
      storedName: newName,
      displayName: file,
      downloadName: file,
      fileUrl: `./assets/${newName}`,
      thumbnail: `./assets/ziped/${path.basename(newName, ext)}.webp`,
    });
  }

  fs.writeFileSync(
    path.join(ASSET_DIR, "manifest.json"),
    JSON.stringify(manifest, null, 2),
    "utf8"
  );
}

buildManifest();
console.log("资产重命名完成，manifest.json 已生成");