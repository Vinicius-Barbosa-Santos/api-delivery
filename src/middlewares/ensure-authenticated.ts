import { authConfig } from "@/config/auth";
import { AppError } from "@/utils/AppError";
import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

interface TokenPayload {
  role: string;
  sub: string;
}

export const ensureAuthenticated = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError("JWT token is missing", 401);
    }

    const [, token] = authHeader.split(" ");

    const { role, sub: user_id } = verify(
      token,
      authConfig.jwt.secret,
    ) as TokenPayload;

    req.user = {
      id: user_id,
      role,
    };

    return next();
  } catch (error) {
    throw new AppError("Invalid JWT token", 401);
  }
};
