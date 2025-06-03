import { sign } from "jsonwebtoken";
import { authConfig } from "@/config/auth";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { compare } from "bcrypt";
import { Request, Response } from "express";
import * as z from "zod";

class SessionsController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      email: z
        .string()
        .trim()
        .email({ message: "Informe um email válido" })
        .toLowerCase(),
      password: z.string().min(6),
    });

    const { email, password } = bodySchema.parse(req.body);

    const user = await prisma.user.findFirst({ where: { email } });

    if (!user) {
      throw new AppError("Usuário ou senha incorretos", 401);
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new AppError("Usuário ou senha incorretos", 401);
    }

    const { secret, expiresIn } = authConfig.jwt;

    const token = sign({ role: user.role }, secret, {
      subject: user.id,
      expiresIn,
    });

    const { password: _, ...userWithoutPassword } = user;

    res.json({ token, user: userWithoutPassword });
  }
}

export { SessionsController };
