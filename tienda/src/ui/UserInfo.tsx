import { useNavigate } from "react-router-dom";

import { auth } from "../lib/firebase";
import Container from "./Container";

interface UserType {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
}

const UserInfo = ({ currentUser }: { currentUser: UserType | null }) => {
  const navigate = useNavigate();

  if (!currentUser) {
    return (
      <Container className="py-5 text-white">
        <p className="text-center text-lg">No hay usuario autenticado</p>
      </Container>
    );
  }

  return (
    <Container className="py-5 text-white">
      <div className="relative isolate overflow-hidden bg-gray-900 px-4 py-8 shadow-2xl sm:px-6 sm:py-12 md:px-8 md:py-16 lg:px-16 lg:py-24 sm:rounded-3xl">
        <div className="flex flex-col items-center gap-5 sm:gap-8 md:gap-10">
          <img
            src={
              currentUser.avatar ||
              "https://i.ibb.co/mJRkRRV/png-clipart-profile-logo-computer-icons-user-user-blue-heroes-thumbnail.png"
            }
            alt="userImage"
            className="w-24 h-24 sm:w-32 sm:h-32 md:w-40 md:h-40 rounded-full border border-gray-700 object-cover p-1"
          />
          <div className="text-center md:text-start w-full">
            <h2 className="text-xl font-bold tracking-tight sm:text-2xl md:text-3xl lg:text-4xl">
              Bienvenido{" "}
              <span className="underline underline-offset-2 decoration-[1px] font-medium">
                {currentUser.firstName} {currentUser.lastName || ""}
              </span>
            </h2>
            <p className="mt-3 max-w-3xl text-sm sm:text-base leading-6 text-gray-300 text-center md:text-start">
              Correo electrónico: {currentUser.email}
            </p>
          </div>
        </div>
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 md:gap-x-5 px-2 sm:px-4">
          <button
            onClick={() => navigate("/perfil/editar")}
            className="w-full sm:w-auto rounded-md bg-white px-6 sm:px-8 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100"
          >
            Editar perfil
          </button>
          <button
            onClick={() => navigate("/perfil/direccion")}
            className="w-full sm:w-auto rounded-md bg-white px-6 sm:px-8 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100"
          >
            Agregar dirección
          </button>
          <button
            onClick={() => {
              auth.signOut();
              navigate("/"); // Redirigir a la página principal después de cerrar sesión
            }}
            className="w-full sm:w-auto rounded-md bg-white px-6 sm:px-8 py-2.5 text-sm font-semibold text-gray-900 hover:bg-gray-100"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </Container>
  );
};

export default UserInfo;