import jwt from "jsonwebtoken";
import type { Response } from "express";
import AppError from "../errors/AppError.js";

const generateToken = (res: Response, userId: string) => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new AppError("JWT secret is not defined", 500);
  }
  const token = jwt.sign({ userId: userId.toString() }, secret, {
    expiresIn: "7d",
  });

  res.cookie("access_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 1000 * 60 * 60 * 24 * 7,
  });

  return token;
};

export default generateToken;
