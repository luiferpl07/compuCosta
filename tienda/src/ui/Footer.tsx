import React from 'react';
import { Link } from 'react-router-dom';
import Container from "./Container";
import { logo } from "../assets";

const Footer = () => {
  return (
    <div className="bg-textoBlanco text-textoNegro py-6">
      <Container className="flex flex-col md:flex-row items-center gap-4 justify-between">
        <div className="flex items-center gap-4">
          <p className="text-sm md:text-base">@2024 ParqueSoft. Todos los derechos reservados.</p>
          <Link to="/Acerca de Nosotros" className="text-sm md:text-base text-red-600 hover:text-red-700 transition-colors">
            Acerca de Nosotros
          </Link>
        </div>
        <img src={logo} alt="ParqueSoft Logo" className="w-40 h-auto object-contain" />
      </Container>
    </div>
  );
};

export default Footer;