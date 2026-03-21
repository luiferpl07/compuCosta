import { useNavigate } from "react-router-dom";
import { auth } from "../lib/firebase";
import { FiEdit, FiMapPin, FiLogOut, FiMail } from "react-icons/fi";

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
      <div className="py-10 text-center">
        <p className="text-gray-500 text-lg">No hay usuario autenticado</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Banner */}
      <div className="h-32 bg-gradient-to-r from-red-600 to-red-800 relative">
        <div className="absolute -bottom-12 left-6 sm:left-10">
          <div className="bg-white p-1 rounded-full shadow-md">
            <img
              src={currentUser.avatar || "https://i.ibb.co/mJRkRRV/png-clipart-profile-logo-computer-icons-user-user-blue-heroes-thumbnail.png"}
              alt="Avatar del usuario"
              className="w-24 h-24 rounded-full object-cover border-4 border-white"
            />
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="pt-16 pb-8 px-6 sm:px-10">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            {currentUser.firstName} {currentUser.lastName || ""}
          </h2>
          <div className="flex items-center text-gray-500 mt-2 gap-2 font-medium">
            <FiMail className="w-5 h-5 text-red-500" />
            <span>{currentUser.email}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <button
            onClick={() => navigate("/perfil/editar")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-50 text-gray-700 rounded-xl hover:bg-gray-100 font-semibold transition-colors border border-gray-200"
          >
            <FiEdit className="w-5 h-5" />
            <span>Editar perfil</span>
          </button>
          
          <button
            onClick={() => navigate("/perfil/direccion")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-red-50 text-red-700 rounded-xl hover:bg-red-100 font-semibold transition-colors border border-red-100"
          >
            <FiMapPin className="w-5 h-5" />
            <span>Mis Direcciones</span>
          </button>
          
          <button
            onClick={() => {
              auth.signOut();
              navigate("/");
            }}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 text-white rounded-xl hover:bg-gray-800 font-semibold transition-colors shadow-sm"
          >
            <FiLogOut className="w-5 h-5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserInfo;