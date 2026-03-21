import { useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import UserInfo from "../ui/UserInfo";
import Container from "../ui/Container";
import Loading from "../ui/Loading";
import Registration from "../ui/Registration";

const Perfil = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { currentUser, loading: authLoading, isInitialized } = useAuth();
  
  // Refs para evitar re-renders y hacer el proceso más rápido
  const hasProcessedRedirectRef = useRef(false);
  const redirectProcessingRef = useRef(false);

  // 🚀 EFECTO DE REDIRECCIÓN ULTRA RÁPIDO - VERSIÓN OPTIMIZADA
  useEffect(() => {
    // Condiciones para redirección instantánea
    if (currentUser && 
        isInitialized && 
        !hasProcessedRedirectRef.current && 
        !redirectProcessingRef.current) {
      
      // Marcar como procesando inmediatamente para evitar múltiples ejecuciones
      redirectProcessingRef.current = true;
      hasProcessedRedirectRef.current = true;
      
      // Procesar redirección de forma síncrona
      const searchParams = new URLSearchParams(location.search);
      const redirectTo = searchParams.get('redirect');
      
      if (redirectTo) {
        
        // Usar requestAnimationFrame para redirección más suave
        requestAnimationFrame(() => {
          if (redirectTo === 'carrito') {
            navigate('/carrito', { replace: true });
          } else {
            navigate(decodeURIComponent(redirectTo), { replace: true });
          }
        });
      } else {
        // Usuario logueado, permaneciendo en perfil
      }
      
      // Reset processing flag después de un breve delay
      setTimeout(() => {
        redirectProcessingRef.current = false;
      }, 100);
    }
    
    // Reset cuando no hay usuario
    if (!currentUser && hasProcessedRedirectRef.current) {
      hasProcessedRedirectRef.current = false;
      redirectProcessingRef.current = false;
    }
  }, [currentUser, isInitialized, location.search, navigate]);



  // Función optimizada para clases CSS responsivas
  const getResponsiveClasses = () => {
    let containerClasses = "w-full mx-auto transition-all duration-300 ";
    let paddingClasses = "px-4 py-8 md:py-12 ";
    let maxWidthClasses = "max-w-5xl "; // Ampliado para mejor layout
    
    return {
      container: containerClasses + maxWidthClasses + paddingClasses,
      authContainer: "bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mt-4 mb-8"
    };
  };

  const classes = getResponsiveClasses();
  
  // 🚀 LÓGICA DE LOADING ULTRA OPTIMIZADA
  // Solo mostrar loading en casos absolutamente necesarios
  const shouldShowLoading = !isInitialized || (authLoading && !currentUser && !redirectProcessingRef.current);
  
  if (shouldShowLoading) {
    return (
      <Container>
        <div className={classes.container}>
          <div className="flex flex-col items-center justify-center py-20">
            <Loading />
            <p className="mt-6 text-gray-500 font-medium text-center">
              {!isInitialized ? "Inicializando..." : "Autenticando..."}
            </p>
          </div>
        </div>
      </Container>
    );
  }

  // 🚀 CONDICIÓN ULTRA SIMPLE PARA MOSTRAR EL PERFIL
  const showUserProfile = currentUser && isInitialized;

  return (
    <div className="min-h-screen bg-gray-50">
      <Container>
        <div className={classes.container}>
          <div className="mb-8">
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
              {showUserProfile ? 'Mi Perfil' : 'Accede a tu Cuenta'}
            </h1>
            <p className="text-gray-500 mt-2">
              {showUserProfile ? 'Administra tu información y direcciones.' : 'Inicia sesión para gestionar tus pedidos.'}
            </p>
          </div>
          
          {showUserProfile ? (
            <div className="animate-fade-in">            
              <UserInfo currentUser={currentUser} />
            </div>
          ) : (
            <div className={`animate-fade-in ${classes.authContainer}`}>
              <Registration className="w-full" />
            </div>
          )}
        </div>
      </Container>
    </div>
  );
};

export default Perfil;