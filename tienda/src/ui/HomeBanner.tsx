import { useEffect, useState } from "react";
import Container from "./Container";
import LinkButton from "./LinkButton";
import { BannerProps } from "../../type";
import { getData } from "../lib";
import { config } from "../../config";

const HomeBanner = () => {
  const [banner, setBanner] = useState<BannerProps | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      const endpoint = `${config?.baseUrl}${config?.apiPrefix}/banners`;
      try {
        const data: BannerProps[] = await getData(endpoint);
        const activeBanner = data.find((b) => b.isActive);
        if (activeBanner) {
          setBanner(activeBanner);
        } else {
          setError("No hay banners activos disponibles.");
        }
      } catch (err) {
        console.error("Error al obtener el banner:", err);
        setError("Error al cargar el banner.");
      } finally {
        setLoading(false);
      }
    };
    fetchBanner();
  }, []);

  if (loading) {
    return <p className="text-center">Cargando banner...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">{error}</p>;
  }

  return (
    <Container className="relative py-5 overflow-hidden">
      <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
        <img
          src={banner?.imageUrl}
          alt={`Imagen del banner ${banner?.title}`}
          className="w-full h-full object-contain rounded-md" // Se cambió a object-contain
        />
        <div className="w-full h-full absolute top-0 left-0 bg-black/10" />
      </div>
      <div className="absolute inset-0 flex flex-col justify-center px-10">
        <h2 className="text-xl md:text-4xl lg:text-6xl text-textoBlanco font-bold">
          {banner?.title}
        </h2>
        <p className="text-base md:text-lg font-semibold leading-6 text-textoBlanco/90 max-w-[250px] mt-4">
          El nuevo regalo tecnológico que estás deseando aquí.
        </p>
        <LinkButton className="w-44 text-center flex items-center justify-center bg-textoBlanco text-textoRojo hover:bg-textoRojo hover:text-textoBlanco duration-200 mt-4 font-bold" />
      </div>
    </Container>
  );
}
export default HomeBanner;
