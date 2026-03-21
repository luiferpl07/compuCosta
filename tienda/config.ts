// config.ts
interface Config {
  baseUrl: string;
  apiPrefix: string;
}

const configs: Record<"production" | "local", Config> = {
  production: {
    baseUrl: "https://admin.compucosta.com",
    apiPrefix: "/api",
  },
  local: {
    baseUrl: "http://localhost:3000",
    apiPrefix: "/api",
  },
};

export type ServerEnv = keyof typeof configs;

export const selectServer: ServerEnv = import.meta.env.DEV ? "local" : "production";


export const config: Config = configs[selectServer];
