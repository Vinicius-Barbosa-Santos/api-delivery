import request from "supertest";

/* =======================
   MOCKS
======================= */

const createdEmails = new Set<string>();

const mockUser = (overrides: Partial<User> = {}) => ({
  id: "mock-user-id",
  name: "Auth User",
  email: "auth@example.com",
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
import { prisma } from "@/database/prisma";
import { User } from "@prisma/client";

/* =======================
   TESTS
======================= */

describe("SessionsController", () => {
  it("should authenticate a user and return access token", async () => {
    const uniqueEmail = `auth+${Date.now()}@example.com`;

    const userResponse = await request(app).post("/users").send({
      name: "Auth User",
      email: uniqueEmail,
      password: "123456",
    });

    const response = await request(app).post("/sessions").send({
      email: uniqueEmail,
      password: "123456",
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toEqual(expect.any(String));
  });
});
