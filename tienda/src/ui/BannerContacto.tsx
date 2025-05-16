
import { useEffect, useState } from "react";
import { config } from "../../config";
import { getData } from "../lib";

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  isActive: boolean;
  bannerType: string;
}

const BannerContacto = () => {
  const [banner, setBanner] = useState<Banner | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const endpoint = `${config?.baseUrl}${config?.apiPrefix}/banners`;
        const data = await getData(endpoint);
        const contactBanner = data.find(
          (b: Banner) => b.isActive && b.bannerType === "bannerContacto"
        );
        
        if (contactBanner) {
          setBanner(contactBanner);
        } else {
          setError("No hay banner de contacto disponible");
        }
      } catch (err) {
        console.error("Error al cargar el banner:", err);
        setError("Error al cargar el banner");
      } finally {
        setLoading(false);
      }
    };

    fetchBanner();
  }, []);

  if (loading) {
    return (
      <div className="w-screen h-[200px] md:h-[300px] bg-gray-200 animate-pulse flex items-center justify-center">
        {/* Silueta del banner en lugar del texto "Cargando..." */}
        <div className="w-4/5 h-4/5 bg-gray-300 animate-pulse rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-[200px] md:h-[300px] bg-gray-100 flex items-center justify-center text-gray-500">
        {error}
      </div>
    );
  }

  return (
    <div className="relative w-screen h-[200px] md:h-[300px] overflow-hidden">
      {banner?.imageUrl ? (
        <>
          <img
            src={`${config?.baseUrl}${banner.imageUrl}`}
            alt={banner.title || "Banner de contacto"}
            className="absolute inset-0 w-full h-full object-contain"
            onError={(e) => {
              (e.target as HTMLImageElement).src = "/placeholder.png";
            }}
          />
          <div className="absolute inset-0" />
        </>
      ) : (
        <div className="w-full h-full bg-gray-200 flex items-center justify-center text-gray-500">
          No hay imagen disponible
        </div>
      )}
    </div>
  );
};

export default BannerContacto;