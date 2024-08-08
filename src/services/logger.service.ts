import fs from "fs";

export type LogLevel = "DEBUG" | "INFO" | "WARN" | "ERROR";

export type LogArgument = string | number | boolean | object | Error;

export interface LoggerService {
  debug(...args: LogArgument[]): void;
  info(...args: LogArgument[]): void;
  warn(...args: LogArgument[]): void;
  error(...args: LogArgument[]): void;
}

export const loggerService: LoggerService = {
  debug(...args: LogArgument[]): void {
    doLog("DEBUG", ...args);
  },
  info(...args: LogArgument[]): void {
    doLog("INFO", ...args);
  },
  warn(...args: LogArgument[]): void {
    doLog("WARN", ...args);
  },
  error(...args: LogArgument[]): void {
    doLog("ERROR", ...args);
  },
};

const logsDir = "./logs";
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

function getTime(): string {
  let now = new Date();
  return now.toLocaleString("he");
}

function isError(err: unknown): err is Error {
  return err instanceof Error;
}

function stringifyArg(arg: LogArgument): string {
  if (typeof arg === "string") return arg;
  if (isError(arg)) return arg.message;
  return JSON.stringify(arg);
}

function doLog(level: LogLevel, ...args: LogArgument[]): void {
  const strs = args.map(stringifyArg);
  const line = `${getTime()} - ${level} - ${strs.join(" | ")}\n`;
  fs.appendFile("./logs/backend.log", line, (err) => {
    if (err) console.log("FATAL: cannot write to log file");
  });
}
