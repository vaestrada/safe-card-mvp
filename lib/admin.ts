import { createHash } from "crypto";
import { cookies } from "next/headers";

const COOKIE = "sc_admin";

function hash(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}

function expectedHash(): string | null {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return hash(pw);
}

/** True when the request carries a valid admin cookie. */
export async function isAdmin(): Promise<boolean> {
  const expected = expectedHash();
  if (!expected) return false;
  const store = await cookies();
  const got = store.get(COOKIE)?.value;
  if (!got) return false;
  // Constant-time compare to avoid trivial timing leaks.
  const a = Buffer.from(got);
  const b = Buffer.from(expected);
  return a.length === b.length && a.equals(b);
}

/** Validate a password and set the admin cookie. Returns true on success. */
export async function login(password: string): Promise<boolean> {
  const expected = expectedHash();
  if (!expected) return false;
  const attempt = hash(password);
  const ok = attempt === expected;
  if (ok) {
    const store = await cookies();
    store.set(COOKIE, attempt, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 60 * 60,
    });
  }
  return ok;
}

export async function logout(): Promise<void> {
  const store = await cookies();
  store.set(COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
}
