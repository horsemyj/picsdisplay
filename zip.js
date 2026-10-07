const fs = require("fs");
const path = require("path");
const sharp = require("sharp");

const ASSET_DIR = path.join(__dirname, "assets");
const ZIPED_DIR = path.join(ASSET_DIR, "ziped");
const MANIFEST_PATH = path.join(ASSET_DIR, "manifest.json");

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error("未找到 manifest.json，请先执行重命名脚本");
  process.exit(1);
}

fs.mkdirSync(ZIPED_DIR, { recursive: true });

const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, "utf8"));

(async () => {
  for (const item of manifest) {
    const sourcePath = path.join(ASSET_DIR, item.storedName);
    const extName = path.parse(item.storedName).name;
    const thumbPath = path.join(ZIPED_DIR, `${extName}.webp`);

    await sharp(sourcePath)
      .resize(220, 220, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toFile(thumbPath);

    item.thumbnail = `./assets/ziped/${extName}.webp`;
  }

  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), "utf8");
  console.log("缩略图生成完成，已写回 manifest.json");
})();