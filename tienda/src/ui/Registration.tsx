import React, { useState, useCallback, useEffect } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { logo } from "../assets";

interface RegistrationProps {
  className?: string;
}

const Registration: React.FC<RegistrationProps> = ({ className = '' }) => {
  const { login, register, loginWithGoogle, error, authLoading, clearError } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isInitializing, setIsInitializing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  // Pre-inicializar Firebase para reducir demoras
  useEffect(() => {
    const preInitializeAuth = async () => {
      try {
        const { getAuth } = await import('firebase/auth');
        const auth = getAuth();
        
        if (auth.currentUser === undefined) {
          setIsInitializing(true);
          await new Promise((resolve) => {
            const unsubscribe = auth.onAuthStateChanged((user) => {
              unsubscribe();
              resolve(user);
            });
          });
          setIsInitializing(false);
        }
      } catch (error) {
        console.warn('Error pre-inicializando Firebase:', error);
        setIsInitializing(false);
      }
    };

    preInitializeAuth();
  }, []);

  const toggleForm = useCallback(() => {
    setIsLogin(!isLogin);
    clearError?.();
  }, [isLogin, clearError]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const validateForm = useCallback((isLoginForm: boolean) => {
    if (!formData.email.trim() || !formData.password.trim()) {
      throw new Error("Email y contraseña son requeridos");
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      throw new Error("Formato de email inválido");
    }

    if (!isLoginForm) {
      if (!formData.firstName.trim() || !formData.lastName.trim()) {
        throw new Error("Nombre y apellido son requeridos");
      }
      
      if (formData.password !== formData.confirmPassword) {
        throw new Error("Las contraseñas no coinciden");
      }

      if (formData.password.length < 6) {
        throw new Error("La contraseña debe tener al menos 6 caracteres");
      }
    }
  }, [formData]);

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      validateForm(isLogin);
      clearError?.();
    } catch (error: any) {
      alert(error.message);
      return;
    }
    
    if (isLogin) {
      try {
        console.log("🔄 Iniciando sesión...");
        const startTime = Date.now();
        
        const loginData = { 
          email: formData.email.trim().toLowerCase(), 
          password: formData.password 
        };
        
        const timeoutDuration = 45000;
        
        const loginPromise = login(loginData);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: La conexión está tardando demasiado')), timeoutDuration)
        );

        await Promise.race([loginPromise, timeoutPromise]);
        
        const duration = Date.now() - startTime;
        console.log(`✅ Inicio de sesión exitoso en ${duration}ms`);
        
        setFormData(prev => ({ ...prev, password: '' }));
        
      } catch (error: any) {
        console.error("❌ Error en el inicio de sesión:", error);
        
        if (error.message?.includes('Timeout')) {
          alert('La conexión está tardando más de lo esperado. Esto puede ocurrir en el primer inicio de sesión. Por favor, verifica tu conexión e intenta nuevamente.');
        } else if (error.code === 'auth/user-not-found') {
          alert('No existe una cuenta con este email. ¿Deseas crear una cuenta nueva?');
        } else if (error.code === 'auth/wrong-password') {
          alert('Contraseña incorrecta. Por favor, verifica tu contraseña.');
        } else if (error.code === 'auth/too-many-requests') {
          alert('Demasiados intentos fallidos. Por favor, espera unos minutos antes de intentar nuevamente.');
        } else if (error.code === 'auth/network-request-failed') {
          alert('Error de conexión. Por favor, verifica tu conexión a internet.');
        } else {
          alert(error.message || 'Error desconocido en el inicio de sesión');
        }
      }
    } else {
      try {
        console.log("🔄 Registrando usuario...");
        const startTime = Date.now();
        
        const registerData = {
          email: formData.email.trim().toLowerCase(),
          password: formData.password,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim(),
        };
        
        const timeoutDuration = 45000;
        
        const registerPromise = register(registerData);
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout: El registro está tardando demasiado')), timeoutDuration)
        );

        await Promise.race([registerPromise, timeoutPromise]);
        
        const duration = Date.now() - startTime;
        console.log(`✅ Registro exitoso en ${duration}ms`);
        
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        
      } catch (error: any) {
        console.error("❌ Error en el registro:", error);
        
        if (error.message?.includes('Timeout')) {
          alert('El registro está tardando más de lo esperado. Por favor, verifica tu conexión e intenta nuevamente.');
        } else if (error.code === 'auth/email-already-in-use') {
          alert('Ya existe una cuenta con este email. ¿Deseas iniciar sesión en su lugar?');
        } else if (error.code === 'auth/weak-password') {
          alert('La contraseña es demasiado débil. Usa al menos 6 caracteres.');
        } else if (error.code === 'auth/network-request-failed') {
          alert('Error de conexión. Por favor, verifica tu conexión a internet.');
        } else {
          alert(error.message || 'Error desconocido en el registro');
        }
      }
    }
  }, [isLogin, formData, login, register, clearError, validateForm]);
  
  // GOOGLE LOGIN DIRECTO SIN ESTADOS NI FEEDBACK VISUAL
  const handleGoogleLogin = useCallback(async () => {
    try {
      console.log("🔄 Iniciando sesión con Google...");
      const startTime = Date.now();
      
      await loginWithGoogle();
      
      const duration = Date.now() - startTime;
      console.log(`✅ Google Login completado en ${duration}ms`);
      
    } catch (error: any) {
      console.error("❌ Error en Google auth:", error);
      
      if (error.code === 'auth/popup-closed-by-user') {
        console.log('Usuario cerró la ventana de Google');
      } else if (error.code === 'auth/popup-blocked') {
        alert('El navegador bloqueó la ventana emergente. Por favor, permite ventanas emergentes para este sitio.');
      } else if (error.code === 'auth/network-request-failed') {
        alert('Error de conexión. Por favor, verifica tu conexión a internet.');
      } else {
        alert('Error en el inicio de sesión con Google. Por favor, intenta nuevamente.');
      }
    }
  }, [loginWithGoogle]);

  // Mostrar loading solo durante inicialización
  if (isInitializing) {
    return (
      <div className={`w-full rounded-lg shadow-md overflow-hidden ${className}`}>
        <div className="flex items-center justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600 mr-3"></div>
          <span className="text-gray-600">Inicializando...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`w-full rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="flex flex-col md:flex-row w-full">
        {/* Panel de Login/Registro */}
        <div className={`w-full md:w-1/2 p-6 md:p-8 transition-all duration-500 ${isLogin ? 'bg-red-600' : 'bg-white'}`}>
          <div className="flex items-center mb-6">
            <img src={logo} alt="COMPUCOSTA" className="h-10" />
          </div>

          <h2 className={`text-2xl md:text-3xl font-bold mb-4 ${isLogin ? 'text-white' : 'text-red-600'}`}>
            {isLogin ? 'Inicia Sesión' : 'Crea tu Cuenta'}
          </h2>
          
          <div className="mb-4">
            <div className={`h-1 w-16 ${isLogin ? 'bg-white' : 'bg-red-600 opacity-50'}`}></div>
          </div>

          {/* Mostrar errores */}
          {error && (
            <div className="mb-4 p-3 bg-red-800 text-white rounded text-sm">
              {error.message || 'Error de autenticación'}
            </div>
          )}

          {/* Solo mostrar info de demoras para login/registro tradicional */}
          {authLoading && (
            <div className="mb-4 p-3 bg-blue-100 text-blue-800 rounded text-sm">
              <p><strong>Nota:</strong> El primer inicio de sesión puede tardar más tiempo mientras se establece la conexión segura.</p>
            </div>
          )}

          {isLogin ? (
            <>
              <p className="text-white mb-6">Accede a tu cuenta</p>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <input 
                    type="email" 
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Correo" 
                    className="w-full p-3 rounded border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
                    required
                    disabled={authLoading}
                    autoComplete="email"
                  />
                </div>
                <div className="mb-4 relative">
                  <input 
                    type={showLoginPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Contraseña" 
                    className="w-full p-3 rounded border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
                    required
                    disabled={authLoading}
                    autoComplete="current-password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-800 transition-colors"
                    disabled={authLoading}
                  >
                    {showLoginPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <div className="mb-6 flex items-center">
                  <input 
                    type="checkbox" 
                    id="remember" 
                    className="mr-2 h-4 w-4 text-yellow-400 border-yellow-400 focus:ring-yellow-400"
                    disabled={authLoading}
                  />
                  <label htmlFor="remember" className="text-white text-sm">Recuérdame</label>
                </div>
                <button 
                  type="submit" 
                  disabled={authLoading}
                  className="w-full bg-white hover:bg-gray-100 text-red-600 font-bold py-3 px-4 rounded transition duration-300 border-2 border-yellow-400 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {authLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mr-2"></div>
                      <span>Iniciando sesión...</span>
                    </div>
                  ) : (
                    "Iniciar Sesión"
                  )}
                </button>
              </form>
              
              <div className="mt-6">
                <div className="flex items-center justify-center">
                  <div className="h-px w-full bg-white/30"></div>
                  <p className="text-white px-3">O</p>
                  <div className="h-px w-full bg-white/30"></div>
                </div>
                
                {/* BOTÓN DE GOOGLE SIMPLE - SIN ANIMACIONES */}
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full mt-4 bg-white hover:bg-gray-100 text-black font-semibold py-3 px-4 rounded flex items-center justify-center transition duration-300 border-2 border-yellow-400"
                >
                  <FcGoogle className="text-xl mr-2" />
                  Continuar con Google
                </button>
              </div>
              
              <p className="text-white text-sm mt-6 cursor-pointer hover:underline">
                ¿Olvidó su contraseña?
              </p>

              <div className="mt-8 md:hidden">
                <p className="text-white mb-3">¿Aún no tienes Cuenta?</p>
                <button 
                  onClick={toggleForm}
                  disabled={authLoading}
                  className="bg-white text-red-600 font-bold py-2 px-4 rounded hover:bg-gray-100 transition duration-300 border-2 border-yellow-400 disabled:opacity-50"
                >
                  Crear tu cuenta
                </button>
              </div>
            </>
          ) : (
            <>
              <p className="text-red-600 mb-6">Crea tu cuenta ahora y realiza tus compras con total confianza</p>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <input 
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    placeholder="Nombre" 
                    className="w-full p-3 rounded border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
                    required
                    disabled={authLoading}
                    autoComplete="given-name"
                  />
                </div>
                <div className="mb-4">
                  <input 
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Apellido" 
                    className="w-full p-3 rounded border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
                    required
                    disabled={authLoading}
                    autoComplete="family-name"
                  />
                </div>
                <div className="mb-4">
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Correo electrónico" 
                    className="w-full p-3 rounded border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
                    required
                    disabled={authLoading}
                    autoComplete="email"
                  />
                </div>
                <div className="mb-4 relative">
                  <input 
                    type={showRegisterPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Contraseña" 
                    className="w-full p-3 rounded border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
                    required
                    disabled={authLoading}
                    autoComplete="new-password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-800 transition-colors"
                    disabled={authLoading}
                  >
                    {showRegisterPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <div className="mb-4 relative">
                  <input 
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Confirmar contraseña" 
                    className="w-full p-3 rounded border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 transition-colors"
                    required
                    disabled={authLoading}
                    autoComplete="new-password"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600 hover:text-red-800 transition-colors"
                    disabled={authLoading}
                  >
                    {showConfirmPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <button 
                  type="submit" 
                  disabled={authLoading}
                  className="w-full bg-white hover:bg-gray-100 text-red-600 font-bold py-3 px-4 rounded transition duration-300 border-2 border-yellow-400 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                  {authLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600 mr-2"></div>
                      <span>Creando cuenta...</span>
                    </div>
                  ) : (
                    "Crear tu cuenta"
                  )}
                </button>
              </form>
              
              <div className="mt-6">
                <div className="flex items-center justify-center">
                  <div className="h-px w-full bg-red-600/30"></div>
                  <p className="text-red-600 px-3">O</p>
                  <div className="h-px w-full bg-red-600/30"></div>
                </div>
                
                {/* BOTÓN DE GOOGLE SIMPLE PARA REGISTRO */}
                <button 
                  onClick={handleGoogleLogin}
                  className="w-full mt-4 bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded flex items-center justify-center transition duration-300 border-2 border-yellow-400"
                >
                  <FcGoogle className="text-xl mr-2" />
                  Continuar con Google
                </button>
              </div>
              
              <p className="text-red-600 text-xs mt-6">
                Al registrarte, aceptas nuestros <a href="#" className="underline hover:text-red-800">Términos y Condiciones</a> y <a href="#" className="underline hover:text-red-800">Política de Privacidad</a>.
              </p>

              <div className="mt-8 md:hidden">
                <p className="text-red-600 mb-3">¿Ya tienes una cuenta?</p>
                <button 
                  onClick={toggleForm}
                  disabled={authLoading}
                  className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition duration-300 border-2 border-yellow-400 disabled:opacity-50"
                >
                  Iniciar Sesión
                </button>
              </div>
            </>
          )}
        </div>

        {/* Panel secundario - Solo visible en pantallas medianas y grandes */}
        <div className={`hidden md:block md:w-1/2 p-8 transition-all duration-500 ${!isLogin ? 'bg-red-600' : 'bg-white'}`}>
          <h2 className={`text-3xl font-bold mb-6 ${!isLogin ? 'text-white' : 'text-red-600'}`}>
            {!isLogin ? '¡Bienvenido!' : '¿Aún no tienes Cuenta?'}
          </h2>
          
          <div className="mb-6">
            <div className={`h-1 w-16 ${!isLogin ? 'bg-white' : 'bg-red-600 opacity-50'}`}></div>
          </div>

          <div className="flex flex-col items-start justify-center h-full">
            <p className={`${!isLogin ? 'text-white' : 'text-red-600'} mb-4`}>
              {!isLogin 
                ? 'Gracias por unirte a nuestra comunidad. Estamos emocionados de tenerte con nosotros.' 
                : 'Crea tu cuenta ahora y realiza tus compras con total confianza'}
            </p>
            <button 
              onClick={toggleForm}
              disabled={authLoading}
              className={`${!isLogin 
                ? 'bg-white text-red-600 hover:bg-gray-100' 
                : 'bg-red-600 text-white hover:bg-red-700'} 
                font-bold py-3 px-6 rounded transition duration-300 border-2 border-yellow-400 mt-4 disabled:opacity-50`}
            >
              {!isLogin ? 'Ya tengo una cuenta' : 'Crear tu cuenta'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Registration;