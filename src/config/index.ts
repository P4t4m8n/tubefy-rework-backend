import configDev from "./dev";
import configProd from "./prod";

export interface Config {
  isGuestMode: boolean;
  [key: string]: any;
}

export const config: Config = (
  process.env.NODE_ENV === "production" ? configProd : configDev
) as Config;

if (process.env.NODE_ENV === "production") {
  console.log("process.env.NODE_ENV:", process.env.NODE_ENV);
}

config.isGuestMode = true;
