import fs from 'fs';
import crypto from 'crypto';

/**
 * Calculates SHA-256 hash of a file synchronously.
 */
export function calculateSha256(filePath: string): string | null {
  if (!fs.existsSync(filePath)) return null;
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(buffer).digest('hex');
}
