import { execFileSync } from "node:child_process";

interface RawCommodity {
  status: number;
  commodityName: string;
  commodityImg: string;
  coldOrHot: number;
}

interface Commodity {
  name: string;
  image: string;
  hot: boolean;
}

const output = execFileSync("loyalsuns", ["commodities", "--size", "50", "2029385561100861442"], {
  encoding: "utf8",
});

const commodities: RawCommodity[] = JSON.parse(output);

const result: Commodity[] = commodities
  .filter((commodity) => !!commodity.status)
  .map((commodity) => ({
    name: commodity.commodityName,
    image: commodity.commodityImg,
    hot: !!commodity.coldOrHot,
  }));

console.log(JSON.stringify(result, null, 2));
