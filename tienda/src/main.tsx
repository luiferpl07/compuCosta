import { lazy, Suspense } from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import { AuthProvider } from "./context/AuthContext";
import { ShopifyProvider } from "./context/ShopifyContext.tsx";
import Layout from "./ui/Layout.tsx";
import { createBrowserRouter, Outlet, RouterProvider } from "react-router-dom";
import { disableConsoleInProduction } from "../utils/disableConsole.ts";
import LoadingSpinner from "./ui/Loading.tsx";
disableConsoleInProduction();
const App = lazy(() => import("./App.tsx"));
const Producto = lazy(() => import("./pages/Producto.tsx"));
const Categoria = lazy(() => import("./pages/Categoria.tsx"));
const Perfil = lazy(() => import("./pages/Perfil.tsx"));
const Carrito = lazy(() => import("./pages/Carrito.tsx"));
const Cancelar = lazy(() => import("./pages/Cancelar.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));
const Servicio = lazy(() => import("./pages/Servicio.tsx"));
const Favorito = lazy(() => import("./pages/Favorito.tsx"));
const Contacto = lazy(() => import("./pages/Contacto.tsx"));
const Success = lazy(() => import("./pages/Success.tsx"));
const EditProfile = lazy(() => import("./ui/EditProfile.tsx"));
const AddAddress = lazy(() => import("./ui/AddAddress.tsx"));
const AcercaDeNosotros = lazy(() => import("./pages/Info.tsx"));


const RouterLayout = () => {
  return (
    <Layout>
      <Suspense fallback={<LoadingSpinner />}>
        <Outlet />
      </Suspense>
    </Layout>
  );
};


const router = createBrowserRouter([
  {
    path: "/",
    element: <RouterLayout />,
    children: [
      { path: "/", element: <App /> },
      { path: "/carrito", element: <Carrito /> },
      { path: "/perfil", element: <Perfil /> },
      { path: "/perfil/editar", element: <EditProfile /> },
      { path: "/perfil/direccion", element: <AddAddress /> },
      { path: "/productos", element: <Producto /> },
      { path: "/productos/:id", element: <Producto /> },
      { path: "/favorito", element: <Favorito /> },
      { path: "/categorias", element: <Categoria /> },
      { path: "/categorias/:id", element: <Categoria /> },
      { path: "/cancelar", element: <Cancelar /> },
      { path: "/success", element: <Success /> },
      { path: "/contacto", element: <Contacto /> },
      { path: "/servicio", element: <Servicio /> },
      { path: "/acerca-de-nosotros", element: <AcercaDeNosotros /> },
      { path: "*", element: <NotFound /> },
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
