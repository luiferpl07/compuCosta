import React, { useState, useEffect, useRef } from 'react';
import { MessageCircle, Send, X, Minimize2, Maximize2, User, Bell, BellOff } from 'lucide-react';
import { config } from '../../config';
import { useAuth } from '../context/AuthContext';
import {
  createSocket,
  emitClientMessage,
  setupMessageListener,
  EVENTS,
  isSocketConnected,
} from "../shared/socketService";

import { Socket } from "socket.io-client";

interface Message {
  id: string;
  texto: string;
  esAdmin: boolean;
  creado: Date;
  isWelcome?: boolean;
}

interface ChatData {
  chatId: string;
  messages: Message[];
  lastActivity: number;
  hasSeenWelcome: boolean;
  unreadCount: number;
  anonymousUser?: {
    id: string;
    name: string;
  } | null;
}

interface ChatBotProps {
  className?: string;
}

const CHAT_EXPIRY_HOURS = 12;

const ChatBot: React.FC<ChatBotProps> = ({ className = '' }) => {
  // Estados principales
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [chatId, setChatId] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [hasNewMessage, setHasNewMessage] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [adminTyping, setAdminTyping] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [hasSeenWelcome, setHasSeenWelcome] = useState(false);
  
  // ✨ Estados para el formulario de nombre
  const [showNameForm, setShowNameForm] = useState(false);
  const [tempUserName, setTempUserName] = useState('');
  const [isSubmittingName, setIsSubmittingName] = useState(false);
  
  // ✨ Estado para usuario anónimo
  const [anonymousUser, setAnonymousUser] = useState<{id: string, name: string} | null>(null);
  const [isInitialized, setIsInitialized] = useState(false); // ✨ Nuevo estado para controlar inicialización

  const socketRef = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { currentUser } = useAuth();

  // ✨ Cargar usuario anónimo existente (NO crea uno nuevo)
  const loadExistingAnonymousUser = () => {
    if (currentUser || anonymousUser) return anonymousUser;
    
    try {
      const stored = localStorage.getItem('anonymous_user_data');
      if (stored) {
        const anonymousData = JSON.parse(stored);
        setAnonymousUser(anonymousData);
        return anonymousData;
      }
    } catch (error) {
      console.warn('Error cargando usuario anónimo:', error);
    }
    
    return null;
  };

  // ✨ Crear usuario anónimo (solo cuando sea necesario)
  const createAnonymousUser = (customName?: string) => {
    if (currentUser) return null;
    
    const timestamp = Date.now();
    const randomId = Math.random().toString(36).substring(2, 8);
    const anonymousData = {
      id: `anon_${timestamp}_${randomId}`,
      name: customName || `Anónimo #${randomId.toUpperCase()}`
    };

    // Guardar en localStorage
    localStorage.setItem('anonymous_user_data', JSON.stringify(anonymousData));
    setAnonymousUser(anonymousData);
    
    return anonymousData;
  };

  // ✨ Obtener usuario anónimo (cargar existente o crear si se especifica)
  const getOrCreateAnonymousUser = (customName?: string, forceCreate: boolean = false) => {
    if (currentUser) return null;
    
    // Si ya tenemos uno en memoria, devolverlo
    if (anonymousUser) return anonymousUser;
    
    // Intentar cargar existente
    const existing = loadExistingAnonymousUser();
    if (existing) return existing;
    
    // Solo crear uno nuevo si se fuerza o se proporciona un nombre personalizado
    if (forceCreate || customName) {
      return createAnonymousUser(customName);
    }
    
    return null;
  };

  // ✨ Clave de storage que funcione con o sin usuario autenticado
  const getChatStorageKey = () => {
    if (currentUser) {
      return `chatbot_data_${currentUser.uid}`;
    } else {
      // Solo usar el usuario anónimo si ya existe, no crearlo
      const existing = anonymousUser || loadExistingAnonymousUser();
      return existing ? `chatbot_data_${existing.id}` : 'chatbot_data_temp';
    }
  };

  // ✨ Obtener nombre del usuario (autenticado o anónimo)
  function getUserName() {
    if (currentUser) {
      const fullName = `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim();
      return fullName || 'Usuario';
    } else {
      // Solo usar usuario anónimo si ya existe
      const existing = anonymousUser || loadExistingAnonymousUser();
      return existing ? existing.name : 'Anónimo';
    }
  }

  // ✨ Obtener ID del usuario (autenticado o anónimo)
  function getUserId() {
    if (currentUser) {
      return currentUser.uid;
    } else {
      // Solo usar usuario anónimo si ya existe
      const existing = anonymousUser || loadExistingAnonymousUser();
      return existing ? existing.id : 'temp_user';
    }
  }

  // ✨ Generar ID único para el chat
  const generateChatId = () => {
    const userId = getUserId();
    const timestamp = Date.now();
    return `chat_${userId}_${timestamp}`;
  };

  // ✨ Verificar si debe mostrar formulario de nombre
  const shouldShowNameForm = () => {
    console.log('🔍 shouldShowNameForm check:', {
      currentUser: !!currentUser,
      anonymousUser: !!anonymousUser,
      hasSeenWelcome,
      messagesLength: messages.length,
      isInitialized
    });
    
    return !currentUser && !anonymousUser && !hasSeenWelcome && messages.length === 0 && isInitialized;
  };

  // ✨ Manejar envío del formulario de nombre
  const handleNameSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUserName.trim()) return;

    setIsSubmittingName(true);
    
    // Crear usuario anónimo con el nombre personalizado
    createAnonymousUser(tempUserName.trim());
    
    // Ocultar formulario y mostrar mensaje de bienvenida
    setShowNameForm(false);
    setTempUserName('');
    
    setTimeout(() => {
      showWelcomeMessage();
      setIsSubmittingName(false);
    }, 300);
  };

  const getWelcomeMessage = (): Message => ({
    id: 'welcome-message',
    texto: `¡Hola! 👋\n\nBienvenido a nuestro servicio de soporte. Estamos aquí para ayudarte con cualquier pregunta o problema que tengas.\n\n¿En qué podemos ayudarte hoy?`,
    esAdmin: true,
    creado: new Date(),
    isWelcome: true
  });

  // Función para reproducir sonido de notificación
  const playNotificationSound = () => {
    if (!notificationsEnabled) return;
    
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.4;
      audio.play().catch(() => {
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        
        const createBeep = (frequency: number, duration: number, delay: number) => {
          setTimeout(() => {
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            oscillator.frequency.value = frequency;
            oscillator.type = 'sine';
            gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + duration);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + duration);
          }, delay);
        };

        createBeep(800, 0.15, 0);
        createBeep(1000, 0.15, 200);
        createBeep(800, 0.15, 400);
      });
    } catch (error) {
      console.warn('Error reproduciendo sonido:', error);
    }
  };

  // Solicitar permisos de notificación
  const requestNotificationPermission = async () => {
    if ('Notification' in window && Notification.permission === 'default') {
      try {
        const permission = await Notification.requestPermission();
        console.log('Permiso de notificación:', permission);
      } catch (error) {
        console.warn('Error solicitando permisos de notificación:', error);
      }
    }
  };

  // ✨ Sincronizar chat con backend (actualizado)
  const syncChatIdWithBackend = async () => {
    const savedChat = loadChatData();
    if (!savedChat) {
      setIsInitialized(true); // ✨ Marcar como inicializado incluso si no hay chat guardado
      return;
    }

    try {
      const res = await fetch(`${config.baseUrl}${config.apiPrefix}/chat/exists?idChat=${savedChat.chatId}`);
      const data = await res.json();

      if (data.exists) {
        console.log('✅ ChatId válido confirmado por backend:', savedChat.chatId);
        setChatId(savedChat.chatId);
        setMessages(savedChat.messages);
        setHasSeenWelcome(savedChat.hasSeenWelcome || false);
        setUnreadCount(savedChat.unreadCount || 0);
        setHasNewMessage((savedChat.unreadCount || 0) > 0);
        
        // ✨ Restaurar usuario anónimo si existe
        if (savedChat.anonymousUser && !currentUser) {
          setAnonymousUser(savedChat.anonymousUser);
        }
      } else {
        console.warn('⚠️ Chat eliminado en backend. Limpiando estado...');
        localStorage.removeItem(getChatStorageKey());
        setChatId(null);
        setMessages([]);
        setHasSeenWelcome(false);
        setUnreadCount(0);
        setHasNewMessage(false);
      }
    } catch (err) {
      console.error('❌ Error al validar existencia del chat en backend:', err);
      localStorage.removeItem(getChatStorageKey());
      setChatId(null);
      setMessages([]);
      setHasSeenWelcome(false);
      setUnreadCount(0);
      setHasNewMessage(false);
    } finally {
      setIsInitialized(true); // ✨ Marcar como inicializado al final
    }
  };

  // Mostrar notificación del sistema
  const showSystemNotification = (message: string) => {
    if (!notificationsEnabled) return;
    
    if ('Notification' in window && Notification.permission === 'granted') {
      try {
        const notification = new Notification('💬 Nuevo mensaje - Soporte', {
          body: message.length > 50 ? message.substring(0, 50) + '...' : message,
          icon: '/favicon.ico',
          badge: '/favicon.ico',
          tag: 'chat-notification',
          requireInteraction: true,
          silent: false,
        });

        notification.onclick = () => {
          window.focus();
          setIsOpen(true);
          setIsMinimized(false);
          markMessagesAsRead();
          notification.close();
        };

        setTimeout(() => notification.close(), 8000);
      } catch (error) {
        console.warn('Error mostrando notificación:', error);
      }
    }
  };

  // Función para marcar mensajes como leídos
  const markMessagesAsRead = () => {
    setUnreadCount(0);
    setHasNewMessage(false);
  };

  // ✨ Guardar datos del chat en localStorage (actualizado)
  const saveChatData = (chatId: string, messages: Message[], hasSeenWelcome: boolean = false, unreadCount: number = 0) => {
    try {
      const chatData: ChatData = {
        chatId,
        messages: messages.map(msg => ({
          ...msg,
          creado: new Date(msg.creado)
        })),
        lastActivity: Date.now(),
        hasSeenWelcome,
        unreadCount,
        // ✨ Solo guardar usuario anónimo si ya existe
        anonymousUser: !currentUser ? (anonymousUser || null) : null
      };
      localStorage.setItem(getChatStorageKey(), JSON.stringify(chatData));
    } catch (error) {
      console.warn('No se pudo guardar el chat en localStorage:', error);
    }
  };

  // ✨ Cargar datos del chat desde localStorage (actualizado)
  const loadChatData = (): ChatData | null => {
    try {
      const stored = localStorage.getItem(getChatStorageKey());
      if (!stored) return null;

      const chatData: ChatData = JSON.parse(stored);
      
      // Verificar si el chat ha expirado (12 horas)
      const hoursElapsed = (Date.now() - chatData.lastActivity) / (1000 * 60 * 60);
      if (hoursElapsed > CHAT_EXPIRY_HOURS) {
        localStorage.removeItem(getChatStorageKey());
        return null;
      }

      // Convertir fechas de string a Date
      chatData.messages = chatData.messages.map(msg => ({
        ...msg,
        creado: new Date(msg.creado)
      }));

      return chatData;
    } catch (error) {
      console.warn('Error cargando chat desde localStorage:', error);
      localStorage.removeItem(getChatStorageKey());
      return null;
    }
  };

  // Limpiar chat expirado
  const cleanupExpiredChat = () => {
    const stored = loadChatData();
    if (!stored) {
      localStorage.removeItem(getChatStorageKey());
    }
  };

  // Mostrar mensaje de bienvenida
  const showWelcomeMessage = () => {
    if (!hasSeenWelcome) {
      const welcomeMessage = getWelcomeMessage();
      setMessages(prev => [welcomeMessage, ...prev]);
      setHasSeenWelcome(true);
    }
  };

  // Animación de admin escribiendo
  const TypingIndicator = () => (
    <div className="flex justify-start mb-3">
      <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-sm max-w-[80%]">
        <div className="flex items-center space-x-1">
          <span className="text-sm text-gray-600">El admin está escribiendo</span>
          <div className="flex space-x-1">
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      </div>
    </div>
  );

  // Manejar mensajes entrantes
  const handleIncomingMessage = (data: any) => {
    console.log('📨 Mensaje recibido via socketService:', data);
    
    if (data.idChat === chatId) {
      const newMessage: Message = {
        id: data.id || `${data.esAdmin ? 'admin' : 'client'}-${Date.now()}-${Math.random()}`,
        texto: data.texto,
        esAdmin: data.esAdmin,
        creado: new Date(data.creado)
      };
      
      if (data.esAdmin && adminTyping) {
        setAdminTyping(false);
        if (typingTimeoutRef.current) {
          clearTimeout(typingTimeoutRef.current);
        }
      }
      
      setMessages(prev => {
        const exists = prev.some(msg => 
          msg.id === newMessage.id || 
          (msg.texto === newMessage.texto && 
          msg.esAdmin === newMessage.esAdmin && 
          Math.abs(new Date(msg.creado).getTime() - new Date(newMessage.creado).getTime()) < 1000)
        );
        
        if (exists) {
          console.log('⚠️ Mensaje duplicado detectado, ignorando');
          return prev;
        }
        
        console.log('✅ Agregando nuevo mensaje:', newMessage);
        return [...prev, newMessage];
      });
      
      if (data.esAdmin && (isMinimized || !isOpen)) {
        setUnreadCount(prev => prev + 1);
        setHasNewMessage(true);
        showSystemNotification(data.texto);
        playNotificationSound();
      }
    } else {
      console.log('⚠️ Mensaje ignorado - no es para este chat:', data.idChat, 'vs', chatId);
    }
  };

  // Toggle chat
  const toggleChat = () => {
    setIsOpen(prev => {
      const newState = !prev;
      if (newState) {
        // opening: clear minimized state and mark as read
        setIsMinimized(false);
        markMessagesAsRead();

        // ✨ Verificar si debe mostrar formulario de nombre cuando se abre el chat
        console.log('📝 Chat abierto, verificando si mostrar formulario de nombre...');
        const shouldShow = shouldShowNameForm();
        console.log('📝 Resultado shouldShowNameForm:', shouldShow);
        
        if (shouldShow) {
          setShowNameForm(true);
        }
        
        setTimeout(() => {
          messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        // Al cerrar, ocultar formulario de nombre si está visible
        setShowNameForm(false);
        setTempUserName('');
        // ensure minimized flag cleared when fully closed
        setIsMinimized(false);
      }
      return newState;
    });
  };

  // Toggle minimize - in the new behaviour minimizing will hide the window and show only the floating button
  const toggleMinimize = () => {
    setIsMinimized(true);
    // hide the window (show only floating button)
    setIsOpen(false);
  };

  const toggleNotifications = () => {
    setNotificationsEnabled(!notificationsEnabled);
    if (!notificationsEnabled) {
      requestNotificationPermission();
    }
  };

  const formatTime = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false
    }).format(date);
  };

  // Effects
  useEffect(() => {
    if (socketRef.current?.connected && chatId) {
      console.log("📥 Re-enviando JOIN_CHAT por cambio de estado:", chatId);
      socketRef.current.emit(EVENTS.JOIN_CHAT, chatId);
    }
  }, [chatId, isConnected]);

  // ✨ Efecto principal de inicialización (corregido)
  useEffect(() => {
    console.log('🔄 Inicializando chat component...');
    
    // Resetear estados
    setChatId(null);
    setMessages([]);
    setHasSeenWelcome(false);
    setAdminTyping(false);
    setHasNewMessage(false);
    setUnreadCount(0);
    setIsInitialized(false);
    setShowNameForm(false);
    setAnonymousUser(null);

    // ✨ Si no hay usuario autenticado, intentar cargar usuario anónimo existente (NO crear uno nuevo)
    if (!currentUser) {
      loadExistingAnonymousUser();
    }

    cleanupExpiredChat();
    syncChatIdWithBackend();
    requestNotificationPermission();
  }, [currentUser?.uid]);

  // ✨ Efecto para mostrar formulario de nombre cuando el chat está inicializado
  useEffect(() => {
    if (isInitialized && isOpen && !isMinimized) {
      const shouldShow = shouldShowNameForm();
      console.log('🎯 Evaluando mostrar formulario después de inicializar:', {
        isInitialized,
        isOpen,
        isMinimized,
        shouldShow,
        showNameForm
      });
      
      if (shouldShow && !showNameForm) {
        console.log('📝 Mostrando formulario de nombre');
        setShowNameForm(true);
      }
    }
  }, [isInitialized, isOpen, isMinimized, currentUser, anonymousUser, hasSeenWelcome, messages.length]);

  useEffect(() => {
    if (chatId && messages.length > 0) {
      saveChatData(chatId, messages, hasSeenWelcome, unreadCount);
    }
  }, [chatId, messages, hasSeenWelcome, unreadCount]);

  // ✨ Efecto para mostrar mensaje de bienvenida (corregido)
  useEffect(() => {
    if (isOpen && !isMinimized && !hasSeenWelcome && messages.length === 0 && isInitialized) {
      const timer = setTimeout(() => {
        // ✨ Solo mostrar bienvenida si no necesita formulario de nombre
        if (!shouldShowNameForm()) {
          console.log('👋 Mostrando mensaje de bienvenida');
          showWelcomeMessage();
        }
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, isMinimized, hasSeenWelcome, messages.length, currentUser, anonymousUser, isInitialized]);

  // Inicializar WebSocket
  useEffect(() => {
    if (!socketRef.current) {
      console.log('🔌 Iniciando conexión WebSocket persistente');
      socketRef.current = createSocket();
      setIsConnected(false);

      const handleConnect = () => {
        console.log('✅ Conexión establecida');
        setIsConnected(true);
        if (chatId) {
          console.log(`🏠 Uniéndose al chat ${chatId}`);
          socketRef.current!.emit(EVENTS.JOIN_CHAT, chatId);
        }
      };

      const handleDisconnect = (reason: string) => {
        console.log('❌ Desconectado:', reason);
        setIsConnected(false);
        setTimeout(() => {
          if (socketRef.current && !socketRef.current.connected) {
            console.log('🔄 Intentando reconectar...');
            socketRef.current.connect();
          }
        }, 2000);
      };

      const handleConnectError = (error: Error) => {
        console.error('❌ Error de conexión:', error);
        setIsConnected(false);
      };

      socketRef.current.on('connect', handleConnect);
      socketRef.current.on('disconnect', handleDisconnect);
      socketRef.current.on('connect_error', handleConnectError);

      const pingInterval = setInterval(() => {
        if (socketRef.current?.connected) {
          socketRef.current.emit('ping');
        }
      }, 25000);

      socketRef.current.connect();

      return () => {
        clearInterval(pingInterval);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      };
    }
  }, []); 

  useEffect(() => {
    if (!socketRef.current || !chatId) return;

    console.log('📥 Configurando listener de mensajes para chat:', chatId);
    
    socketRef.current.off(EVENTS.NEW_MESSAGE);
    
    const messageListener = (data: any) => {
      console.log('📨 Mensaje recibido en listener:', data);
      handleIncomingMessage(data);
    };
    
    socketRef.current.on(EVENTS.NEW_MESSAGE, messageListener);
    
    if (socketRef.current.connected) {
      console.log(`🏠 Uniéndose al chat ${chatId}`);
      socketRef.current.emit(EVENTS.JOIN_CHAT, chatId);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.off(EVENTS.NEW_MESSAGE, messageListener);
      }
    };
  }, [chatId]);

  useEffect(() => {
    if (messagesEndRef.current && !isMinimized) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isMinimized, adminTyping]);

  // ✨ Función de envío de mensajes actualizada
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const socket = socketRef.current;
    const messageText = newMessage.trim();
    const userName = getUserName();
    const userId = getUserId();
    let currentChatId = chatId;

    setIsLoading(true);

    try {
      // Si no hay chat aún, crea uno con el primer mensaje
      if (!currentChatId) {
        const response = await fetch(`${config.baseUrl}${config.apiPrefix}/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            texto: messageText,
            nombreUsuario: userName,
            userId: userId, // ✨ Ahora funciona con usuario anónimo o autenticado
          })
        });

        const result = await response.json();
        if (!response.ok || !result.idChat) throw new Error('No se pudo crear el chat');

        currentChatId = result.idChat;
        setChatId(currentChatId);

        // Mostrar mensaje del usuario inmediatamente
        const userMessage: Message = {
          id: `client-${Date.now()}`,
          texto: messageText,
          esAdmin: false,
          creado: new Date()
        };
        setMessages(prev => [...prev, userMessage]);

        // Mostrar respuesta automática si la hay
        if (result.texto) {
          const adminMessage: Message = {
            id: `admin-${Date.now()}`,
            texto: result.texto,
            esAdmin: true,
            creado: new Date(result.creado)
          };
          setMessages(prev => [...prev, adminMessage]);
        }

      } else {
        // Usar la función para guardar + emitir el mensaje
        const saved = await emitClientMessage(socket!, currentChatId, messageText, userName);

        // Agregar el mensaje confirmado
        const newMessageObj: Message = {
          id: `client-${Date.now()}-${Math.random()}`,
          texto: saved.texto,
          esAdmin: false,
          creado: new Date(saved.creado)
        };

        setMessages(prev => [...prev, newMessageObj]);
      }

      setNewMessage('');

    } catch (error) {
      console.error('❌ Error al enviar mensaje:', error);
      setMessages(prev => [...prev, {
        id: `error-${Date.now()}`,
        texto: 'Error al enviar el mensaje. Inténtalo de nuevo.',
        esAdmin: true,
        creado: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };
    
  useEffect(() => {
    const interval = setInterval(cleanupExpiredChat, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    return () => {
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className={`fixed bottom-4 left-4 right-4 sm:right-4 sm:left-auto z-50 flex justify-end ${className}`}>
      {/* Botón flotante */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="bg-red-500 hover:bg-red-600 text-white rounded-full p-4 shadow-lg transition-all duration-200 hover:scale-110 relative group flex-shrink-0"
          aria-label="Abrir chat"
        >
          <MessageCircle className="w-6 h-6" />

          {unreadCount > 0 && (
            <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold rounded-full min-w-6 h-6 flex items-center justify-center animate-pulse shadow-lg border-2 border-white">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}

          {hasNewMessage && (
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></span>
          )}

          <div className="absolute bottom-full right-0 mb-2 bg-black text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            {unreadCount > 0 ? `${unreadCount} mensajes nuevos` : 'Abrir chat de soporte'}
          </div>
        </button>
      )}

      {/* Ventana de chat */}
      {isOpen && (
        <div className="bg-white rounded-lg shadow-2xl border border-gray-200 w-full sm:w-96 max-w-md h-[60vh] sm:h-[500px] flex flex-col animate-in slide-in-from-bottom-4 duration-300 overflow-hidden z-60">
          {/* Header */}
          <div className="flex items-center justify-between p-4 bg-red-500 text-white rounded-t-lg">
            <div className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <div>
                <h3 className="font-semibold">Soporte al Cliente</h3>
                <p className="text-xs opacity-75 flex items-center">
                  <span className={`inline-block w-2 h-2 rounded-full mr-1 ${isConnected ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`}></span>
                  {isConnected ? 'En línea' : 'Desconectado'}
                  {adminTyping && ' • Admin escribiendo...'}
                  {unreadCount > 0 && ` • ${unreadCount} no leídos`}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={toggleNotifications}
                className={`hover:bg-red-600 p-1 rounded transition-colors ${!notificationsEnabled ? 'opacity-50' : ''}`}
                aria-label={notificationsEnabled ? "Desactivar notificaciones" : "Activar notificaciones"}
                title={notificationsEnabled ? "Desactivar notificaciones" : "Activar notificaciones"}
              >
                {notificationsEnabled ? <Bell className="w-4 h-4" /> : <BellOff className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleMinimize}
                className="hover:bg-red-600 p-1 rounded transition-colors"
                aria-label={isMinimized ? "Maximizar" : "Minimizar"}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={toggleChat}
                className="hover:bg-red-600 p-1 rounded transition-colors"
                aria-label="Cerrar chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Contenido del chat */}
          {!isMinimized && (
            <>
              {/* ✨ Formulario de nombre para usuarios anónimos */}
              {showNameForm && (
                <div className="flex-1 flex items-center justify-center p-6 bg-gray-50">
                  <div className="w-full max-w-sm">
                    <div className="text-center mb-6">
                      <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <User className="w-8 h-8 text-red-500" />
                      </div>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        ¡Bienvenido al chat de soporte!
                      </h3>
                      <p className="text-sm text-gray-600">
                        Para brindarte una mejor atención, por favor ingresa tu nombre:
                      </p>
                    </div>
                    
                    <form onSubmit={handleNameSubmit} className="space-y-4">
                      <div>
                        <input
                          type="text"
                          value={tempUserName}
                          onChange={(e) => setTempUserName(e.target.value)}
                          placeholder="Tu nombre..."
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm"
                          disabled={isSubmittingName}
                          autoFocus
                          maxLength={50}
                        />
                      </div>
                      
                      <div className="flex space-x-3">
                        <button
                          type="submit"
                          disabled={!tempUserName.trim() || isSubmittingName}
                          className="flex-1 bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 rounded-lg transition-colors text-sm font-medium"
                        >
                          {isSubmittingName ? 'Iniciando...' : 'Comenzar chat'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={() => {
                            // Continuar como anónimo - crear usuario anónimo
                            createAnonymousUser();
                            setShowNameForm(false);
                            setTimeout(() => showWelcomeMessage(), 300);
                          }}
                          className="px-4 py-3 text-gray-500 hover:text-gray-700 text-sm transition-colors"
                          disabled={isSubmittingName}
                        >
                          Continuar como Anónimo
                        </button>
                      </div>
                    </form>
                    
                    <div className="mt-4 text-center">
                      <p className="text-xs text-gray-500">
                        Tu nombre solo será visible para nuestro equipo de soporte
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Área de mensajes - Solo visible si no hay formulario de nombre */}
              {!showNameForm && (
                <>
                  <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.esAdmin ? 'justify-start' : 'justify-end'} ${
                          message.isWelcome ? 'animate-in slide-in-from-left-4 duration-500' : ''
                        }`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            message.esAdmin
                              ? message.isWelcome
                                ? 'bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 text-gray-800'
                                : 'bg-white border border-gray-200 text-gray-800'
                              : 'bg-red-500 text-white'
                          } shadow-sm transition-all duration-200`}
                        >
                          <p className="text-sm whitespace-pre-line">{message.texto}</p>
                          <p className={`text-xs mt-1 ${
                            message.esAdmin ? 'text-gray-500' : 'text-red-100'
                          }`}>
                            {formatTime(message.creado)}
                          </p>
                        </div>
                      </div>
                    ))}
                    
                    {adminTyping && <TypingIndicator />}
                    
                    <div ref={messagesEndRef} />
                  </div>

                  {/* Formulario de envío - Solo visible si no hay formulario de nombre */}
                  <form onSubmit={handleSendMessage} className="p-4 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Escribe tu mensaje..."
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent text-sm transition-all"
                        disabled={isLoading}
                      />
                      <button
                        type="submit"
                        disabled={isLoading || !newMessage.trim()}
                        className="bg-red-500 hover:bg-red-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white p-2 rounded-lg transition-colors"
                        aria-label="Enviar mensaje"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </form>
                </>
              )}
            </>
          )}

          {/* Vista minimizada */}
          {isMinimized && (
            <div className="p-3 flex items-center justify-between">
              <div className="text-left">
                <p className="text-sm text-gray-600">Chat minimizado</p>
                {hasNewMessage && (
                  <p className="text-xs text-green-600 mt-1 animate-pulse">💬 Nuevo mensaje recibido</p>
                )}
                {adminTyping && (
                  <p className="text-xs text-blue-600 mt-1">✍️ Admin está escribiendo...</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleMinimize}
                  className="px-3 py-2 bg-red-500 text-white rounded-lg text-sm hover:bg-red-600 transition-colors"
                  aria-label="Restaurar chat"
                >
                  Abrir
                </button>
                <button
                  type="button"
                  onClick={toggleChat}
                  className="px-2 py-2 bg-gray-100 text-gray-700 rounded-md text-sm hover:bg-gray-200 transition-colors"
                  aria-label="Cerrar chat"
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatBot;