import React, { useState, useEffect, ChangeEvent, FormEvent } from 'react';
import { 
  Phone, 
  Mail, 
  User, 
  MessageCircle 
} from 'lucide-react';

interface FormData {
  nombre: string;
  email: string;
  telefono: string;
  mensaje: string;
}

const WhatsAppContactForm: React.FC = () => {
  const [formData, setFormData] = useState<FormData>({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: ''
  });

  // Array de números de WhatsApp (reemplazar con tus números)
  const whatsappNumeros = [
    '+573157130127',
    '+573106206758',
    '+573126790330'
  ];

  // Estado para mantener el contador de distribución
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Efecto para inicializar el índice con un valor aleatorio al cargar
  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * whatsappNumeros.length);
    setCurrentIndex(randomIndex);
  }, []);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    const { nombre, telefono, mensaje } = formData;
    const whatsappMessage = `Hola, mi nombre es ${nombre}. Número de contacto: ${telefono}. Mensaje: ${mensaje}`;
    const encodedMessage = encodeURIComponent(whatsappMessage);
    
    // Obtener el número actual y actualizar el índice para la próxima vez
    const numeroActual = whatsappNumeros[currentIndex];
    
    // Actualizar el índice de forma circular
    setCurrentIndex((prevIndex) => (prevIndex + 1) % whatsappNumeros.length);
    
    // Redirigir a WhatsApp
    window.open(`https://wa.me/${numeroActual}?text=${encodedMessage}`, '_blank');
    
    // Limpiar el formulario
    setFormData({
      nombre: '',
      email: '',
      telefono: '',
      mensaje: ''
    });
  };

  return (
    <div className="min-h-screen bg-textoBlanco flex items-center justify-center p-4">
  <div className="w-full max-w-md bg-white shadow-2xl rounded-3xl overflow-hidden">
    {/* Encabezado con efecto degradado */}
    <div className="bg-textoRojo p-6 text-center">
      <h2 className="text-3xl font-bold text-white">Contáctanos</h2>
      <p className="text-white/80 mt-2">Estamos listos para escucharte</p>
    </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Campo de Nombre */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <User className="text-gray-400" />
            </div>
            <input 
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="Nombre Completo"
              className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition duration-300 ease-in-out"
              required
            />
          </div>

          {/* Campo de Email */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Mail className="text-gray-400" />
            </div>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Correo Electrónico"
              className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition duration-300 ease-in-out"
              required
            />
          </div>

          {/* Campo de Teléfono */}
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Phone className="text-gray-400" />
            </div>
            <input 
              type="tel"
              name="telefono"
              value={formData.telefono}
              onChange={handleChange}
              placeholder="Número de Teléfono"
              className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition duration-300 ease-in-out"
              required
            />
          </div>

          {/* Área de Mensaje */}
          <div className="relative">
            <div className="absolute top-3 left-0 pl-3 pointer-events-none">
              <MessageCircle className="text-gray-400" />
            </div>
            <textarea 
              name="mensaje"
              value={formData.mensaje}
              onChange={handleChange}
              placeholder="Escribe tu mensaje..."
              rows={4}
              className="w-full pl-10 pr-3 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:border-blue-500 transition duration-300 ease-in-out resize-none"
              required
            />
          </div>

          {/* Botón de Envío */}
          <button 
            type="submit"
            className="w-full flex items-center justify-center bg-green-500 text-white py-3 rounded-xl hover:bg-green-600 transition duration-300 ease-in-out space-x-2"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              viewBox="0 0 24 24" 
              fill="currentColor"
              className="mr-2"
            >
              <path d="M12.036 5.339c-3.635 0-6.597 2.632-6.597 5.875 0 1.309.454 2.705 1.225 3.713L7.15 17.504l2.116-1.958c.734.233 1.517.363 2.34.363 3.635 0 6.591-2.631 6.591-5.868 0-3.263-2.955-5.895-6.59-5.895zm0 10.964c-.84 0-1.629-.153-2.348-.437l-2.916 1.91 1.658-3.608c-.845-1.03-1.348-2.364-1.348-3.8 0-3.14 2.941-5.686 6.591-5.686 3.65 0 6.593 2.546 6.593 5.686-.001 3.14-2.943 5.688-6.593 5.688zM12.667 7.263c1.273 0 2.3 1.042 2.3 2.33s-1.027 2.329-2.3 2.329c-1.274 0-2.301-1.042-2.301-2.33s1.028-2.329 2.301-2.329z" />
            </svg>
            <span>Enviar Mensaje</span>
          </button>
        </form>

        {/* Pie de formulario */}
        <div className="bg-gray-100 p-4 text-center text-sm text-gray-500">
          Nos pondremos en contacto contigo lo antes posible
        </div>
      </div>
    </div>
  );
};

export default WhatsAppContactForm;