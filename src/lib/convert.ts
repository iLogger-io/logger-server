export function num2buf(num: number) {
  const b = new ArrayBuffer(2);
  new DataView(b).setUint16(0, num);
  return Buffer.from(b);
}

export function buf2num(buf: Buffer) {
  return parseInt(buf.toString("hex"), 16);
}
