import { mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";

import type { Commodity } from "@grind-t/loyalsuns";
import sharp from "sharp";
import * as XLSX from "xlsx";
import { $ } from "zx";

const YC_BUCKET = "bar-na-vinos-public";
const EXPORTS_DIR = join(import.meta.dirname, "..", "exports");

const commodities = await $`loyalsuns commodities --size 50 2029385561100861442`
  .json()
  .then((v: Commodity[]) => v.filter(isPublicCommodity));

await uploadImages(commodities);
await exportForYandexMap(commodities);

function isPublicCommodity({ status, categoriesName }: Commodity) {
  return !!status && !["test", "water"].includes(categoriesName);
}

async function renderImage(commodity: Commodity, tmpDir: string) {
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
  await Promise.all(commodities.map((commodity) => renderImage(commodity, tmpDir)));
  await $`yc storage s3 cp ${tmpDir} s3://${YC_BUCKET}/ --recursive`;
  await rm(tmpDir, { recursive: true });
}

async function exportForYandexMap(commodities: Commodity[]) {
  const header = [
    "Категория",
    "Название",
    "Идентификатор",
    "Описание",
    "Короткое описание",
    "Цена",
    "Фото",
    "Популярный товар",
    "В наличии",
    "Количество",
    "Единицы измерения",
    "Ссылка",
  ];

  const rows = commodities.map((v) => [
    v.categoriesName,
    v.commodityName,
    "",
    "",
    "",
    Number(v.commodityPrice),
    `https://storage.yandexcloud.net/${YC_BUCKET}/${v.commodityCode}.png`,
    "",
    "Да",
    v.coldOrHot ? 250 : 350,
    "миллилитр",
    "",
  ]);

  const sheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const book = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(book, sheet, "Прайс-лист");
  XLSX.writeFile(book, join(EXPORTS_DIR, "yandex-price-list.xls"), { bookType: "xls" });
}
