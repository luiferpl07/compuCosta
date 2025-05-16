import React from "react";
import "react-multi-carousel/lib/styles.css";
import BannerContacto from "./ui/BannerContacto";
import HomeBanner from "./ui/HomeBanner";

import ProductList from "./ui/ListaProductos";
import DiscountedBanner from "./ui/DiscountedBanner";
import { AuthProvider } from './context/AuthContext';
import FooterTop from "./ui/FooterTop";
import ChatBot from "./ui/ChatBot";
import ProductoDestacado from "./ui/ProductoDestacado";


function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen flex flex-col bg-gray-50 overflow-x-hidden">
        <main className="flex-grow">
          <div className="space-y-6 sm:space-y-8 lg:space-y-12 py-4">
            
            {/* Sección de Banners */}
            <section className="w-full">
              <HomeBanner />
              <br />
              <BannerContacto />
            </section>

            {/* Sección de Categorías */}
            <section className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
              <ProductoDestacado />
            </section>

            {/* Sección de Productos */}
            <section className="container max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
              <ProductList />
            </section>

            {/* Sección de Banner de Descuentos */}
            <section className="w-full">
              <DiscountedBanner />
            </section>

            {/* Sección de FooterTop */}
            <section className="w-full">
              <FooterTop />
            </section>

            {/* ChatBot */}
            <ChatBot />
          </div>
        </main>
      </div>
    </AuthProvider>
  );
}


export default App;