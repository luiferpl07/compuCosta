import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Bot, User, MessageCircle, Bell, X, Phone } from 'lucide-react';
import { config } from "../../config";
import { io, Socket } from 'socket.io-client';
import { EVENTS, setupMessageListener } from "../shared/socketService";

interface Message {
  texto: string;
  esAdmin: boolean;
  creado: Date;
  leido?: boolean;
}

interface UserInfo {
  nombre: string;
  telefono: string;
}

function ChatBot() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [userInfo, setUserInfo] = useState<UserInfo>({ nombre: '', telefono: '' });
  const [formStep, setFormStep] = useState<'nombre' | 'telefono' | 'chat'>('nombre');
  const [idChat, setIdChat] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [reconnectAttempts, setReconnectAttempts] = useState(0);
  const [inputDisabled, setInputDisabled] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const reconnectInterval = useRef<NodeJS.Timeout | null>(null);
  const cleanupListenerRef = useRef<(() => void) | null>(null);

  // Handler para mensajes nuevos
  const handleNewMessage = useCallback((data: any) => {
    console.log("🔔 Mensaje recibido (handler):", data);
    
    if (data && typeof data === 'object' && data.texto) {
      const newMessage: Message = {
        texto: data.texto,
        esAdmin: data.esAdmin !== undefined ? Boolean(data.esAdmin) : true,
        creado: new Date(data.creado || Date.now()),
        leido: isOpen
      };
      
      setMessages(prevMessages => [...prevMessages, newMessage]);
      
      // Incrementar contador solo si el chat está cerrado y es un mensaje del admin
      if (!isOpen && data.esAdmin) {
        setUnreadCount(prev => prev + 1);
      }
    }
  }, [isOpen]);

  // Función para conectar el socket
  const connectSocket = useCallback(() => {
    try {
      console.log("Intentando conectar al servidor WebSocket...");
      setIsConnecting(true);
      
      // Limpiar socket existente
      if (socketRef.current) {
        if (cleanupListenerRef.current) {
          cleanupListenerRef.current();
          cleanupListenerRef.current = null;
        }
        
        socketRef.current.off('connect');
        socketRef.current.off('disconnect');
        socketRef.current.off('connect_error');
        
        if (socketRef.current.connected) {
          socketRef.current.disconnect();
        }
      }
      
      // Crear nueva conexión con opciones robustas
      socketRef.current = io(config.baseUrl, {
        path: "/socket.io/",
        transports: ["websocket", "polling"],
        withCredentials: true,
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        timeout: 20000,
        autoConnect: true
      });

      // Configurar eventos del socket
      if (socketRef.current) {
        // Evento de conexión
        socketRef.current.on('connect', () => {
          console.log("✅ Socket conectado exitosamente: ", socketRef.current?.id);
          setIsConnected(true);
          setIsConnecting(false);
          setReconnectAttempts(0);
          
          // Limpiar el intervalo de reconexión si existe
          if (reconnectInterval.current) {
            clearInterval(reconnectInterval.current);
            reconnectInterval.current = null;
          }
          
          // Si ya tenemos un ID de chat, unirnos a la sala
          if (idChat) {
            console.log(`Uniendo al chat ${idChat}...`);
            socketRef.current?.emit(EVENTS.JOIN_CHAT, idChat);
          }
        });
        
        // Evento de desconexión
        socketRef.current.on('disconnect', (reason) => {
          console.log(`Socket desconectado: ${reason}`);
          setIsConnected(false);
        });
        
        // Evento de error de conexión
        socketRef.current.on('connect_error', (error) => {
          console.error("Error de conexión socket:", error);
          setIsConnected(false);
          setIsConnecting(false);
          setReconnectAttempts(prev => prev + 1);
        });
        
        // Configurar listener para mensajes nuevos
        cleanupListenerRef.current = setupMessageListener(socketRef.current, handleNewMessage);
      }
    } catch (error) {
      console.error("Error al inicializar el socket:", error);
      setIsConnected(false);
      setIsConnecting(false);
      setReconnectAttempts(prev => prev + 1);
    }
  }, [idChat, handleNewMessage]);

  // Inicializar WebSocket al cargar el componente
  useEffect(() => {
    // Comprobar si hay datos guardados
    const storedChatId = localStorage.getItem('idChat');
    if (storedChatId) {
      setIdChat(storedChatId);
    }
    
    const storedName = localStorage.getItem('chatUserName');
    const storedPhone = localStorage.getItem('chatUserPhone');
    
    if (storedName && storedPhone) {
      setUserInfo({
        nombre: storedName,
        telefono: storedPhone
      });
      setFormStep('chat');
    }

    // Conectar el socket
    connectSocket();
    
    // Reconexión manual cada 30 segundos si está desconectado
    reconnectInterval.current = setInterval(() => {
      if (socketRef.current && !socketRef.current.connected && !isConnecting) {
        console.log("Intentando reconexión periódica...");
        connectSocket();
      }
    }, 30000);
    
    // Habilitar la entrada de texto
    setInputDisabled(false);
    
    // Limpiar al desmontar
    return () => {
      if (cleanupListenerRef.current) {
        cleanupListenerRef.current();
        cleanupListenerRef.current = null;
      }
      
      if (socketRef.current) {
        socketRef.current.disconnect();
        socketRef.current = null;
      }
      
      if (reconnectInterval.current) {
        clearInterval(reconnectInterval.current);
        reconnectInterval.current = null;
      }
    };
  }, [connectSocket]);
  
  // Unirse a la sala de chat cuando cambia el ID
  useEffect(() => {
    if (idChat && socketRef.current && socketRef.current.connected) {
      console.log(`Uniendo al chat ${idChat}...`);
      socketRef.current.emit(EVENTS.JOIN_CHAT, idChat);
    }
  }, [idChat, isConnected]);

  // Auto-scroll al último mensaje
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Cargar mensajes anteriores si hay un chatId
  useEffect(() => {
    if (idChat) {
      fetchPreviousMessages();
    }
  }, [idChat]);

  // Inicializar con mensaje de bienvenida
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      let welcomeMessage = "";
      
      switch (formStep) {
        case 'nombre':
          welcomeMessage = "¡Hola! 👋 Para poder ayudarte mejor, ¿podrías decirme tu nombre?";
          break;
        case 'telefono':
          welcomeMessage = `¡Gracias ${userInfo.nombre}! 🙂 ¿Podrías proporcionarme tu número de teléfono para contactarte si es necesario?`;
          break;
        case 'chat':
          welcomeMessage = `¡Bienvenido(a) de nuevo, ${userInfo.nombre}! 😊 ¿En qué puedo ayudarte hoy?`;
          break;
      }
      
      setMessages([
        {
          texto: welcomeMessage,
          esAdmin: true,
          creado: new Date(),
          leido: true
        }
      ]);
    }
  }, [isOpen, formStep, userInfo.nombre, messages.length]);
  
  // Enfocar el input cuando se abre el chat
  useEffect(() => {
    if (isOpen) {
      // Usar setTimeout para dar tiempo al DOM a renderizarse
      setTimeout(() => {
        const inputElement = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (inputElement) {
          inputElement.focus();
        }
      }, 100);
    }
  }, [isOpen, formStep]);

  const fetchPreviousMessages = async () => {
    if (!idChat) {
      console.error("❌ No hay chatId seleccionado");
      return;
    }
  
    try {
      console.log(`Obteniendo mensajes anteriores para el chat ${idChat}...`);
      const response = await fetch(`${config?.baseUrl}${config?.apiPrefix}/chat?idChat=${idChat}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const data = await response.json();
      console.log("✅ Mensajes obtenidos del backend:", data);
  
      if (!response.ok) {
        throw new Error(data.message || "Error al obtener los mensajes");
      }
  
      setMessages(data);
    } catch (error) {
      console.error("❌ Error al obtener los mensajes:", error);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    
    // Temporalmente deshabilitamos el input para evitar múltiples envíos
    setInputDisabled(true);
    
    // Manejar diferentes pasos del formulario
    if (formStep === 'nombre') {
      // Guardar nombre y mostrar mensaje de usuario
      const userMessage: Message = {
        texto: inputText,
        esAdmin: false,
        creado: new Date(),
        leido: true
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Actualizar información del usuario
      setUserInfo(prev => ({ ...prev, nombre: inputText }));
      localStorage.setItem('chatUserName', inputText);
      
      // Limpiar input y avanzar al siguiente paso
      setInputText('');
      setFormStep('telefono');
      
      // Añadir mensaje solicitando teléfono
      setTimeout(() => {
        const botResponse: Message = {
          texto: `¡Gracias ${inputText}! 🙂 ¿Podrías proporcionarme tu número de teléfono para contactarte si es necesario?`,
          esAdmin: true,
          creado: new Date(),
          leido: true
        };
        setMessages(prev => [...prev, botResponse]);
        setInputDisabled(false); // Volvemos a habilitar el input
      }, 500);
    } 
    else if (formStep === 'telefono') {
      // Validar formato de teléfono (ajustar según necesidades)
      const phoneRegex = /^\d{9,15}$/;
      if (!phoneRegex.test(inputText.replace(/\s+/g, ''))) {
        // Añadir mensaje de error
        const errorMessage: Message = {
          texto: "Por favor, introduce un número de teléfono válido (solo números, mínimo 9 dígitos).",
          esAdmin: true,
          creado: new Date(),
          leido: true
        };
        setMessages(prev => [...prev, errorMessage]);
        setInputDisabled(false); // Habilitamos el input después del error
        return;
      }
      
      // Guardar teléfono y mostrar mensaje de usuario
      const userMessage: Message = {
        texto: inputText,
        esAdmin: false,
        creado: new Date(),
        leido: true
      };
      
      setMessages(prevMessages => [...prevMessages, userMessage]);
      
      // Actualizar información del usuario
      setUserInfo(prev => ({ ...prev, telefono: inputText }));
      localStorage.setItem('chatUserPhone', inputText);
      
      // Limpiar input y avanzar al chat
      setInputText('');
      setFormStep('chat');
      
      // Añadir mensaje de bienvenida al chat
      setTimeout(() => {
        const botResponse: Message = {
          texto: `¡Perfecto! ¿En qué puedo ayudarte hoy?`,
          esAdmin: true,
          creado: new Date(),
          leido: true
        };
        setMessages(prev => [...prev, botResponse]);
        setInputDisabled(false); // Volvemos a habilitar el input
      }, 500);
    }
    else {
      // Procesar mensaje normal del chat
      handleSendChatMessage();
    }
  };

  const handleSendChatMessage = async () => {
    if (!inputText.trim()) return;
  
    console.log("Enviando mensaje:", inputText);
    
    // Deshabilitamos temporalmente el input
    setInputDisabled(true);
    
    const userMessage: Message = {
      texto: inputText,
      esAdmin: false,
      creado: new Date(),
      leido: true
    };
  
    setMessages(prev => [...prev, userMessage]);
    const currentInputText = inputText;
    setInputText('');
    
    try {
      console.log("Enviando al servidor:", {
        texto: currentInputText,
        nombreUsuario: userInfo.nombre,
        telefono: userInfo.telefono,
        idChat: idChat
      });
      
      // Verificar conexión
      if (socketRef.current && !socketRef.current.connected) {
        console.log("Socket desconectado, intentando reconectar antes de enviar...");
        connectSocket();
        
        // Mostrar un mensaje de espera mientras se reconecta
        const waitMessage: Message = {
          texto: "Estableciendo conexión con el servidor, tu mensaje se enviará en breve...",
          esAdmin: true,
          creado: new Date(),
          leido: true
        };
        
        setMessages(prev => [...prev, waitMessage]);
        
        // Esperar un poco para dar tiempo a la reconexión
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
      // Enviar mensaje al servidor REST
      const response = await fetch(`${config?.baseUrl}${config?.apiPrefix}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          texto: currentInputText,
          nombreUsuario: userInfo.nombre,
          telefono: userInfo.telefono,
          idChat: idChat
        })
      });
  
      const data = await response.json();
      
      // Si es un nuevo chat, guardar el chatId
      if (data.idChat && (!idChat || idChat !== data.idChat)) {
        setIdChat(data.idChat);
        localStorage.setItem('idChat', data.idChat);
        
        // Unirse a la sala de chat
        if (socketRef.current && socketRef.current.connected) {
          try {
            socketRef.current.emit(EVENTS.JOIN_CHAT, data.idChat);
          } catch (socketError) {
            console.error("Error al enviar evento JOIN_CHAT:", socketError);
          }
        }
      }
  
      // Enviar mensaje a través de WebSocket
      if (socketRef.current && socketRef.current.connected) {
        try {
          socketRef.current.emit(EVENTS.CLIENT_MESSAGE, {
            idChat: idChat || data.idChat,
            texto: currentInputText,
            nombreUsuario: userInfo.nombre,
            telefono: userInfo.telefono,
            creado: new Date(),
            esAdmin: false
          });
        } catch (socketError) {
          console.error("Error al emitir mensaje del cliente:", socketError);
        }
      }
      
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      
      // Mensaje de error en caso de fallo
      const errorMessage: Message = {
        texto: "Lo siento, ha ocurrido un error al enviar tu mensaje. Por favor, inténtalo de nuevo más tarde.",
        esAdmin: true,
        creado: new Date(),
        leido: true
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      // Siempre volvemos a habilitar el input después de procesar
      setInputDisabled(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
  };

  const handleClose = () => {
    setIsOpen(false);
  };

  // Reiniciar chat
  const handleReset = () => {
    // Preguntar al usuario si está seguro
    if (!confirm("¿Estás seguro de que deseas reiniciar el chat? Se perderá toda la conversación.")) {
      return;
    }
    
    localStorage.removeItem('chatUserName');
    localStorage.removeItem('chatUserPhone');
    localStorage.removeItem('idChat');
    
    setUserInfo({ nombre: '', telefono: '' });
    setFormStep('nombre');
    setIdChat(null);
    setMessages([]);
    setInputDisabled(false);
    
    // Mostrar mensaje de bienvenida
    setTimeout(() => {
      const welcomeMessage: Message = {
        texto: "¡Hola! 👋 Para poder ayudarte mejor, ¿podrías decirme tu nombre?",
        esAdmin: true,
        creado: new Date(),
        leido: true
      };
      setMessages([welcomeMessage]);
    }, 300);
  };

  // Componente del botón de chat (siempre visible)
  const ChatButton = () => (
    <div className="fixed bottom-4 right-4 flex flex-col items-end gap-2 z-50">
      {unreadCount > 0 && (
        <div className="bg-red-600 text-white rounded-full px-2 py-1 text-sm flex items-center gap-1">
          <Bell className="w-4 h-4" />
          {unreadCount} nuevo{unreadCount !== 1 ? 's' : ''}
        </div>
      )}
      <button
        onClick={handleOpen}
        className="bg-red-600 text-white p-4 rounded-full shadow-lg hover:bg-red-700 transition-all transform hover:scale-110"
      >
        <MessageCircle className="w-6 h-6" />
      </button>
    </div>
  );

  // Componente de la ventana de chat
  const ChatWindow = () => (
    <div className="fixed bottom-4 right-4 w-96 max-w-full bg-white rounded-lg shadow-lg overflow-hidden flex flex-col z-50" style={{ height: '520px', maxHeight: '80vh' }}>
      <div className="bg-red-600 p-3 text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bot className="w-5 h-5" />
          <h1 className="text-lg font-semibold">Atención al Cliente</h1>
        </div>
        <div className="flex items-center gap-2">
          {formStep === 'chat' && (
            <button
              onClick={handleReset}
              className="text-white hover:text-red-200 transition-colors text-sm px-2 py-1 bg-red-700 rounded"
            >
              Reiniciar
            </button>
          )}
          <button
            onClick={handleClose}
            className="text-white hover:text-red-200 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.esAdmin ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex items-start gap-2 max-w-[80%] ${message.esAdmin ? 'flex-row' : 'flex-row-reverse'}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${message.esAdmin ? 'bg-red-100' : 'bg-green-100'}`}>
                {message.esAdmin ? <Bot className="w-5 h-5 text-red-600" /> : <User className="w-5 h-5 text-green-600" />}
              </div>
              <div className={`rounded-lg p-3 ${message.esAdmin ? 'bg-red-100 text-red-900' : 'bg-green-100 text-green-900'}`}>
                <p className="text-sm whitespace-pre-wrap">{message.texto}</p>
                <p className="text-xs mt-1 opacity-50">{new Date(message.creado).toLocaleTimeString()}</p>
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleFormSubmit} className="p-3 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={inputDisabled}
            placeholder={
              formStep === 'nombre' ? "Escribe tu nombre..." : 
              formStep === 'telefono' ? "Escribe tu número de teléfono..." : 
              "Escribe tu mensaje..."
            }
            className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
            autoComplete={formStep === 'telefono' ? 'tel' : formStep === 'nombre' ? 'name' : 'off'}
          />
          <button
            type="submit"
            className={`${inputDisabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'} text-white px-3 py-2 rounded-lg transition-colors flex items-center gap-1`}
            disabled={!inputText.trim() || inputDisabled}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>
      </form>
      
      {(!isConnected && formStep === 'chat') && (
        <div className={`text-xs p-2 text-center ${isConnecting ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
          {isConnecting ? "Conectando al servidor..." : "Desconectado. Intentando reconectar..."}
        </div>
      )}
    </div>
  );

  // Renderizado condicional basado en si el chat está abierto o no
  return (
    <>
      <ChatButton />
      {isOpen && <ChatWindow />}
    </>
  );
}

export default ChatBot;