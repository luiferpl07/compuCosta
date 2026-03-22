// shared/socketConfig.ts

export const SOCKET_URL = import.meta.env.PROD
  ? "https://admin.compucosta.com"
  : window.location.origin;
