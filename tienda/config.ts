// config.ts
interface Config {
  baseUrl: string;
  apiPrefix: string;
}

const checkConfig = (server: "production" | "local"): Config | undefined => {
  let config: Config | undefined;
  switch (server) {
    case "production":
      config = {
        baseUrl: "https://mlfd3wml-3000.use2.devtunnels.ms",
        apiPrefix: "/api"
      };
      break;
    case "local":
      config = {
        baseUrl: "http://localhost:3000",
        apiPrefix: "/api"
      };
      break;
    default:
      console.error(`Server environment ${server} is not recognized.`);
      return undefined;
  }
  return config;
};

export const selectServer: "production" | "local" = "production";
export const config: Config = checkConfig(selectServer) ?? {
  baseUrl: "https://mlfd3wml-3000.use2.devtunnels.ms",
  apiPrefix: "/api",
};
