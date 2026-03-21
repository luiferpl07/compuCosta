import { io, Socket } from "socket.io-client";
import { SOCKET_URL } from "./socketConfig";
import { config } from "../../config"; // Asegúrate de que la ruta es correcta

// 🔌 Crear socket conectado al servidor
export const createSocket = (): Socket => {
  return io(SOCKET_URL, {
    path: "/socket.io/",
    transports: ["websocket"],
    withCredentials: true,
  });
};

// 🎯 Eventos que usaremos
export const EVENTS = {
  JOIN_CHAT: "join-chat",
  JOIN_ADMIN: "join-admin",
  CLIENT_MESSAGE: "client-message",
  ADMIN_MESSAGE: "admin-message",
  NEW_MESSAGE: "new-message",
};

// 📤 Emitir mensaje de cliente y guardarlo
export const emitClientMessage = async (
  socket: Socket,
  idChat: string,
  texto: string,
  nombreUsuario: string
): Promise<any> => {
  try {
    const response = await fetch(`${config.baseUrl}${config.apiPrefix}/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        idChat,
        texto,
        nombreUsuario,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'No se pudo guardar el mensaje');
    }

    const savedMessage = await response.json();

    // Emitir mensaje por socket
    if (socket && socket.connected) {
      socket.emit(EVENTS.CLIENT_MESSAGE, {
        idChat,
        texto: savedMessage.mensaje.texto,
        nombreUsuario,
        creado: savedMessage.mensaje.creado,
        esAdmin: false,
      });
    }

    return savedMessage.mensaje; // ✅ CORREGIDO

  } catch (error) {
    console.error("❌ Error al guardar/enviar mensaje:", error);
    throw error;
  }
};

// 📤 Emitir mensaje del admin (sin cambios)
export const emitAdminMessage = (
  socket: Socket,
  idChat: string,
  texto: string
): Promise<any> => {
  if (!socket || !socket.connected) {
    console.error("❌ Socket no conectado.");
    return Promise.reject(new Error("Socket no conectado"));
  }

  const messageData = {
    idChat,
    texto,
    creado: new Date(),
    esAdmin: true,
  };

  console.log("📤 Admin envía mensaje:", messageData);
  socket.emit(EVENTS.ADMIN_MESSAGE, messageData);

  return Promise.resolve(messageData);
};

// 📥 Escuchar nuevos mensajes
export const setupMessageListener = (
  socket: Socket,
  callback: (data: any) => void
) => {
  socket.off(EVENTS.NEW_MESSAGE); // evitar duplicados
  socket.on(EVENTS.NEW_MESSAGE, (data) => {
    console.log("📩 Mensaje recibido:", data);
    callback(data);
  });

  return () => socket.off(EVENTS.NEW_MESSAGE);
};

// ✅ Verificar estado de conexión
export const isSocketConnected = (socket: Socket | null): boolean => {
  return !!socket && socket.connected;
};

// 🔁 Intentar reconectar
export const reconnectSocket = (socket: Socket | null): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error("No hay socket para reconectar"));
      return;
    }

    if (socket.connected) {
      resolve(socket);
      return;
    }

    const onConnect = () => {
      console.log("✅ Socket reconectado");
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
      clearTimeout(timeoutId);
      resolve(socket);
    };

    const onError = (error: any) => {
      console.error("❌ Error al reconectar:", error);
    };

    socket.once("connect", onConnect);
    socket.on("connect_error", onError);
    socket.connect();

    const timeoutId = setTimeout(() => {
      socket.off("connect", onConnect);
      socket.off("connect_error", onError);
      if (!socket.connected) {
        reject(new Error("⏱ Timeout reconexión socket"));
      }
    }, 5000);
  });
};
