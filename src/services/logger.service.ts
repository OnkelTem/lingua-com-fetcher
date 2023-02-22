import chalk from "chalk";

export function createLogger(debug: boolean) {
  return {
    dbg(...msg: any[]) {
      if (debug) console.log(chalk.gray(...msg));
    },
    log(...msg: any[]) {
      console.log(chalk.blue(...msg));
    },
    warn(...msg: any[]) {
      console.warn(chalk.yellow(...msg));
    },
    err(...msg: any[]) {
      console.error(chalk.red(...msg));
    },
  };
}

export type Logger = ReturnType<typeof createLogger>;
