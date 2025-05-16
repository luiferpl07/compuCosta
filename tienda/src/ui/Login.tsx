import React, { useState } from 'react';
import { FcGoogle } from 'react-icons/fc';
import { useAuth } from '../context/AuthContext';
import { logo } from "../assets";

interface LoginProps {
  onToggleAuth: () => void;
}

const Login: React.FC<LoginProps> = ({ onToggleAuth }) => {
  const { login, loginWithGoogle, error, loading, clearError } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError(); // Clear any previous errors
    
    try {
      // Call the login function from your auth context
      await login({
        email: formData.email,
        password: formData.password
      });
      // If successful, redirect will be handled by your auth state observer
    } catch (err) {
      console.error("Error al iniciar sesión:", err);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      await loginWithGoogle();
      // Redirect will be handled by your auth state observer
    } catch (err) {
      console.error("Error al iniciar sesión con Google:", err);
    }
  };

  return (
    <div className="w-full p-12 bg-red-600 rounded-lg shadow-xl">
      <div className="flex items-center mb-8">
        <img src={logo} alt="COMPUCOSTA" className="h-12 text-white" />
      </div>

      <h2 className="text-3xl font-bold mb-6 text-white">
        Inicia Sesión
      </h2>
      
      <div className="mb-6">
        <div className="h-1 w-16 bg-white"></div>
      </div>

      <p className="text-white mb-8">Accede a tu cuenta</p>
      
      {error && (
        <div className="mb-4 p-3 bg-red-800 text-white rounded">
          {error.message}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <input 
            type="email" 
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Correo" 
            className="w-full p-3 rounded border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            required
          />
        </div>
        <div className="mb-4 relative">
          <input 
            type={showPassword ? "text" : "password"}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Contraseña" 
            className="w-full p-3 rounded border-2 border-yellow-400 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400"
            required
          />
          <button 
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-600"
          >
            {showPassword ? "Ocultar" : "Mostrar"}
          </button>
        </div>
        <div className="mb-6 flex items-center">
          <input 
            type="checkbox" 
            id="rememberMe"
            name="rememberMe"
            checked={formData.rememberMe}
            onChange={handleChange}
            className="mr-2 h-4 w-4 text-yellow-400 border-yellow-400 focus:ring-yellow-400"
          />
          <label htmlFor="rememberMe" className="text-white text-sm">Recuérdame</label>
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-white hover:bg-gray-100 text-red-600 font-bold py-3 px-4 rounded transition duration-300 border-2 border-yellow-400 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {loading ? "Procesando..." : "Iniciar Sesión"}
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
          disabled={loading}
          className="w-full mt-4 bg-white hover:bg-gray-100 text-black font-semibold py-3 px-4 rounded flex items-center justify-center transition duration-300 border-2 border-yellow-400 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          <FcGoogle className="text-xl mr-2" />
          Continuar con Google
        </button>
      </div>
      
      <p className="text-white text-sm mt-6 cursor-pointer hover:underline">
        ¿Olvidó su contraseña?
      </p>
      
      <p className="text-white text-sm mt-4 text-center">
        ¿No tienes una cuenta? <button onClick={onToggleAuth} className="underline hover:text-gray-300">Crear cuenta</button>
      </p>
    </div>
  );
};

export default Login;