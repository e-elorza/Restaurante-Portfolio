import bcrypt from "bcryptjs";

const ROUNDS = 12;

export const PASSWORD_MIN_LENGTH = 8;

export async function hashPassword(plain: string): Promise<string> {
  if (plain.length < PASSWORD_MIN_LENGTH) {
    throw new Error(
      `A senha precisa ter pelo menos ${PASSWORD_MIN_LENGTH} caracteres.`,
    );
  }
  return bcrypt.hash(plain, ROUNDS);
}

export async function verifyPassword(
  plain: string,
  hash: string,
): Promise<boolean> {
  if (!plain || !hash) return false;
  try {
    return await bcrypt.compare(plain, hash);
  } catch {
    return false;
  }
}
