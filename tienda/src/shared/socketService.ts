import { Socket } from "socket.io-client";

export const EVENTS = {
  JOIN_CHAT: "join-chat",
  JOIN_ADMIN: "join-admin",
  CLIENT_MESSAGE: "client-message",
  ADMIN_MESSAGE: "admin-message",
  NEW_MESSAGE: "new-message",
};

export const emitClientMessage = (socket: Socket, idChat: string, texto: string, nombreUsuario: string) => {
  // Verificar si el socket está conectado
  if (!socket || !socket.connected) {
    console.error("Socket no conectado. No se puede enviar mensaje.");
    return Promise.reject(new Error("Socket no conectado"));
  }

  const messageData = {
    idChat,
    texto,
    nombreUsuario,
    creado: new Date(),
    esAdmin: false,
  };
  
  console.log("Emitiendo mensaje de cliente:", messageData);
  socket.emit(EVENTS.CLIENT_MESSAGE, messageData);
  
  // Devolver Promise inmediatamente sin esperar confirmación
  // Esto evita bloqueos en la UI mientras se espera respuesta
  return Promise.resolve(messageData);
};

// Emitir mensaje del administrador
export const emitAdminMessage = (socket: Socket, idChat: string, texto: string) => {
  // Verificar si el socket está conectado
  if (!socket || !socket.connected) {
    console.error("Socket no conectado. No se puede enviar mensaje de administrador.");
    return Promise.reject(new Error("Socket no conectado"));
  }

  const messageData = {
    idChat,
    texto,
    creado: new Date(),
    esAdmin: true,
  };
  
  console.log("Emitiendo mensaje de administrador:", messageData);
  socket.emit(EVENTS.ADMIN_MESSAGE, messageData);
  
  // Devolver Promise inmediatamente sin esperar confirmación
  return Promise.resolve(messageData);
};

// Configurar escucha de mensajes
export const setupMessageListener = (socket: Socket, callback: (data: any) => void) => {
  // Remover listener anterior si existe para evitar duplicados
  socket.off(EVENTS.NEW_MESSAGE); 
  
  // Añadir nuevo listener
  socket.on(EVENTS.NEW_MESSAGE, (data) => {
    console.log("📩 Mensaje recibido en listener:", data);
    callback(data);
  });
  
  // Devolver una función para limpiar el listener
  return () => {
    socket.off(EVENTS.NEW_MESSAGE);
  };
};

// Verificar estado de conexión del socket
export const isSocketConnected = (socket: Socket | null): boolean => {
  return !!socket && socket.connected;
};

// Función de reconexión
export const reconnectSocket = (socket: Socket | null): Promise<Socket> => {
  return new Promise((resolve, reject) => {
    if (!socket) {
      reject(new Error("No hay socket para reconectar"));
      return;
    }
    
    // Si ya está conectado, resolver inmediatamente
    if (socket.connected) {
      resolve(socket);
      return;
    }
    
    // Establecer listeners antes de intentar la reconexión
    const onConnect = () => {
      console.log("Socket reconectado exitosamente");
      socket.off('connect', onConnect);
      socket.off('connect_error', onError);
      clearTimeout(timeoutId);
      resolve(socket);
    };
    
    const onError = (error: any) => {
      console.error("Error al reconectar:", error);
    };
    
    socket.once('connect', onConnect);
    socket.on('connect_error', onError);
    
    // Intentar reconexión
    socket.connect();
    
    // Timeout para la reconexión
    const timeoutId = setTimeout(() => {
      socket.off('connect', onConnect);
      socket.off('connect_error', onError);
      if (!socket.connected) {
        reject(new Error("Timeout en reconexión de socket"));
      }
    }, 5000);
  });
};