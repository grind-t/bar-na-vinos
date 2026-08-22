import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { Commodity } from "@grind-t/loyalsuns";
import sharp from "sharp";
import { $ } from "zx";

const YC_BUCKET = "bar-na-vinos-public";

const commodities: Commodity[] =
  await $`loyalsuns commodities --size 50 2029385561100861442`.json();
const publicCommodities = commodities.filter(isPublicCommodity);

await uploadImages(publicCommodities);

const result = publicCommodities.map((commodity) => ({
  name: commodity.commodityName,
  image: `https://storage.yandexcloud.net/${YC_BUCKET}/${commodity.commodityCode}.png`,
  hot: !!commodity.coldOrHot,
}));

console.log(JSON.stringify(result, null, 2));

function isPublicCommodity({ status, categoriesName }: Commodity) {
  return !!status && !["test", "water"].includes(categoriesName);
}

async function renderCommodityImage(commodity: Commodity, tmpDir: string) {
  const response = await fetch(commodity.commodityImg);
  const buffer = await response.arrayBuffer();

  const { width, height } = await sharp(buffer).metadata();
  const [canvasWidth, canvasHeight] =
    width / height > 4 / 3
      ? [width, Math.round(width * (3 / 4))]
      : [Math.round(height * (4 / 3)), height];

  await sharp(buffer)
    .resize({
      width: canvasWidth,
      height: canvasHeight,
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toFile(join(tmpDir, `${commodity.commodityCode}.png`));
}

async function uploadImages(commodities: Commodity[]) {
  const tmpDir = await mkdtemp(join(tmpdir(), "bar-na-vinos-"));
  await Promise.all(commodities.map((commodity) => renderCommodityImage(commodity, tmpDir)));
  await $`yc storage s3 cp ${tmpDir} s3://${YC_BUCKET}/ --recursive`;
  await rm(tmpDir, { recursive: true });
}
