import { useState } from "react";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { auth, db, googleProvider } from "../lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { FcGoogle } from "react-icons/fc";
import Label from "./Label";
import Login from "./Login";

const Registration = () => {
  const [login, setLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const handleRegistration = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const { firstName, lastName, email } = Object.fromEntries(formData);

    if (password !== confirmPassword) {
      setErrMsg("Las contraseñas no coinciden. Verifícalas antes de continuar.");
      return;
    }

    try {
      setLoading(true);
      const res = await createUserWithEmailAndPassword(auth, email, password);

      await setDoc(doc(db, "users", res.user.uid), {
        firstName,
        lastName,
        email,
        id: res.user.uid,
      });
      setLogin(true);
    } catch (error) {
      let errorMessage;
      switch (error) {
        case "auth/invalid-email":
          errorMessage = "Por favor, ingresa un correo válido.";
          break;
        case "auth/missing-password":
          errorMessage = "Por favor, ingresa una contraseña.";
          break;
        case "auth/email-already-in-use":
          errorMessage = "Este correo ya está en uso. Prueba con otro.";
          break;
        default:
          errorMessage = "Ocurrió un error. Por favor, intenta de nuevo.";
      }
      setErrMsg(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const res = await signInWithPopup(auth, googleProvider);
      const user = res.user;

      const userDoc = doc(db, "users", user.uid);
      const newUser = {
        firstName: user.displayName?.split(" ")[0] || "",
        lastName: user.displayName?.split(" ").slice(1).join(" ") || "",
        email: user.email || "",
        id: user.uid,
      };

      await setDoc(userDoc, newUser, { merge: true });
      setLogin(true);
    } catch (error) {
      setErrMsg("Error al iniciar sesión con Google. Intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {login ? (
        <Login setLogin={setLogin} />
      ) : (
        <div className="bg-gray-950 rounded-lg">
          <form
            onSubmit={handleRegistration}
            className="max-w-5xl mx-auto pt-10 px-4 lg:px-0 text-white"
          >
            <div className="flex flex-col items-center border-b border-b-white/10 pb-5">
              <h2 className="text-lg font-semibold uppercase leading-7">
                Formulario de Registro
              </h2>
              <p className="mt-1 text-sm leading-6 text-gray-400">
                Proporciona la información requerida para registrarte con nosotros.
              </p>
            </div>

            <div className="border-b mx-auto border-b-white/10 pb-5 max-w-lg">
              <div className="mt-5 grid grid-cols-1 gap-x-6 gap-y-5">
                <div className="sm:col-span-6">
                  <Label title="Nombre" htmlFor="firstName" />
                  <input
                    type="text"
                    name="firstName"
                    className="block w-full rounded-md bg-white/5 py-2 px-4 outline-none text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-skyText sm:text-sm mt-2"
                  />
                </div>
                <div className="sm:col-span-6">
                  <Label title="Apellido" htmlFor="lastName" />
                  <input
                    type="text"
                    name="lastName"
                    className="block w-full rounded-md bg-white/5 py-2 px-4 outline-none text-white shadow-sm ring-1 ring-inset ring-white/10 focus:ring-skyText sm:text-sm mt-2"
                  />
                </div>
                <div className="sm:col-span-6">
                  <Label title="Correo Electrónico" htmlFor="email" />
                  <input
                    type="email"
                    name="email"
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
                <div className="sm:col-span-6">
                  <Label title="Confirmar Contraseña" htmlFor="confirmPassword" />
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
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
              {loading ? "Cargando..." : "Registrar"}
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

          <p className="text-sm leading-6 text-gray-400 text-center mt-6 py-6">
            ¿Ya tienes una cuenta?{' '}
            <button
              onClick={() => setLogin(true)}
              className="font-semibold text-indigo-600 hover:text-indigo-500"
            >
              Iniciar sesión
            </button>
          </p>
        </div>
      )}
    </div>
  );
};

export default Registration;
