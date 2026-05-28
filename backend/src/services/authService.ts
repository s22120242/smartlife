import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { prisma } from "../utils/prisma";
import { config } from "../config";

function generateAccessToken(userId: string, role: string = "USER"): string {
  return jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: config.jwtExpiresIn } as jwt.SignOptions);
}

function generateRefreshToken(): string {
  return crypto.randomUUID();
}

export const authService = {
  async register(name: string, email: string, password: string) {
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new Error("El email ya está registrado");
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const refreshToken = generateRefreshToken();
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword, refreshToken },
    });

    const token = generateAccessToken(user.id, user.role);

    return {
      token,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  },

  async login(email: string, password: string) {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      throw new Error("Credenciales inválidas");
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      throw new Error("Credenciales inválidas");
    }

    const refreshToken = generateRefreshToken();
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });
    const token = generateAccessToken(user.id, user.role);

    return {
      token,
      refreshToken,
      user: { id: user.id, name: user.name, email: user.email, role: user.role },
    };
  },

  async refreshToken(token: string) {
    const user = await prisma.user.findFirst({ where: { refreshToken: token } });
    if (!user) throw new Error("Refresh token inválido");

    const newRefreshToken = generateRefreshToken();
    await prisma.user.update({ where: { id: user.id }, data: { refreshToken: newRefreshToken } });
    const newToken = generateAccessToken(user.id, user.role);

    return { token: newToken, refreshToken: newRefreshToken };
  },

  async logout(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { refreshToken: null },
    });
  },

  async changePassword(userId: string, currentPassword: string, newPassword: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new Error("Usuario no encontrado");

    const valid = await bcrypt.compare(currentPassword, user.password);
    if (!valid) throw new Error("Contraseña actual incorrecta");

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword, refreshToken: null },
    });
  },

  async deleteAccount(userId: string) {
    await prisma.user.delete({ where: { id: userId } });
  },

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true, role: true, profileImage: true },
    });
    if (!user) throw new Error("Usuario no encontrado");
    return user;
  },

  async updateProfile(userId: string, data: { name?: string; profileImage?: string }) {
    const user = await prisma.user.update({
      where: { id: userId },
      data,
      select: { id: true, name: true, email: true, role: true, profileImage: true },
    });
    return user;
  },
};
