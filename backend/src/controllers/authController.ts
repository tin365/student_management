import type { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt, { type SignOptions } from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';

import User from '../models/User.js';

const getEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required env var: ${key}`);
  }
  return value;
};

const hashToken = (rawToken: string): string => {
  // SHA-256 hash: deterministic so we can verify by re-hashing on submit.
  return crypto.createHash('sha256').update(rawToken).digest('hex');
};

const issueToken = (userId: string) => {
  const secret = getEnv('JWT_SECRET');
  const expiresIn = (process.env.JWT_EXPIRES_IN || '7d') as SignOptions['expiresIn'];
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body as { name?: string; email?: string; password?: string };

    if (!name?.trim() || !email?.trim() || !password) {
      return res.status(400).json({ message: 'Name, email, and password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
    });

    const token = issueToken(user._id.toString());

    return res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    return res.status(400).json({ message: 'Bad Request', error });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email?.trim() || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = issueToken(user._id.toString());

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });
  } catch (error) {
    return res.status(400).json({ message: 'Bad Request', error });
  }
};

export const forgotPassword = async (req: Request, res: Response) => {
  try {
    const { email } = req.body as { email?: string };
    if (!email?.trim()) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail });

    // Always respond the same to avoid leaking whether an email exists.
    if (!user) {
      return res.json({ message: 'If an account exists, we sent a reset link.' });
    }

    const rawToken = crypto.randomBytes(32).toString('hex');
    const passwordResetTokenHash = hashToken(rawToken);
    const passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.passwordResetTokenHash = passwordResetTokenHash;
    user.passwordResetExpires = passwordResetExpires;
    await user.save();

    // Required SMTP + base URL for reset link.
    const SMTP_HOST = getEnv('SMTP_HOST');
    const SMTP_PORT = Number(process.env.SMTP_PORT || '587');
    const SMTP_SECURE = (process.env.SMTP_SECURE || 'false').toLowerCase() === 'true';
    const SMTP_USER = getEnv('SMTP_USER');
    const SMTP_PASS = getEnv('SMTP_PASS');
    const MAIL_FROM = getEnv('MAIL_FROM');
    const PASSWORD_RESET_BASE_URL = getEnv('PASSWORD_RESET_BASE_URL');

    const transporter = nodemailer.createTransport({
      host: SMTP_HOST,
      port: SMTP_PORT,
      secure: SMTP_SECURE,
      auth: { user: SMTP_USER, pass: SMTP_PASS },
    });

    const resetUrl = `${PASSWORD_RESET_BASE_URL}/auth/reset-password?token=${encodeURIComponent(rawToken)}`;

    await transporter.sendMail({
      from: MAIL_FROM,
      to: user.email,
      subject: 'Khai password reset',
      text: `Hi ${user.name},\n\nReset your password using this link:\n${resetUrl}\n\nThis link expires in 1 hour.\n\nIf you didn't request this, you can ignore this email.`,
      html: `<p>Hi ${user.name},</p>
        <p>Reset your password using this link:</p>
        <p><a href="${resetUrl}">${resetUrl}</a></p>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, you can ignore this email.</p>`,
    });

    return res.json({ message: 'If an account exists, we sent a reset link.' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to send reset email', error });
  }
};

export const resetPassword = async (req: Request, res: Response) => {
  try {
    const { token, password } = req.body as { token?: string; password?: string };
    if (!token?.trim() || !password) {
      return res.status(400).json({ message: 'Token and new password are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters' });
    }

    const tokenHash = hashToken(token.trim());
    const user = await User.findOne({
      passwordResetTokenHash: tokenHash,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    user.passwordHash = await bcrypt.hash(password, 10);
    user.passwordResetTokenHash = null;
    user.passwordResetExpires = null;
    await user.save();

    return res.json({ message: 'Password reset successful' });
  } catch (error) {
    return res.status(400).json({ message: 'Bad Request', error });
  }
};

