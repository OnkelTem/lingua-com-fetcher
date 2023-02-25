import { OutOfSync } from "../errors";

export function assertNotEmpty<T>(value: T, message: string): asserts value is Exclude<T, null | undefined> {
  if (value == null) {
    throw new OutOfSync(`Not-empty value assertion "${message}" failed`);
  }
}
