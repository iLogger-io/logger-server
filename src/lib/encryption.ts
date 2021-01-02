import crypto from "crypto";
import { v4 as uuidv4, validate } from "uuid";

const password = Buffer.from(process.env.CRYPTO_PASSWORD!);
const iv = Buffer.from(process.env.CRYPTO_IV!);

export function genid() {
  return uuidv4();
}

export function validateid(uuid: string) {
  return validate(uuid);
}

function sha1(input: Buffer) {
  return crypto.createHash("sha1").update(input).digest();
}

function PasswordDeriveBytes(password: Buffer, salt: string, iterations: number, len: number) {
  var key = Buffer.from(password + salt);
  for (var i = 0; i < iterations; i++) {
    key = sha1(key);
  }
  if (key.length < len) {
    var hx = PasswordDeriveBytes(password, salt, iterations - 1, 20);
    for (var counter = 1; key.length < len; ++counter) {
      key = Buffer.concat([key, sha1(Buffer.concat([Buffer.from(counter.toString()), hx]))]);
    }
  }
  return Buffer.alloc(len, key);
}

export async function encrypt(string: string) {
  var key = PasswordDeriveBytes(password, "", 100, 32);
  var cipher = crypto.createCipheriv("aes-256-cbc", key, Buffer.from(iv));
  var part1 = cipher.update(string, "utf8");
  var part2 = cipher.final();
  const encrypted = Buffer.concat([part1, part2]).toString("base64");
  return encrypted;
}

export async function decrypt(string: string) {
  var key = PasswordDeriveBytes(password, "", 100, 32);
  var decipher = crypto.createDecipheriv("aes-256-cbc", key, Buffer.from(iv));
  var decrypted = decipher.update(string, "base64", "utf8");
  decrypted += decipher.final();
  return decrypted;
}
