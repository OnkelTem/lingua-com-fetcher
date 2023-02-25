import chalk from "chalk";

type _LogFunc = {
  (...msg: any[]): any;
};
type LogFunc = _LogFunc & {
  raw: (...msg: any[]) => any;
};

export function createLogger(debug: boolean) {
  function print(msg: string, newLine: boolean = true) {
    process.stderr.write(`${msg}${newLine ? "\n" : ""}`);
  }

  const _dbg: _LogFunc = (...msg) => debug && chalk.gray(...msg);
  const dbg: LogFunc = (...msg) => print(_dbg(...msg));
  dbg.raw = (...msg) => print(_dbg(...msg), false);

  const _info: _LogFunc = (...msg) => chalk.whiteBright(...msg);
  const info: LogFunc = (...msg) => print(_info(...msg));
  info.raw = (...msg) => print(_info(...msg), false);

  const _warn: _LogFunc = (...msg) => chalk.yellow(...msg);
  const warn: LogFunc = (...msg) => print(_warn(...msg));
  warn.raw = (...msg) => print(_warn(...msg), false);

  const _err: _LogFunc = (...msg) => chalk.redBright(...msg);
  const err: LogFunc = (...msg) => print(_err(...msg));
  err.raw = (...msg) => print(_err(...msg), false);

  return {
    dbg,
    info,
    warn,
    err,
  };
}

export type Logger = ReturnType<typeof createLogger>;
