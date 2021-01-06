import jwt from "jsonwebtoken";
import crypto from "crypto";

export function sign(payload: any) {
  return jwt.sign(payload, process.env.JWT_SECRET!);
}

export function verifyToken(req: any) {
  if (
    (req.headers.authorization && req.headers.authorization.split(" ")[0]) === "Token" ||
    (req.headers.authorization && req.headers.authorization.split(" ")[0] === "Bearer")
  ) {
    const token = req.headers.authorization.split(" ")[1];
    try {
      return jwt.verify(token, process.env.JWT_SECRET!);
    } catch (err) {
      return null;
    }
  }
  return null;
}

export function validPassword(salt: string, password: string, passwordEncrypted: string): boolean {
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, "sha512").toString("hex");
  return passwordEncrypted === hash;
}

export function verifyTokenRaw(token: any) {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!);
  } catch (err) {
    return null;
  }
}

export function generateJWT(user: any) {
  var today = new Date();
  var exp = new Date(today);
  exp.setDate(today.getDate() + 60);

  return sign({
    id: user.id,
    username: user.username,
    email: user.email,
    exp: exp.getTime() / 1000,
  });
}

export function toAuthJSON(user: any) {
  return {
    username: user.username,
    email: user.email,
    token: generateJWT(user),
    bio: user.bio,
    image: user.image,
  };
}
