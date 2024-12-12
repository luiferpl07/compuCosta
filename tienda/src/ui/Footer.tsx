import React from "react";
import { useLocation } from "react-router-dom"; // Importa useLocation
import Container from "./Container";
import { logo } from "../assets";
import FooterTop from "./FooterTop";

const Footer = () => {
  const location = useLocation(); // Obtiene la ruta actual

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh", // Asegura que el contenedor principal ocupe toda la altura
      }}
    >
      {/* Si estamos en la página principal, muestra FooterTop */}
      {location.pathname === "/" && <FooterTop />}
      <div
        style={{
          marginTop: "auto", // Empuja el footer al final si no hay suficiente contenido
        }}
        className="py-4 border-t border-gray-200 bg-white"
      >
        <Container className="flex flex-col md:flex-row items-center gap-4 justify-between">
          <p>@2024 parquesoft. Todos los derechos reservados.</p>
          <img src={logo} alt="logo" className="w-45 h-24 object-contain" />
        </Container>
      </div>
    </div>
  );
};

export default Footer;
