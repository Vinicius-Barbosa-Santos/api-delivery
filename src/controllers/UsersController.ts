import { Request, Response } from "express";

class UsersController {
  async create(req: Request, res: Response) {
    res.json({ message: "OK" });
  }
}

export { UsersController };
