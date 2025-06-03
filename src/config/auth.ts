import { env } from "@/env";

export const authConfig = {
  jwt: {
    secret: env.JWT_SECRET as string,
    expiresIn: "1d" as const,
  },
};
