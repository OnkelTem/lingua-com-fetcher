import chalk from "chalk";

export function doneBox() {
  return chalk.greenBright("✓");
}

export function errBox() {
  return chalk.redBright("×");
}

export function missedBox() {
  return "×";
}

export function premiumBox(msg?: string) {
  return chalk.yellowBright(msg || "p");
}

export function skipBox(msg?: string) {
  return chalk.gray(msg || "—");
}
