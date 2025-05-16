import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const AddAddress = () => {
  const navigate = useNavigate();
  const [address, setAddress] = useState({
    street: "",
    city: "",
    zip: "",
  });
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddress({
      ...address,
      [e.target.name]: e.target.value,
    });
  };

  const handleGoBack = () => {
    navigate(-1); // Retrocede a la página anterior
  };

  const handleCancel = () => {
    navigate(-1); // Retrocede a la página anterior
  };

  const handleSaveAddress = () => {
    setSaving(true);
    setSaveMessage("");
    
    try {
      console.log("Dirección agregada:", address);
      
      // Aquí iría el código para guardar la dirección en tu backend
      
      setSaveMessage("Dirección guardada correctamente");
      
      // Navegamos de regreso después de guardar con éxito
      setTimeout(() => {
        navigate(-1);
      }, 1500);
    } catch (error) {
      console.error("Error guardando dirección:", error);
      setSaveMessage("Error al guardar la dirección");
    } finally {
      setSaving(false);
    }
  };

  const isFormValid = () => {
    return address.street.trim() !== "" && 
           address.city.trim() !== "" && 
           address.zip.trim() !== "";
  };

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
        <h2 className="text-2xl text-red-600 font-bold">Agregar Dirección</h2>
      </div>
      
      {saveMessage && (
        <div className="mb-4 p-2 bg-gray-100 border rounded">
          {saveMessage}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block mb-2 text-red-700">Calle</label>
        <input
          type="text"
          name="street"
          placeholder="Calle y número"
          value={address.street}
          onChange={handleChange}
          className="border-2 border-red-300 p-2 w-full rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-2 text-red-700">Ciudad</label>
        <input
          type="text"
          name="city"
          placeholder="Ciudad"
          value={address.city}
          onChange={handleChange}
          className="border-2 border-red-300 p-2 w-full rounded"
        />
      </div>
      
      <div className="mb-4">
        <label className="block mb-2 text-red-700">Código Postal</label>
        <input
          type="text"
          name="zip"
          placeholder="Código Postal"
          value={address.zip}
          onChange={handleChange}
          className="border-2 border-red-300 p-2 w-full rounded"
        />
      </div>
      
      <div className="flex space-x-4">
        <button 
          onClick={handleSaveAddress}
          disabled={saving || !isFormValid()}
          className={`text-white p-2 rounded-md ${
            !isFormValid() 
              ? "bg-red-300 cursor-not-allowed" 
              : "bg-red-600 hover:bg-red-700"
          }`}
        >
          {saving ? "Guardando..." : "Guardar dirección"}
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

export default AddAddress;