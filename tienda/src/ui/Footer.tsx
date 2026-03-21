import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import Container from "./Container";
import { logo } from "../assets";

const Footer = () => {
  return (
    <div className="bg-white text-gray-800 border-t border-gray-200">
      <Container className="py-8">
        {/* Sección principal - más compacta */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Logo y redes sociales */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center">
              <img src={logo} alt="Compucosta Logo" className="w-28 h-auto object-contain" />
            </div>
            
            {/* Redes sociales */}
            <div className="flex flex-col gap-2">
              <h4 className="text-gray-800 font-semibold text-base">Síguenos</h4>
              <div className="flex gap-3">
                <a 
                  href="https://www.facebook.com/profile.php?id=100067652344787" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                >
                  <Facebook className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.instagram.com/compucosta" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="p-2 bg-pink-50 text-pink-600 hover:bg-pink-100 rounded-lg transition-colors"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>

          {/* Información de contacto */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-semibold text-gray-800">Contáctanos</h3>
            <div className="flex flex-col gap-2 text-base">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <span className="text-gray-600">Cr20 19-09 Ford, Sincelejo</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                <span className="text-gray-600">Centro Comercial Guacari, Sincelejo</span>
              </div>

              <div className="flex items-center gap-2">
                <Phone className="w-5 h-5 text-red-600" />
                <div className="flex flex-col">
                  <a href="tel:+573106206752" className="text-gray-600 hover:text-red-600 transition-colors">
                    +57 310 620 6752
                  </a>
                  <a href="tel:+573126790330" className="text-gray-600 hover:text-red-600 transition-colors">
                    +57 312 679 0330
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-600" />
                <a 
                  href="mailto:compucostacomercial@gmail.com" 
                  className="text-gray-600 hover:text-red-600 transition-colors text-sm"
                >
                  compucostacomercial@gmail.com
                </a>
              </div>
            </div>
          </div>
          {/* Enlaces rápidos */}
          <div className="flex flex-col gap-3">
            <h3 className="text-xl font-semibold text-gray-800">Enlaces</h3>
            <div className="flex flex-col gap-1 text-base">
              <Link 
                to="/Servicio" 
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                Servicios
              </Link>
              <Link 
                to="/productos" 
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                Productos
              </Link>
              <Link 
                to="/acerca-de-nosotros" 
                className="text-gray-600 hover:text-red-600 transition-colors"
              >
                Acerca de Nosotros
              </Link>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="my-6">
          <div className="h-px bg-gray-200"></div>
        </div>

        {/* Sección inferior */}
        <div className="flex flex-col md:flex-row items-center gap-2 justify-between text-base">
          <p className="text-gray-500">
            © 2025 Compucosta. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-2">
            <span className="text-gray-500">Desarrollado por</span>
            <span className="text-red-600 font-semibold">ParqueSoft Sucre</span>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Footer;