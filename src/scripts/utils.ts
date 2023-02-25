import chalk from "chalk";

export function doneBox() {
  return chalk.greenBright(String.fromCharCode(0x2713)); // ✓
}

export function errBox() {
  return chalk.redBright(String.fromCharCode(0x00d7)); // ×
}

export function premiumBox(msg?: string) {
  return chalk.yellowBright(msg || "p"); // ×
}
