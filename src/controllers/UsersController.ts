import { Request, Response } from "express";
import { z } from "zod";
import { hash } from "bcrypt";
import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";

class UsersController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      name: z.string().trim().min(2, "Informe seu nome"),
      email: z
        .string()
        .trim()
        .email({ message: "Informe um email válido" })
        .toLowerCase(),
      password: z.string().min(6, "A senha deve ter no mínimo 6 caracteres"),
    });

    const { name, email, password } = bodySchema.parse(req.body);

    const userAlreadyExists = await prisma.user.findFirst({ where: { email } });

    if (userAlreadyExists) {
      throw new AppError("Usuário já cadastrado");
    }

    const passwordHash = await hash(password, 8);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: passwordHash,
      },
    });

    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json(userWithoutPassword);
  }
}

export { UsersController };
