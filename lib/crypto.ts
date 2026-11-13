import {
  createHmac,
  timingSafeEqual,
  scrypt as scryptCallback,
} from "node:crypto";
import { promisify } from "node:util";
const scrypt = promisify(scryptCallback);
export const SESSION_SECONDS = 8 * 60 * 60;
export function configured() {
  return (
    (process.env.SESSION_SECRET?.length || 0) >= 48 &&
    /^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/.test(
      process.env.ADMIN_PASSWORD_HASH || "",
    )
  );
}

function secret() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 48) throw new Error("AUTH_NOT_CONFIGURED");
  return s;
}
export function sign(value: string) {
  return createHmac("sha256", secret()).update(value).digest("base64url");
}
export function seal(payload: object) {
  const value = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return value + "." + sign(value);
}
export function unseal(token: string): Record<string, unknown> | null {
  try {
    if (token.length > 2048) return null;
    const [value, sig, ...rest] = token.split(".");
    if (rest.length || !value || !sig) return null;
    const expected = Buffer.from(sign(value));
    const given = Buffer.from(sig);
    if (given.length !== expected.length || !timingSafeEqual(given, expected))
      return null;
    const data = JSON.parse(Buffer.from(value, "base64url").toString());
    if (typeof data.exp !== "number" || data.exp < Date.now()) return null;
    return data;
  } catch {
    return null;
  }
}
export async function verifyPassword(password: string) {
  const hash = process.env.ADMIN_PASSWORD_HASH || "";
  const [scheme, salt, hex] = hash.split("$");
  if (scheme !== "scrypt" || !salt || !hex) return false;
  const actual = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(hex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
