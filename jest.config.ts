import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/src"],
  testMatch: ["**/tests/**/*.test.ts"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFiles: ["dotenv/config"],
  globals: {
    "ts-jest": {
      tsconfig: {
        module: "commonjs",
      },
    },
  },
};

export default config;
