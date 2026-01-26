import request from "supertest";

/* =======================
   MOCKS
======================= */

const createdEmails = new Set<string>();

const mockUser = (overrides: Partial<User> = {}) => ({
  id: "mock-user-id",
  name: "User",
  email: "user@example.com",
  password: "hashed",
  role: "customer",
  createdAt: new Date(),
  updatedAt: new Date(),
  ...overrides,
});

jest.mock("@/database/prisma", () => ({
  prisma: {
    user: {
      findFirst: jest.fn(async ({ where } = {}) => {
        if (where?.email && createdEmails.has(where.email)) {
          return mockUser({ email: where.email });
        }
        return null;
      }),

      create: jest.fn(async ({ data } = {}) => {
        if (data?.email) createdEmails.add(data.email);
        return mockUser(data);
      }),

      delete: jest.fn(async () => ({})),
    },
  },
}));

jest.mock("bcrypt", () => ({
  hash: jest.fn().mockResolvedValue("hashed"),
  compare: jest.fn().mockResolvedValue(true),
}));

/* =======================
   APP / DEPS
======================= */

import { app } from "@/app";
import { User } from "@prisma/client";

/* =======================
   TESTS
======================= */

describe("UserController", () => {
  it("should create a user", async () => {
    const uniqueEmail = `user+${Date.now()}@example.com`;

    const response = await request(app).post("/users").send({
      name: "User",
      email: uniqueEmail,
      password: "123456",
    });

    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty("id");
    expect(response.body.name).toBe("User");
  });

  it("should not create a user with existing email", async () => {
    const uniqueEmail = `user+${Date.now()}@example.com`;

    await request(app).post("/users").send({
      name: "User",
      email: uniqueEmail,
      password: "123456",
    });

    const response = await request(app).post("/users").send({
      name: "Duplicate User",
      email: uniqueEmail,
      password: "123456",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("Usuário já cadastrado");
  });

  it("should throw a validation error if email is invalid", async () => {
    const response = await request(app).post("/users").send({
      name: "User",
      email: "",
      password: "123456",
    });

    expect(response.status).toBe(400);
    expect(response.body.message).toBe("validation error");
  });
});
