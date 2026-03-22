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
    baseUrl: "",
    apiPrefix: "/api",
  },
};

export type ServerEnv = keyof typeof configs;

const forceProductionApi = import.meta.env.VITE_FORCE_PRODUCTION_API === "true";

// In dev, use local API by default. Production can be forced for testing.
export const selectServer: ServerEnv = import.meta.env.DEV
  ? (forceProductionApi ? "production" : "local")
  : "production";


export const config: Config = configs[selectServer];
