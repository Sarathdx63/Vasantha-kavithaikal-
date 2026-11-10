import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { db } from './db';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'vasantham-kavithaigal-super-secure-key-2026';

export interface AdminPayload {
  id: number;
  username: string;
}

export function generateAdminToken(admin: AdminPayload): string {
  return jwt.sign(admin, JWT_SECRET, { expiresIn: '24h' });
}

export function verifyAdminToken(token: string): AdminPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminPayload;
  } catch {
    return null;
  }
}

export function verifyAdminCredentials(username: string, passwordPlain: string): AdminPayload | null {
  if (!username || !passwordPlain) return null;
  const adminRow = db.prepare('SELECT id, username, password_hash FROM admins WHERE username = ?').get(username) as {
    id: number;
    username: string;
    password_hash: string;
  } | undefined;

  if (!adminRow) return null;

  const isMatch = bcrypt.compareSync(passwordPlain, adminRow.password_hash);
  if (!isMatch) return null;

  return {
    id: adminRow.id,
    username: adminRow.username,
  };
}

// Express Auth Middleware
export function requireAdminAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'அங்கீகரிக்கப்படாத அணுகல் (Unauthorized - Admin token required)' });
  }

  const token = authHeader.split(' ')[1];
  const payload = verifyAdminToken(token);
  if (!payload) {
    return res.status(401).json({ error: 'தவறான அல்லது காலாவதியான அனுமதிச்சீட்டு (Invalid or expired token)' });
  }

  (req as any).admin = payload;
  next();
}
