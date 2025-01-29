import { useState } from "react";
import { signInWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "../lib/firebase";
import { FcGoogle } from "react-icons/fc";
import Label from "./Label";

const Login = ({ setLogin }) => {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errMsg, setErrMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setErrMsg("Por favor ingresa todos los campos.");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      // Login successful, no need to manually set login state
      console.log("User logged in:", userCredential.user);
    } catch (error) {
      console.error(error);
      const errorCode = error.code;
      let errorMessage;

      switch (errorCode) {
        case "auth/invalid-email":
          errorMessage = "Por favor, ingresa un correo válido.";
          break;
        case "auth/wrong-password":
          errorMessage = "La contraseña es incorrecta. Intenta de nuevo.";
          break;
        case "auth/user-not-found":
          errorMessage = "No se encuentra una cuenta con ese correo. Regístrate primero.";
          break;
        default:
          errorMessage = "Ocurrió un error al iniciar sesión. Intenta de nuevo.";
      }

      setErrMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      await signInWithPopup(auth, googleProvider);
      // Login successful, onAuthStateChanged in Perfil will handle routing
    } catch (error) {
      console.error(error);
      setErrMsg("Error al iniciar sesión con Google. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="bg-gray-950 rounded-lg">
        <form
          onSubmit={handleLogin}
          className="max-w-5xl mx-auto pt-10 px-4 lg:px-0 text-white"
        >
          <div className="flex flex-col items-center border-b border-b-white/10 pb-5">
            <h2 className="text-lg font-semibold uppercase leading-7">
              Iniciar Sesión
            </h2>
            <p className="mt-1 text-sm leading-6 text-gray-400">
              Ingresa tus datos para acceder a tu cuenta.
            </p>
          </div>

          <div className="border-b mx-auto border-b-white/10 pb-5 max-w-lg">
            <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5">
              <div className="sm:col-span-6">
                <Label title="Correo Electrónico" htmlFor="email" />
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full rounded-md bg-white/5 py-2 px-4 outline-none text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-skyText sm:text-sm mt-2"
                />
              </div>
              <div className="sm:col-span-6">
                <Label title="Contraseña" htmlFor="password" />
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="block w-full rounded-md bg-white/5 py-2 px-4 outline-none text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-skyText sm:text-sm mt-2"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-3 flex items-center text-gray-400"
                  >
                    {showPassword ? "Ocultar" : "Mostrar"}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {errMsg && (
            <p className="bg-white/90 text-red-600 text-center py-2 rounded-md tracking-wide font-semibold">
              {errMsg}
            </p>
          )}

          <button
            disabled={loading}
            type="submit"
            className="mt-5 bg-indigo-700 w-full max-w-xs mx-auto py-2 px-6 uppercase text-base font-bold tracking-wide text-gray-300 rounded-md hover:text-white hover:bg-indigo-600 duration-200 flex items-center justify-center"
          >
            {loading ? "Cargando..." : "Iniciar Sesión"}
          </button>
        </form>

        <div className="text-center mt-4">
          <p className="text-gray-400 mb-2">O</p>
          <button
            onClick={handleGoogleLogin}
            className="bg-white w-full max-w-xs mx-auto py-2 px-6 uppercase text-base font-bold tracking-wide text-textoRojo rounded-md hover:text-white hover:bg-textoRojo duration-200 flex items-center justify-center"
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

        <div className="text-center mt-4">
          <p className="text-gray-400 mb-2">¿No tienes cuenta?</p>
          <button
            onClick={() => setLogin(false)}
            className="text-sky-500 hover:text-sky-400 font-semibold"
          >
            Regístrate aquí
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;
