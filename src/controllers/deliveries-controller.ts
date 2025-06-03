import { prisma } from "@/database/prisma";
import { Request, Response } from "express";

import * as z from "zod";

class DeliveriesController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      user_id: z.string().uuid(),
      description: z.string(),
    });

    const { user_id, description } = bodySchema.parse(req.body);

    await prisma.delivery.create({
      data: {
        userId: user_id,
        description,
      },
    });

    res.status(201).json();
  }
}

export { DeliveriesController };
