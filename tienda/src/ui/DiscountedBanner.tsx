import { useEffect, useState } from "react";
import { Carousel } from "react-responsive-carousel";
import "react-responsive-carousel/lib/styles/carousel.min.css";
import Title from "./Title";
import { Link } from "react-router-dom";
import { config } from "../../config";
import { getData } from "../lib";

interface Banner {
  id: number;
  title: string;
  imageUrl: string;
  isActive: boolean;
  bannerType: string;
}

const CarouselComponent = Carousel as any;

const DiscountedBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(false);

  const popularSearchItems = [
    { title: "Smart Watches", link: "smartWatches" },
    { title: "Audífonos", link: "headphones" },
    { title: "Cámaras", link: "camerasAndPhotos" },
    { title: "Audio", link: "tvAndAudio" },
    { title: "Laptops & Computadores", link: "computersAndLaptop" },
    { title: "Celulares", link: "cellPhones" },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const bannersEndpoint = `${config?.baseUrl}${config?.apiPrefix}/banners`;
        const bannersData = await getData(bannersEndpoint);
        const activeBanners = bannersData.filter(
          (b: Banner) => b.isActive && b.bannerType === "banner2"
        );
        setBanners(activeBanners);
      } catch (error) {
        console.error("Error fetching banners:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="w-full">
      {/* Búsquedas populares */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Title text="Búsquedas Populares" />
        <div className="w-full h-[1px] bg-gray-200 mt-3" />
        
        <div className="my-7 flex items-center flex-wrap gap-4">
          {popularSearchItems.map(({ title, link }) => (
            <Link
              key={title}
              to={`/categorias/${link}`}
              className="border border-gray-300 px-6 md:px-8 py-2 md:py-3 rounded-full capitalize font-medium
                hover:bg-black hover:text-white transition-all duration-200"
            >
              {title}
            </Link>
          ))}
        </div>
      </div>

      {/* Carrusel Responsivo */}
      <div className="w-screen overflow-hidden">
        {loading ? (
          <div className="w-full h-[200px] md:h-[300px] bg-gray-200 animate-pulse flex items-center justify-center">
            {/* Silueta de carga - reemplazo del texto "Cargando..." */}
            <div className="w-3/4 h-3/4 bg-gray-300 animate-pulse rounded"></div>
          </div>
        ) : banners.length > 0 ? (
          <div className="w-full">
            <CarouselComponent
              showThumbs={false}
              showStatus={false}
              autoPlay
              infiniteLoop
              interval={4000}
              className="w-full"
            >
              {banners.map((banner) => (
                <div key={banner.id} className="relative w-full h-[200px] md:h-[300px]">
                  <img
                    src={`${config?.baseUrl}${banner.imageUrl}`}
                    alt={banner.title}
                    className="absolute inset-0 w-full h-full object-contain"
                  />
                  <div className="absolute inset-0" />
                </div>
              ))}
            </CarouselComponent>
          </div>
        ) : (
          <div className="w-full h-[200px] md:h-[300px] bg-gray-200 flex items-center justify-center">
            No hay imágenes disponibles
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscountedBanner;