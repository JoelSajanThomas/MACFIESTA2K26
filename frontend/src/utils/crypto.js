/**
 * Client-side cryptographic helper.
 * Passwords must never be hashed on the client.
 * Django's server-side PBKDF2 hasher manages standard credential hashing and salting.
 */

export async function hashPassword(plain) {
  return plain;
}

