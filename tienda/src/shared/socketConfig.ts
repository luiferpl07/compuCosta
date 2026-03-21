// shared/socketConfig.ts

export const SOCKET_URL = import.meta.env.PROD
  ? "https://admin.compucosta.com"
  : "http://localhost:3001"; // o la IP local
