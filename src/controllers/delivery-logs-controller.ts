import { prisma } from "@/database/prisma";
import { AppError } from "@/utils/AppError";
import { Request, Response } from "express";
import z from "zod";

class DeliveryLogsController {
  async create(req: Request, res: Response) {
    const bodySchema = z.object({
      delivery_id: z.string().uuid(),
      description: z.string(),
    });

    const { delivery_id, description } = bodySchema.parse(req.body);

    const delivery = await prisma.delivery.findUnique({
      where: { id: delivery_id },
    });

    if (!delivery) {
      throw new AppError("delivery not found", 404);
    }

    if (delivery.status === "delivered") {
      throw new AppError("delivery already delivered");
    }

    if (delivery.status === "processing") {
      throw new AppError("change status to shipped");
    }

    await prisma.deliveryLog.create({
      data: {
        deliveryId: delivery_id,
        description,
      },
    });

    res.status(201).json();
  }

  async show(req: Request, res: Response) {
    const paramsSchema = z.object({
      delivery_id: z.string().uuid(),
    });

    const { delivery_id } = paramsSchema.parse(req.params);

    const delivery = await prisma.delivery.findUnique({
      where: { id: delivery_id },
      include: { user: true, logs: true },
    });

    if (req.user?.role === "customer" && delivery?.userId !== req.user.id) {
      throw new AppError("the user can only view their deliveries", 401);
    }

    res.json(delivery);
  }
}

export { DeliveryLogsController };
