import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { logo } from "../assets";

interface RegistrationProps {
  className?: string;
}

const Registration: React.FC<RegistrationProps> = ({ className = '' }) => {
  const { login, register, loginWithGoogle } = useAuth();
  const [isLogin, setIsLogin] = useState(true);
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const toggleForm = () => {
    setIsLogin(!isLogin);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLogin) {
      try {
        await login({ email: formData.email, password: formData.password });
        console.log("Inicio de sesión exitoso");
      } catch (error) {
        console.error("Error en el inicio de sesión:", error);
      }
    } else {
      if (formData.password !== formData.confirmPassword) {
        console.error("Las contraseñas no coinciden");
        return;
      }
  
      try {
        await register({
          email: formData.email,
          password: formData.password,
          firstName: formData.firstName,
          lastName: formData.lastName,
        });
        console.log("Registro exitoso");
      } catch (error) {
        console.error("Error en el registro:", error);
      }
    }
  };
  
  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      console.log("Inicio de sesión con Google exitoso");
    } catch (error) {
      console.error("Error en el inicio de sesión con Google:", error);
    }
  };

  return (
    <div className={`w-full rounded-lg shadow-md overflow-hidden ${className}`}>
      <div className="flex flex-col md:flex-row w-full">
        {/* Panel de Login/Registro - Se adapta según el tamaño de pantalla */}
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
                    className="w-full p-3 rounded border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
                <div className="mb-4 relative">
                  <input 
                    type={showLoginPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Contraseña" 
                    className="w-full p-3 rounded border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600"
                  >
                    {showLoginPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <div className="mb-6 flex items-center">
                  <input 
                    type="checkbox" 
                    id="remember" 
                    className="mr-2 h-4 w-4 text-yellow-400 border-yellow-400 focus:ring-yellow-400"
                  />
                  <label htmlFor="remember" className="text-white text-sm">Recuérdame</label>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-white hover:bg-gray-100 text-red-600 font-bold py-3 px-4 rounded transition duration-300 border-2 border-yellow-400"
                >
                  Iniciar Sesión
                </button>
              </form>
              
              <div className="mt-6">
                <div className="flex items-center justify-center">
                  <div className="h-px w-full bg-white/30"></div>
                  <p className="text-white px-3">O</p>
                  <div className="h-px w-full bg-white/30"></div>
                </div>
                
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
                  className="bg-white text-red-600 font-bold py-2 px-4 rounded hover:bg-gray-100 transition duration-300 border-2 border-yellow-400"
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
                    className="w-full p-3 rounded border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
                <div className="mb-4">
                  <input 
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    placeholder="Apellido" 
                    className="w-full p-3 rounded border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
                <div className="mb-4">
                  <input 
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Correo electrónico" 
                    className="w-full p-3 rounded border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                </div>
                <div className="mb-4 relative">
                  <input 
                    type={showRegisterPassword ? "text" : "password"}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Contraseña" 
                    className="w-full p-3 rounded border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600"
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
                    className="w-full p-3 rounded border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
                  />
                  <button 
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600"
                  >
                    {showConfirmPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
                <button 
                  type="submit" 
                  className="w-full bg-white hover:bg-gray-100 text-red-600 font-bold py-3 px-4 rounded transition duration-300 border-2 border-yellow-400"
                >
                  Crear tu cuenta
                </button>
              </form>
              
              <div className="mt-6">
                <div className="flex items-center justify-center">
                  <div className="h-px w-full bg-red-600/30"></div>
                  <p className="text-red-600 px-3">O</p>
                  <div className="h-px w-full bg-red-600/30"></div>
                </div>
                
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
                  className="bg-red-600 text-white font-bold py-2 px-4 rounded hover:bg-red-700 transition duration-300 border-2 border-yellow-400"
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
              className={`${!isLogin 
                ? 'bg-white text-red-600 hover:bg-gray-100' 
                : 'bg-red-600 text-white hover:bg-red-700'} 
                font-bold py-3 px-6 rounded transition duration-300 border-2 border-yellow-400 mt-4`}
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