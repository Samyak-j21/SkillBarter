import crypto from "crypto";

/**
 * Hashes a plain text password with a unique salt.
 * Returns the hex-encoded salt and hashed password.
 */
export function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return { salt, hash };
}

/**
 * Verifies a plain text password against a saved salt and hash.
 */
export function verifyPassword(password, salt, savedHash) {
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
  return hash === savedHash;
}
