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
        baseUrl: "http://127.0.0.1:3000",
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

export const selectServer: "production" | "local" = "local";
export const config = checkConfig(selectServer);