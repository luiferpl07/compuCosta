import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext";
import { ShopifyProvider } from "./context/ShopifyContext.tsx"; // ✅ NUEVO IMPORT
import Layout from "./ui/Layout.tsx";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Producto from "./pages/Producto.tsx";
import Categoria from "./pages/Categoria.tsx";
import Perfil from "./pages/Perfil.tsx";
import Carrito from "./pages/Carrito.tsx";
import Cancelar from "./pages/Cancelar.tsx";
import NotFound from "./pages/NotFound.tsx";
import Tiendas from "./pages/Tiendas.tsx";
import Envios from "./pages/Envios.tsx";
import Servicio from "./pages/Servicio.tsx";
import Favorito from "./pages/Favorito.tsx";
import Contacto from "./pages/Contacto.tsx";
import Success from "./pages/Success.tsx";
import EditProfile from "./ui/EditProfile.tsx";
import AddAddress from "./ui/AddAddress.tsx";
import AcercaDeNosotros from "./pages/Info.tsx";
import { disableConsoleInProduction } from '../utils/disableConsole.ts';

disableConsoleInProduction();

const RouterLayout = () => {
  return (
    <Layout>
      <Outlet />
    </Layout>
  );
};

const router = createBrowserRouter([
  {
    path: "/",
    element: <RouterLayout />,
    children: [
      {
        path: "/",
        element: <App />,
      },
      {
        path: "/carrito",
        element: <Carrito />,
      },
      {
        path: "/perfil",
        element: <Perfil />,
      },
      {
        path: "/perfil/editar",
        element: <EditProfile />,
      },
      {
        path: "/perfil/direccion",
        element: <AddAddress />,
      },
      {
        path: "/productos",
        element: <Producto />,
      },
      {
        path: "/productos/:id",
        element: <Producto />,
      },
      {
        path: "/favorito",
        element: <Favorito />,
      },

      {
        path: "/categorias",
        element: <Categoria />,
      },
      {
        path: "/categorias/:id",
        element: <Categoria />,
      },
      {
        path: "/cancelar",
        element: <Cancelar />,
      },
      {
        path: "/success",
        element: <Success />,
      },
      {
        path: "*",
        element: <NotFound />,
      },
      {
        path: "/tiendas",
        element: <Tiendas />,
      },
      {
        path: "/contacto",
        element: <Contacto />,
      },
      {
        path: "/envios",
        element: <Envios />,
      },
      {
        path: "/Servicio",
        element: <Servicio />,
      },
      {
        path: "/acerca-de-nosotros",
        element: <AcercaDeNosotros />,
      },


    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(

  <ShopifyProvider>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </ShopifyProvider>
);