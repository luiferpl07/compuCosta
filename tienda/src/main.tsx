import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./ui/Layout.tsx";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import Producto from "./pages/Producto.tsx";
import Categoria from "./pages/Categoria.tsx";
import Perfil from "./pages/Perfil.tsx";
import Carrito from "./pages/Carrito.tsx";
import Pedidos from "./pages/Pedidos.tsx";
import Cancelar from "./pages/Cancelar.tsx";
import NotFound from "./pages/NotFound.tsx";
import Tiendas from "./pages/Tiendas.tsx";
import Envios from "./pages/Envios.tsx";
import Servicio from "./pages/Servicio.tsx";
import Favorito from "./pages/Favorito.tsx";
import Contacto from "./pages/Contacto.tsx";
import EditProfile from "./ui/EditProfile.tsx"; // Nueva página para editar perfil
import AddAddress from "./ui/AddAddress.tsx"; // Nueva página para agregar dirección
import AcercaDeNosotros from "./pages/Info.tsx";

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
        element: <EditProfile />, // Nueva ruta para editar perfil
      },
      {
        path: "/perfil/direccion",
        element: <AddAddress />, // Nueva ruta para agregar dirección
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
        path: "/pedidos",
        element: <Pedidos />,
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
        path: "/Acerca de Nosotros",
        element: <AcercaDeNosotros />,
      },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <AuthProvider> {/* ✅ Aquí envolvemos toda la app */}
    <RouterProvider router={router} />
  </AuthProvider>
);
