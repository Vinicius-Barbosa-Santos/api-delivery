import request from "supertest";
import { prisma } from "@/database/prisma";

import { app } from "@/app";

describe("UserController", () => {
  let user_id: string;

  afterAll(async () => {
    if (user_id) {
      await prisma.user.delete({
        where: {
          id: user_id,
        },
      });
    }
  });

  it("should create a user", async () => {
    const uniqueEmail = `john.doe+${Date.now()}@example.com`;
    const response = await request(app).post("/users").send({
      name: "John Doe",
      email: uniqueEmail,
      password: "123456",
    });
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("John Doe");

    user_id = response.body.id;
  });

  it("should not create a user with existing email", async () => {
    const uniqueEmail = `john.doe+${Date.now()}@example.com`;
    await request(app).post("/users").send({
      name: "John Doe",
      email: uniqueEmail,
      password: "123456",
    });

    const response = await request(app).post("/users").send({
      name: "Duplicate John Doe",
      email: uniqueEmail,
      password: "123456",
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Usuário já cadastrado");
  });

  it("should throw a validation error if email is invalid", async () => {
    const response = await request(app).post("/users").send({
      name: "John Doe",
      email: "",
      password: "123456",
    });
    expect(response.status).toBe(400);
    expect(response.body.message).toBe("validation error");
  });
});
