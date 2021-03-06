import { v4 as uuidv4, validate } from "uuid";

export function genid(): string {
  return uuidv4();
}

export function validateid(uuid: string): boolean {
  return validate(uuid);
}

export function msleep(ms: number) {
  return new Promise((resolve, reject) => {
    if (isNaN(ms) || ms < 0) {
      reject("invalid_ms");
      return;
    }
    setTimeout(resolve, ms);
  });
}

export function convertVNtoEN(str: string) {
  return str
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D");
}

export function MatchRegex(regex: RegExp, text: string) {
  return text.match(regex);
}
