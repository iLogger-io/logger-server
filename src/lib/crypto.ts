import crypto from "crypto";

const key = crypto.createHash("md5").update(process.env.CRYPTO_PASSWORD!).digest("hex");
const iv = Buffer.from(process.env.CRYPTO_IV!);

export function encrypt(text_input: string): string {
  var encipher = crypto.createCipheriv("aes-256-cbc", key, iv),
    buffer = Buffer.concat([encipher.update(text_input), encipher.final()]);
  return buffer.toString("base64");
}

export function decrypt(encrypted_text: string): string {
  var decipher = crypto.createDecipheriv("aes-256-cbc", key, iv),
    buffer = Buffer.concat([
      decipher.update(Buffer.from(encrypted_text, "base64")),
      decipher.final(),
    ]);
  return buffer.toString();
}
