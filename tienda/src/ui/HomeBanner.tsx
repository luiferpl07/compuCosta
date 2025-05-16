import { useEffect, useState } from "react";
import { BannerProps } from "../../type";
import { getData } from "../lib";
import { config } from "../../config";

const HomeBanner = () => {
  const [banners, setBanners] = useState<BannerProps[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBanners = async () => {
      const endpoint = `${config?.baseUrl}${config?.apiPrefix}/banners`;
      try {
        const data: BannerProps[] = await getData(endpoint);
        const activeBanner1s = data.filter(b => b.isActive && b.bannerType === 'banner1');
        if (activeBanner1s.length > 0) {
          setBanners(activeBanner1s);
        } else {
          setError("No hay banners tipo 1 activos disponibles.");
        }
      } catch (err) {
        console.error("Error al obtener los banners:", err);
        setError("Error al cargar los banners.");
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  useEffect(() => {
    if (banners.length > 1) {
      const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => 
          prevIndex === banners.length - 1 ? 0 : prevIndex + 1
        );
      }, 5000);
      return () => clearInterval(interval);
    }
  }, [banners.length]);

  const goToNext = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === banners.length - 1 ? 0 : prevIndex + 1
    );
  };

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => 
      prevIndex === 0 ? banners.length - 1 : prevIndex - 1
    );
  };

  if (loading) {
    return (
      <div className="w-screen h-[250px] md:h-[400px] lg:h-[500px] xl:h-[600px] bg-gray-200 animate-pulse flex items-center justify-center">
        {/* Silueta de banner en carga - reemplazo del texto "Cargando banner..." */}
        <div className="w-4/5 h-4/5 bg-gray-300 animate-pulse rounded"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-screen h-[250px] md:h-[400px] lg:h-[500px] xl:h-[600px] bg-gray-100 flex items-center justify-center text-red-500">
        {error}
      </div>
    );
  }

  const currentBanner = banners[currentIndex];

  return (
    <div className="relative w-screen h-[250px] md:h-[400px] lg:h-[500px] xl:h-[600px] overflow-hidden">
      {/* Imagen del Banner */}
      <div className="relative w-full h-full transition-opacity duration-500">
        {currentBanner?.imageUrl ? (
          <>
            <img
              src={`${config?.baseUrl}${currentBanner.imageUrl}`}
              alt={`Imagen del banner ${currentBanner.title || ""}`}
              className="absolute inset-0 w-full h-full object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).src = "/placeholder.png";
              }}
            />
            <div className="absolute inset-0" />
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
            No hay imagen disponible
          </div>
        )}
      </div>

      {/* Flechas de Navegación */}
      {banners.length > 1 && (
        <>
          <button
            onClick={goToPrevious}
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 md:p-2 rounded-full transition-colors duration-200"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="h-6 w-6"
            >
              <path d="m15 18-6-6 6-6"/>
            </svg>
          </button>
          <button
            onClick={goToNext}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white p-1 md:p-2 rounded-full transition-colors duration-200"
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              width="24" 
              height="24" 
              fill="none" 
              stroke="currentColor" 
              strokeWidth="2" 
              className="h-6 w-6"
            >
              <path d="m9 18 6-6-6-6"/>
            </svg>
          </button>
        </>
      )}

      {/* Indicadores de Puntos */}
      {banners.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 md:w-3 md:h-3 rounded-full transition-all duration-200 ${
                index === currentIndex 
                  ? "bg-white w-4" 
                  : "bg-white/50"
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default HomeBanner;