// AuthPage.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Login } from './Login';
import { Registration } from './Registration';
import GoogleAuthAdditionalInfo from './GoogleAuthAdditionalInfo';
import { useAuth } from '../hooks/useAuth';
import Container from './Container';

const AuthPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const { needsAdditionalInfo, currentUserId, handleAdditionalInfoComplete } = useAuth();
  const navigate = useNavigate();

  const handleToggleAuth = () => {
    setIsLogin(!isLogin);
  };

  const handleAdditionalInfoCompleted = () => {
    handleAdditionalInfoComplete();
    navigate('/perfil'); // Redirigir al perfil cuando complete la información adicional
  };

  // Si el usuario necesita proporcionar información adicional después de iniciar sesión con Google
  if (needsAdditionalInfo && currentUserId) {
    return (
      <Container>
        <GoogleAuthAdditionalInfo 
          userId={currentUserId} 
          onComplete={handleAdditionalInfoCompleted} 
        />
      </Container>
    );
  }

  return (
    <Container>
      {isLogin ? (
        <Login onToggleAuth={handleToggleAuth} />
      ) : (
        <Registration onToggleAuth={handleToggleAuth} />
      )}
    </Container>
  );
};

export default AuthPage;