import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, MapPin, Phone, Mail } from 'lucide-react';
import Container from "./Container";
import { logo } from "../assets";

const Footer = () => {
  return (
    <div className="bg-white text-gray-800 border-t border-gray-200">
      <Container className="py-12">
        {/* Propuesta: misma paleta, logos y acceso a redes más grandes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 items-start">

          {/* Logo y redes sociales (más grandes) */}
          <div className="flex flex-col gap-4">
              <div className="flex items-center">
              <img src={logo} alt="Compucosta Logo" className="w-48 sm:w-56 md:w-64 h-auto object-contain" />
            </div>
            <p className="text-gray-600 max-w-sm">Equipos, repuestos y servicio técnico con atención local. Síguenos para ofertas y novedades.</p>

            {/* Redes sociales con mayor tamaño y botones descriptivos */}
            <div className="flex flex-col gap-3 mt-2">
              <h4 className="text-gray-800 font-semibold text-lg">Síguenos</h4>
              <div className="flex flex-wrap gap-3 mt-1">
                <a
                  href="https://www.facebook.com/profile.php?id=100067652344787"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                  aria-label="Facebook Compucosta"
                >
                  <Facebook className="w-6 h-6 text-blue-600" />
                  <span className="text-sm text-gray-800 font-medium">Facebook</span>
                </a>

                <a
                  href="https://www.instagram.com/compucosta"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 px-4 py-3 bg-pink-50 hover:bg-pink-100 rounded-lg transition-colors"
                  aria-label="Instagram Compucosta"
                >
                  <Instagram className="w-6 h-6 text-pink-600" />
                  <span className="text-sm text-gray-800 font-medium">Instagram</span>
                </a>
              </div>
            </div>
          </div>

          {/* Información de contacto (más legible) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-semibold text-gray-800">Contáctanos</h3>
            <div className="flex flex-col gap-3 text-base text-gray-700">
              <div className="flex items-start gap-3">
                <MapPin className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div>
                  <div className="font-medium">Cr20 19-09 Ford, Sincelejo</div>
                  <div className="text-sm text-gray-600">Centro Comercial Guacari, Sincelejo</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Phone className="w-6 h-6 text-red-600 flex-shrink-0" />
                <div className="flex flex-col">
                  <a href="tel:+573106206752" className="hover:text-red-600">+57 310 620 6752</a>
                  <a href="tel:+573126790330" className="hover:text-red-600">+57 312 679 0330</a>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <Mail className="w-6 h-6 text-red-600 flex-shrink-0" />
                <a
                  href="mailto:compucostacomercial@gmail.com"
                  className="hover:text-red-600 text-sm"
                >
                  compucostacomercial@gmail.com
                </a>
              </div>
            </div>
          </div>

          {/* Enlaces (más visibles) */}
          <div className="flex flex-col gap-4">
            <h3 className="text-2xl font-semibold text-gray-800">Enlaces</h3>
            <div className="flex flex-col gap-3 text-base">
              <Link to="/Servicio" className="text-gray-700 hover:text-red-600 transition-colors font-medium">Servicios</Link>
              <Link to="/productos" className="text-gray-700 hover:text-red-600 transition-colors font-medium">Productos</Link>
              <Link to="/acerca-de-nosotros" className="text-gray-700 hover:text-red-600 transition-colors font-medium">Acerca de Nosotros</Link>
              <Link to="/Contacto" className="text-gray-700 hover:text-red-600 transition-colors font-medium">Contacto</Link>
            </div>
          </div>
        </div>

        {/* Línea divisoria */}
        <div className="my-8">
          <div className="h-px bg-gray-200"></div>
        </div>

        {/* Sección inferior */}
        <div className="flex flex-col md:flex-row items-center gap-4 justify-between text-base text-gray-600">
          <p>
            © {new Date().getFullYear()} Compucosta. Todos los derechos reservados.
          </p>
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <span>Desarrollado por</span>
            <span className="text-red-600 font-semibold">ParqueSoft Sucre</span>
          </div>
        </div>
      </Container>
    </div>
  );
};

export default Footer;