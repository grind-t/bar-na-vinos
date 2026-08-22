import type { Commodity } from "@grind-t/loyalsuns";
import { $ } from "zx";

const commodities: Commodity[] =
  await $`loyalsuns commodities --size 50 2029385561100861442`.json();

const result = commodities
  .filter((commodity) => !!commodity.status)
  .map((commodity) => ({
    name: commodity.commodityName,
    image: commodity.commodityImg,
    hot: !!commodity.coldOrHot,
  }));

console.log(JSON.stringify(result, null, 2));
