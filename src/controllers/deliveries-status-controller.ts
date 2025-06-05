import { prisma } from "@/database/prisma";
import { Request, Response } from "express";
import * as z from "zod";

class DeliveriesStatusController {
  async update(req: Request, res: Response) {
    const paramsSchema = z.object({
      id: z.string().uuid(),
    });

    const bodySchema = z.object({
      status: z.enum(["processing", "shipped", "delivered"]),
    });

    const { id } = paramsSchema.parse(req.params);
    const { status } = bodySchema.parse(req.body);

    await prisma.delivery.update({
      where: { id },
      data: { status },
    });

    res.json();
  }
}

export { DeliveriesStatusController };
