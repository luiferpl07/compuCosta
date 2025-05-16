import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../lib/firebase";

import UserInfo from "../ui/UserInfo";
import Container from "../ui/Container";
import Loading from "../ui/Loading";
import Registration from "../ui/Registration";

// Asegurar que firstName y lastName siempre sean string
export interface UserType {
  uid: string;
  firstName: string;  
  lastName: string;   
  email: string;
  avatar?: string;
  createdAt?: string;
  displayName?: string; // Agregamos el nombre completo para mantener los datos originales
}

const Perfil = () => {
  const [currentUser, setCurrentUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);
  const [screenSize, setScreenSize] = useState({
    width: typeof window !== "undefined" ? window.innerWidth : 0,
    height: typeof window !== "undefined" ? window.innerHeight : 0
  });
  
  // Función para detectar mejor el tamaño de pantalla y sus cambios
  const updateScreenSize = () => {
    setScreenSize({
      width: window.innerWidth,
      height: window.innerHeight
    });
  };

  // Manejador de cambios en el tamaño de la ventana optimizado
  useEffect(() => {
    // Actualizar inmediatamente para tener el valor real al iniciar
    updateScreenSize();
    
    // Usar un debounce para evitar demasiadas actualizaciones durante el redimensionamiento
    let timeoutId: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateScreenSize, 100);
    };

    // Agregar event listener
    window.addEventListener("resize", handleResize);

    // Limpiar event listener y timeout
    return () => {
      window.removeEventListener("resize", handleResize);
      clearTimeout(timeoutId);
    };
  }, []);

  // Mejorar la extracción de datos del usuario
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Lógica mejorada para detectar nombres y apellidos correctamente
        let firstName = "Usuario";
        let lastName = ""; 
        let displayName = user.displayName || "Usuario";
        
        if (user.displayName) {
          // Dividimos el nombre completo en palabras
          const nameParts = user.displayName.trim().split(/\s+/);
          
          if (nameParts.length === 1) {
            // Si solo hay una palabra, es el nombre
            firstName = nameParts[0];
          } else if (nameParts.length >= 2) {
            // Lista de apellidos comunes (similar al componente de EditProfile)
            const commonLastNames = [
              "garcía", "gonzález", "rodríguez", "fernández", "lópez", "martínez", 
              "sánchez", "pérez", "gómez", "martín", "jiménez", "ruiz", "hernández", 
              "díaz", "moreno", "muñoz", "álvarez", "romero", "alonso", "gutiérrez",
              "torres", "navarro", "domínguez", "vázquez", "ramos", "gil", "ramírez",
              "serrano", "blanco", "molina", "morales", "suárez", "ortega", "delgado",
              "castro", "ortiz", "rubio", "marín", "sanz", "iglesias", "flores", "medina"
            ];
            
            // Identificar el índice donde comienzan los apellidos
            let lastNameStartIndex = -1;
            
            for (let i = 0; i < nameParts.length; i++) {
              const lowerCasePart = nameParts[i].toLowerCase();
              if (commonLastNames.includes(lowerCasePart)) {
                lastNameStartIndex = i;
                break;
              }
            }
            
            // Si no encontramos un apellido conocido, asumimos que el último elemento es el apellido
            if (lastNameStartIndex === -1) {
              lastNameStartIndex = nameParts.length - 1;
            }
            
            firstName = nameParts.slice(0, lastNameStartIndex).join(" ");
            lastName = nameParts.slice(lastNameStartIndex).join(" ");
            
            // Si la detección falló, usamos la estrategia de respaldo
            if (!firstName) {
              firstName = nameParts[0];
              lastName = nameParts.slice(1).join(" ");
            }
          }
        }

        setCurrentUser({
          uid: user.uid,
          email: user.email || "sin-email@example.com",
          firstName: firstName,
          lastName: lastName || "Desconocido",
          avatar: user.photoURL || "",
          displayName: displayName, // Guardamos el nombre completo original
          createdAt: user.metadata.creationTime
        });
      } else {
        setCurrentUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Función para determinar las clases CSS según el tamaño de pantalla
  const getResponsiveClasses = () => {
    const width = screenSize.width;
    
    // Clases base que aplican a todos los tamaños
    let containerClasses = "w-full mx-auto transition-all duration-300 ";
    let paddingClasses = "px-4 py-4 ";
    let maxWidthClasses = "";
    
    // Ajustar según el tamaño de pantalla
    if (width < 640) {
      // Móvil
      paddingClasses += "sm:px-4 sm:py-4 ";
      maxWidthClasses = "max-w-full ";
    } else if (width < 768) {
      // Tablet pequeña
      paddingClasses += "sm:px-6 sm:py-5 ";
      maxWidthClasses = "max-w-lg ";
    } else if (width < 1024) {
      // Tablet grande
      paddingClasses += "md:px-8 md:py-6 ";
      maxWidthClasses = "max-w-xl ";
    } else {
      // Desktop
      paddingClasses += "lg:px-10 lg:py-8 ";
      maxWidthClasses = "max-w-4xl ";
    }
    
    return {
      container: containerClasses + maxWidthClasses + paddingClasses,
      authContainer: "bg-white rounded-lg shadow-lg overflow-hidden mt-4 mb-8"
    };
  };

  const classes = getResponsiveClasses();
  
  if (loading) {
    return (
      <Container>
        <div className={classes.container}>
          <Loading />
        </div>
      </Container>
    );
  }

  return (
    <Container>
      <div className={classes.container}>
        <h1 className="text-2xl md:text-3xl font-bold mb-6 text-red-600">
          {currentUser ? 'Mi Perfil' : 'Accede a tu Cuenta'}
        </h1>
        
        {currentUser ? (
          <UserInfo 
            currentUser={currentUser}
          />
        ) : (
          <div className={classes.authContainer}>
            <Registration className="w-full" />
          </div>
        )}
      </div>
    </Container>
  );
};

export default Perfil;