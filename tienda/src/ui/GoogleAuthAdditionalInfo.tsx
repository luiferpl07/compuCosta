// GoogleAuthAdditionalInfo.tsx
import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { InputField } from './InputField';
import { AuthButton } from './AuthButton';
import Container from './Container';

interface AdditionalUserInfo {
  address?: string;
  phoneNumber?: string;
  hasCompletedProfile: boolean;
}

interface GoogleAuthAdditionalInfoProps {
  userId: string;
  onComplete: () => void;
}

const GoogleAuthAdditionalInfo = ({ userId, onComplete }: GoogleAuthAdditionalInfoProps) => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<AdditionalUserInfo>({
    address: '',
    phoneNumber: '',
    hasCompletedProfile: false
  });

  useEffect(() => {
    const checkUserInfo = async () => {
      try {
        const userDoc = await getDoc(doc(db, "users", userId));
        if (userDoc.exists()) {
          const userData = userDoc.data();
          
          // Si el usuario ya completó su perfil, omitimos este paso
          if (userData.hasCompletedProfile) {
            onComplete();
            return;
          }
          
          // Pre-llenar los campos si existen datos
          setFormData({
            address: userData.address || '',
            phoneNumber: userData.phoneNumber || '',
            hasCompletedProfile: false
          });
        }
      } catch (error) {
        console.error("Error al obtener información del usuario:", error);
      } finally {
        setLoading(false);
      }
    };

    checkUserInfo();
  }, [userId, onComplete]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Actualizar los datos del usuario en Firestore
      await updateDoc(doc(db, "users", userId), {
        ...formData,
        hasCompletedProfile: true
      });
      
      // Notificar que se completó el proceso
      onComplete();
    } catch (error) {
      console.error("Error al guardar la información adicional:", error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container className="text-white flex justify-center items-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-500"></div>
      </Container>
    );
  }

  return (
    <div className="bg-gray-950 rounded-lg shadow-xl max-w-2xl mx-auto mt-10">
      <form onSubmit={handleSubmit} className="pt-10 px-6 text-white">
        <div className="flex flex-col items-center border-b border-b-white/10 pb-5">
          <h2 className="text-2xl font-semibold uppercase leading-7">
            Completa tu perfil
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            Proporciona información adicional para mejorar tu experiencia (opcional).
          </p>
        </div>

        <div className="border-b mx-auto border-b-white/10 pb-8 max-w-lg">
          <div className="mt-8 grid grid-cols-1 gap-x-6 gap-y-6">
            <InputField
              label="Dirección"
              name="address"
              value={formData.address || ''}
              onChange={handleChange}
              placeholder="Tu dirección (opcional)"
              autoFocus
            />
            
            <InputField
              label="Número de teléfono"
              name="phoneNumber"
              value={formData.phoneNumber || ''}
              onChange={handleChange}
              placeholder="Tu número de teléfono (opcional)"
            />
          </div>
        </div>

        <div className="flex gap-4 py-8">
          <AuthButton 
            loading={saving} 
            type="submit" 
            fullWidth
          >
            Guardar información
          </AuthButton>
          
          <button
            type="button"
            onClick={onComplete}
            className="flex-1 py-2.5 px-4 text-sm font-semibold text-gray-400 hover:text-white border border-gray-700 rounded-md transition-colors"
          >
            Omitir este paso
          </button>
        </div>
      </form>
    </div>
  );
};

export default GoogleAuthAdditionalInfo;