import { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import Label from "./Label";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import Loading from "./Loading";
import { FcGoogle } from "react-icons/fc"; 

const Login = ({ setLogin }: { setLogin: any }) => {
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const navigate = useNavigate(); 

  const handleLogin = async (e: any) => {
    e.preventDefault();
    try {
      setLoading(true);
      const formData = new FormData(e.target);
      const { email, password }: any = Object.fromEntries(formData);

      await signInWithEmailAndPassword(auth, email, password);
      navigate("/perfil"); 
    } catch (error: any) {
      let errorMessage;
      switch (error.code) {
        case "auth/user-not-found":
          errorMessage =
            "No se encontró un usuario con este correo electrónico.";
          break;
        case "auth/wrong-password":
          errorMessage = "Contraseña incorrecta.";
          break;
        case "auth/invalid-email":
          errorMessage = "Dirección de correo electrónico inválida.";
          break;
        case "auth/invalid-credential":
          errorMessage = "Correo o contraseña incorrectos.";
          break;
        default:
          errorMessage = "Ocurrió un error. Por favor, inténtalo de nuevo.";
      }
      console.log("Error", error);
      setErrMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, googleProvider);
      console.log("Usuario autenticado con Google:", result.user);
      navigate("/perfil"); // Redirigir después de iniciar sesión con Google
    } catch (error: any) {
      console.error("Error al iniciar sesión con Google:", error);
      setErrMsg("Ocurrió un error al iniciar sesión con Google.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-gray-950 rounded-lg">
      <form
        onSubmit={handleLogin}
        className="max-w-5xl mx-auto pt-10 px-10 lg:px-0 text-white"
      >
        <div className="border-b border-b-white/10 pb-5">
          <h2 className="text-lg font-semibold uppercase leading-7">
            Inicio de sesión
          </h2>
          <p className="mt-1 text-sm leading-6 text-gray-400">
            Ingresa tus credenciales para acceder a tu cuenta.
          </p>
        </div>
        <div className="border-b border-b-white/10 pb-5">
          <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5 sm:grid-cols-6">
            <div className="sm:col-span-3">
              <Label title="Correo electrónico" htmlFor="email" />
              <input
                type="email"
                name="email"
                required
                className="block w-full rounded-md border-0 bg-white/5 py-1.5 px-4 outline-none text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-indigo-500 sm:text-sm sm:leading-6 mt-2"
              />
            </div>
            <div className="sm:col-span-3">
              <Label title="Contraseña" htmlFor="password" />
              <input
                type="password"
                name="password"
                required
                className="block w-full rounded-md border-0 bg-white/5 py-1.5 px-4 outline-none text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-indigo-500 sm:text-sm sm:leading-6 mt-2"
              />
            </div>
          </div>
        </div>
        {errMsg && (
          <p className="bg-white/90 text-red-600 text-center py-1 rounded-md tracking-wide font-semibold">
            {errMsg}
          </p>
        )}
        <button
          type="submit"
          className="mt-5 bg-indigo-700 w-96 max-w-xs mx-auto py-2 px-6 uppercase text-base font-bold tracking-wide text-gray-300 rounded-md hover:text-white hover:bg-indigo-600 duration-200 flex items-center justify-center"
        >
          {loading ? "Cargando..." : "Iniciar sesión"}
        </button>
      </form>
      <div className="text-center mt-4">
        <p className="text-gray-400 mb-2">O</p>
        <button
          onClick={handleGoogleLogin}
          className="bg-white w-auto max-w-xs mx-auto py-2 px-6 uppercase text-base font-bold tracking-wide text-textoRojo rounded-md hover:text-white hover:bg-textoRojo duration-200 flex items-center justify-center"
        >
          {loading ? (
            "Cargando..."
          ) : (
            <>
              <FcGoogle className="text-xl mr-2" />
              Iniciar sesión con Google
            </>
          )}
        </button>
      </div>
      <p className="text-sm leading-6 text-gray-400 text-center -mt-2 py-10">
        ¿No tienes una cuenta?{" "}
        <button
          onClick={() => setLogin(false)}
          className="text-gray-200 font-semibold underline underline-offset-2 decoration-[1px] hover:text-white duration-200"
        >
          Regístrate
        </button>
      </p>
      {loading && <Loading />}
    </div>
  );
};

export default Login;
