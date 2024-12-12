interface Config {
  baseUrl: string;
}

const checkConfig = (server: string): Config | undefined => {
  let config: Config | undefined;
  switch (server) {
    case "production":
      config = {
        baseUrl: "http://localhost:8000",
      };
      break;
    case "local":
      config = {
        baseUrl: "http://localhost:8000",
      };
      break;
    default:
      console.error(`Server environment ${server} is not recognized.`);
      return undefined; // Retorna undefined si el servidor no es reconocido
  }
  return config;
};

export const selectServer = "production"; // Aquí puedes cambiar a "local" si es necesario
export const config = checkConfig(selectServer);

if (!config) {
  console.error("Configuration could not be loaded. Exiting...");
  // Aquí puedes manejar el error o detener la ejecución si no se carga la configuración
} else {
  console.log(`API base URL: ${config.baseUrl}`);
}
