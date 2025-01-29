import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { config } from "../../config";
import { Product } from "../../type";
import { getData } from "../lib";
import Loading from "../ui/Loading";
import Container from "../ui/Container";
import _, { divide } from "lodash";
import PriceTag from "../ui/PriceTag";
import { MdOutlineStarOutline } from "react-icons/md";
import { FaRegEye } from "react-icons/fa";
import FormatoPrecio from "../ui/FormatoPrecio";
import { IoClose } from "react-icons/io5";
import AddToCartBtn from "../ui/AddToCartBtn";
import { productPayment } from "../assets";
import ProductCard from "../ui/ProductCard";
import CategoryFilters from "../ui/CategoryFilters";


const Producto = () => {
  const [productData, setProductData] = useState<Product | null>(null);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [imgUrl, setImgUrl] = useState("");
  const [selectedColor, setSelectedColor] = useState<Product["colores"][0] | null>(null);
  const { id } = useParams();

  const endpoint = id
    ? `${config?.baseUrl}${config?.apiPrefix}/products/${id}`
    : `${config?.baseUrl}${config?.apiPrefix}/products`;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getData(endpoint);
        if (id) {
          console.log("Datos del producto:", data); // Depuración
          setProductData(data);
          setAllProducts([]);
        } else {
          console.log("Lista de productos:", data); // Depuración
          setAllProducts(data);
          setProductData(null);
        }
      } catch (error) {
        console.error("Error al cargar los datos", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, endpoint]);

  useEffect(() => {
    if (productData) {
      setImgUrl(
        `${config?.baseUrl}${productData?.imagenes?.find(img => img.es_principal)?.url}`
        ? `${config?.baseUrl}${productData?.imagenes?.find(img => img.es_principal)?.url}`
        : ""
      );
      setSelectedColor(productData?.colores?.[0] || null);
    }
  }, [productData]);

  return (
    <div>
      {loading ? (
        <Loading />
      ) : (
        <Container>
          {!!id && productData && _.isEmpty(allProducts) ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div className="flex flex-start">
                <div>
                  {productData?.imagenes?.map((item) => (
                    <img
                      src={item.url}
                      alt={item.alt_text || "Imagen del producto"}
                      key={item.id}
                      className={`w-24 cursor-pointer opacity-80 hover:opacity-100 duration-300 ${
                        imgUrl === item.url &&
                        "border border-gray-500 rounded-sm opacity-100"
                      }`}
                      onClick={() => setImgUrl(item.url)}
                    />
                  ))}
                </div>
                <div>
                  <img src={imgUrl} alt="Imagen principal" />
                </div>
              </div>
              <div className="flex flex-col gap-4">
                <h2 className="text-3xl font-bold">{productData?.nombre}</h2>
                <div className="flex items-center justify-between">
                  <PriceTag
                    precio={productData?.precio}
                    precioDescuento={productData?.precioDescuento}
                    className="text-xl"
                  />
                  <div className="flex items-center gap-1">
                    <div className="text-base text-lightText flex items-center">
                      {[...Array(5)].map((_, index) => (
                        <MdOutlineStarOutline
                          key={index}
                          className={index < productData?.puntuacionPromedio ? "text-yellow-400" : ""}
                        />
                      ))}
                    </div>
                    <p className="text-base font-semibold">{`(${productData?.reseñasCount} reseñas)`}</p>
                  </div>
                </div>
                <p className="flex items-center">
                  <FaRegEye className="mr-1" />
                  <span className="font-semibold mr-1">
                    {productData?.reseñasCount}
                  </span>
                  personas están viendo esto ahora mismo
                </p>
                <p>
                  Estás ahorrando
                  <span className="text-base font-semibold text-green-500">
                    <FormatoPrecio
                      amount={
                        (productData?.precio || 0) -
                        (productData?.precioDescuento || 0)
                      }
                    />
                  </span>{" "}
                    al comprar
                </p>
                <div>
                  {selectedColor && (
                    <p>
                      Color: {" "}
                      <span
                        className="font-semibold capitalize"
                        style={{ color: selectedColor.codigoHex }}
                      >
                        {selectedColor.nombre}
                      </span>
                    </p>
                  )}
                  <div className="flex items-center gap-x-3">
                    {productData?.colores?.map((item) => (
                      <div
                        key={item.id}
                        className={`${
                          item.id === selectedColor?.id
                            ? "border border-black p-1 rounded-full"
                            : "border-transparent"
                        }`}
                      >
                        <div
                          className="w-10 h-10 rounded-full cursor-pointer"
                          style={{ backgroundColor: item.codigoHex }}
                          onClick={() => setSelectedColor(item)}
                        />
                      </div>
                    ))}
                  </div>
                  {selectedColor && (
                    <button
                      onClick={() => setSelectedColor(null)}
                      className="font-semibold mt-1 flex items-center gap-1 hover:text-red-600 duration-200"
                    >
                      <IoClose /> Limpiar
                    </button>
                  )}
                </div>
                <p>
                  Marca: {" "}
                  <span className="font-medium">
                    {productData?.marca?.nombre || "Sin marca"}
                  </span>
                </p>
                <p>
                  Categoría: {" "}
                  <span className="font-medium">
                    {productData?.categorias?.[0]?.nombre || "Sin categoría"}
                  </span>
                </p>
                <AddToCartBtn
                  product={productData}
                  title="Comprar ahora"
                  className="bg-black/80 py-3 text-base text-gray-200 hover:scale-100 hover:text-white duration-200"
                />
                <div className="bg-[#f7f7f7] p-5 rounded-md flex flex-col items-center justify-center gap-2">
                  <img
                    src={productPayment}
                    alt="Pago seguro"
                    className="w-auto object-cover"
                  />
                  <p className="font-semibold">
                    Garantía de pago seguro y protegido
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-10">
              <CategoryFilters id={id} />
              <div>
                <p className="text-4xl font-semibold mb-5 text-center">
                  Colección de productos
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {allProducts?.map((item: Product) => (
                    <ProductCard item={item} key={item.id} />
                  ))}
                </div>
              </div>
            </div>
          )}
        </Container>
      )}
    </div>
  );
};

export default Producto;
