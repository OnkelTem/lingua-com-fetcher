import { existsSync } from "fs";
import { readFile } from "fs/promises";
import { CredentialsError } from "../errors";
import { Logger } from "./logger.service";

export type Credentials = {
  username: string;
  password: string;
};

function isCredentials(arg: any): arg is Credentials {
  return (
    typeof arg === "object" &&
    arg.username != null &&
    typeof arg.username == "string" &&
    arg.password != null &&
    typeof arg.password == "string"
  );
}

export async function readCredentials(filepath: string) {
  const errMsg = `Error reading credentials file: "${filepath}"`;
  if (!existsSync(filepath)) {
    return undefined;
  }
  try {
    const rawContent = await readFile(filepath, "utf-8");
    const data = JSON.parse(rawContent);
    if (isCredentials(data)) {
      return data;
    } else {
      throw new Error("Data don't match the Credentials schema.");
    }
  } catch (e) {
    if (e instanceof Error) {
      throw new CredentialsError(`${errMsg}\n${e.message}`);
    }
    throw e;
  }
}
