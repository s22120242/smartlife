import dotenv from "dotenv";
dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET no definido en variables de entorno");
}

export const config = {
  port: parseInt(process.env.PORT || "3001"),
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "*",
  bcryptRounds: parseInt(process.env.BCRYPT_ROUNDS || "12"),
};
