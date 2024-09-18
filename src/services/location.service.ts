import fs from "fs";
import path from "path";
import csv from "csv-parser";
import { prisma } from "../../prisma/prismaClient";
import { loggerService } from "./logger.service";

let ipToCountryData: {
  startIp: number; // Convert IP to number for easier comparison
  endIp: number; // Convert IP to number for easier comparison
  countryName: string;
  countryCode: string;
}[] = [];

const loadIpToCountryData = () => {
  const filePath = path.join(__dirname, "../../locationData/country.json");
  const data = fs.readFileSync(filePath, "utf8");
  const lines = data.trim().split("\n");
  const list = lines.map((line) => JSON.parse(line));
  const ip =  "147.235.208.51";

  const item = list.find((item) => {

    return ip.replace(/\./g, '') >= item.start_ip.replace(/\./g, '') && ip.replace(/\./g, '') <= item.end_ip.replace(/\./g, '');
  });
  console.log("item:", item)

  // console.log("filePath:", filePath);

  // fs.createReadStream(filePath)
  //   .pipe(csv({ headers: false }))
  //   .on("data", (row) => {
  //     const startIp = +row[0].substring(2);
  //     const endIp = +row[1].substring(2);
  //     const countryCode = row[2];
  //     const countryName = row[3];

  //     if (!startIp || !endIp || countryCode === "-" || countryCode === "") {
  //       return; // Skip invalid rows
  //     }
  //     ipToCountryData.push({
  //       startIp,
  //       endIp,
  //       countryCode: countryCode, // Use the country code
  //       countryName: countryName,
  //     });
  //   })
  //   .on("end", () => {
  //     const ip = 14723520851;
  //     const iq = 1474142679808;
  //     // const ip = BigInt(14723520851)
  //     console.log("ip:", ip);

  //     const isBetween = ipToCountryData.find((item) => {
  //       console.log("item.startIp:", item.startIp);

  //       return ip >= item.startIp && ip <= item.endIp;
  //     });
  //     console.log("isBetween:", isBetween);
  //     console.log(typeof ipToCountryData[0].endIp);
  //     // try {
  //     //   // await prisma.locationIP.createMany({
  //     //   //   data: ipToCountryData,
  //     //   //   skipDuplicates: true,
  //     //   // });

  //     //   // console.log("ipToCountryData[0]:", ipToCountryData[0])
  //     //   // const t = await prisma.locationIP.create({
  //     //   //   data: {
  //     //   //     startIp: ipToCountryData[0].startIp,
  //     //   //     endIp: ipToCountryData[0].endIp,
  //     //   //     countryCode: ipToCountryData[0].countryCode,
  //     //   //     countryName: ipToCountryData[0].countryName,
  //     //   //   },
  //     //   // });
  //     //   // console.log(" t:",  t)

  //     //   console.log("IP-to-country data loaded");
  //     // } catch (error) {
  //     //   loggerService.error(
  //     //     "Error loading IP-to-country data:",
  //     //     error as Error
  //     //   );
  //     //   console.error("Error loading IP-to-country data:", error);
  //     // } finally {
  //     //   await prisma.$disconnect();
  //     // }
  //   });
};

const ipToNumber = (ip: string): bigint => {
  const num = ip
    .split(".")
    .reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0);
  return BigInt(num);
};

export const findCountryByIp = async (ip: string): Promise<string> => {
  console.log("ip:", ip);
  const ipNumber = ipToNumber(ip);
  console.log("ipNumber:", ipNumber);
  const country = await prisma.locationIP.findFirst({
    // where: {
    //   startIp: {
    //     lte: ipNumber,
    //   },
    //   endIp: {
    //     gte: ipNumber,
    //   },
    // },
    // select: {
    //   countryName: true,
    // },
  });

  return country?.countryName || "";
};

loadIpToCountryData();
