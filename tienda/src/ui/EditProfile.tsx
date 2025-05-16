import { useState, useEffect } from "react";
import { getAuth, updateProfile } from "firebase/auth";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const EditProfile = () => {
  const [profile, setProfile] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");
  const [fullNameInFirstName, setFullNameInFirstName] = useState(false); // Por defecto, separamos nombre y apellidos

  const auth = getAuth();
  const navigate = useNavigate();

  // Cargar datos del usuario actual al iniciar
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      if (currentUser.displayName) {
        // Dividimos el nombre completo en palabras
        const nameParts = currentUser.displayName.trim().split(/\s+/);
        
        if (nameParts.length <= 1) {
          // Si solo hay una palabra, todo va en firstName
          setProfile({
            firstName: currentUser.displayName,
            lastName: "",
            email: currentUser.email || "",
          });
        } else if (nameParts.length === 2) {
          // Si hay exactamente dos palabras, asumimos que es nombre y apellido
          setProfile({
            firstName: nameParts[0],
            lastName: nameParts[1],
            email: currentUser.email || "",
          });
        } else {
          // Si hay más de dos palabras, necesitamos identificar correctamente los nombres y apellidos
          // Por convención, asumimos que el último elemento es el apellido
          // y todo lo demás son nombres, pero se puede ajustar según tus necesidades
          
          // Detectamos si tiene dos nombres
          const firstName = nameParts.slice(0, nameParts.length - 1).join(" ");
          const lastName = nameParts[nameParts.length - 1];
          
          setProfile({
            firstName: firstName,
            lastName: lastName,
            email: currentUser.email || "",
          });
        }
      } else {
        setProfile({
          firstName: "",
          lastName: "",
          email: currentUser.email || "",
        });
      }
    }
    setLoading(false);
  }, []);
  
  // Función para cambiar al modo "nombre completo en primer nombre"
  const handleMoveAllToFirstName = () => {
    setFullNameInFirstName(true);
    setProfile({
      ...profile,
      firstName: `${profile.firstName} ${profile.lastName}`.trim(),
      lastName: "",
    });
  };
  
  // Función para separar por último espacio
  const handleSplitNames = () => {
    setFullNameInFirstName(false);
    const fullName = profile.firstName.trim();
    const lastSpaceIndex = fullName.lastIndexOf(" ");
    
    if (lastSpaceIndex !== -1) {
      setProfile({
        ...profile,
        firstName: fullName.substring(0, lastSpaceIndex),
        lastName: fullName.substring(lastSpaceIndex + 1),
      });
    }
  };

  const handleGoBack = () => {
    navigate(-1); // Retrocede a la página anterior
  };

  const handleCancel = () => {
    // Restaurar los datos originales o navegar de regreso
    navigate(-1);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setSaveMessage("");
    
    try {
      const currentUser = auth.currentUser;
      if (currentUser) {
        // Crear displayName apropiado
        let displayName = profile.firstName;
        if (!fullNameInFirstName && profile.lastName && profile.lastName.trim() !== "") {
          displayName += " " + profile.lastName.trim();
        }
        
        // Actualizar displayName en Auth
        await updateProfile(currentUser, {
          displayName: displayName,
        });
        
        setSaveMessage("Perfil actualizado correctamente");
      }
    } catch (error) {
      console.error("Error guardando perfil:", error);
      setSaveMessage("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-5 text-center">
        <p>Cargando...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-5 bg-white border-2 border-red-500 rounded-lg">
      <div className="flex items-center mb-4">
        <button 
          onClick={handleGoBack}
          className="mr-2 p-2 hover:bg-gray-100 rounded-full"
          aria-label="Regresar"
        >
          <ArrowLeft size={20} className="text-red-600" />
        </button>
        <h2 className="text-2xl text-red-600 font-bold">Editar Perfil</h2>
      </div>
      
      {saveMessage && (
        <div className="mb-4 p-2 bg-gray-100 border rounded">
          {saveMessage}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block mb-2 text-red-700">Nombre{fullNameInFirstName ? " completo" : ""}</label>
        <input
          type="text"
          name="firstName"
          value={profile.firstName}
          onChange={handleChange}
          className="border-2 border-red-300 p-2 w-full rounded"
          placeholder={fullNameInFirstName ? "Nombre completo" : "Nombre(s)"}
        />
      </div>
      
      {!fullNameInFirstName && (
        <div className="mb-4">
          <label className="block mb-2 text-red-700">Apellido(s)</label>
          <input
            type="text"
            name="lastName"
            value={profile.lastName}
            onChange={handleChange}
            className="border-2 border-red-300 p-2 w-full rounded"
            placeholder="Apellido(s)"
          />
        </div>
      )}
      
      <div className="mb-4 flex flex-wrap gap-2">
        {!fullNameInFirstName ? (
          <button 
            type="button"
            onClick={handleMoveAllToFirstName}
            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 p-1 rounded"
          >
            Usar un solo campo para nombre completo
          </button>
        ) : (
          <button 
            type="button"
            onClick={handleSplitNames}
            className="text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 p-1 rounded"
          >
            Separar nombre y apellido
          </button>
        )}
      </div>
      
      <div className="mb-4">
        <label className="block mb-2 text-red-700">Correo Electrónico</label>
        <input
          type="email"
          name="email"
          value={profile.email}
          disabled
          className="border p-2 w-full bg-gray-100 text-gray-500 rounded"
        />
      </div>
      
      <div className="flex space-x-4">
        <button 
          onClick={handleSave}
          disabled={saving || !profile.firstName.trim()}
          className={`text-white p-2 rounded-md ${
            !profile.firstName.trim() 
              ? "bg-red-300 cursor-not-allowed" 
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {saving ? "Guardando..." : "Guardar cambios"}
        </button>
        
        <button 
          onClick={handleCancel}
          className="border-2 border-red-500 text-red-600 p-2 rounded-md hover:bg-red-50"
        >
          Cancelar
        </button>
      </div>
    </div>
  );
};

export default EditProfile;