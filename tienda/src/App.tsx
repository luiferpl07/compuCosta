import React from "react";

import BannerContacto from "./ui/BannerContacto";
import HomeBanner from "./ui/HomeBanner";
import ProductList from "./ui/ListaProductos";
import DiscountedBanner from "./ui/DiscountedBanner";
import { AuthProvider } from './context/AuthContext';
import Footer from "./ui/Footer";
import ChatBot from "./ui/ChatBot";
import ProductoDestacado from "./ui/ProductoDestacado";
import FooterTop from "./ui/FooterTop";

function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
        <main className="flex-grow">
          <div className="space-y-8 lg:space-y-16">
            
            {/* Sección de Banners */}
            <section className="w-full">
              <HomeBanner />
              <div className="py-4">
                <BannerContacto />
              </div>
            </section>

            {/* Sección de Producto Destacado */}
            <section className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
              <ProductoDestacado />
            </section>

            {/* Sección de Lista de Productos */}
            <section className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
              <ProductList />
            </section>

            {/* Sección de Banner de Descuentos */}
            <section className="w-full">
              <DiscountedBanner />
            </section>

            <section className="w-full">
              <FooterTop />
            </section>
          </div>
        </main>
        {/* ChatBot flotante */}
        <ChatBot />
      </div>
    </AuthProvider>
  );
}

export default App;
