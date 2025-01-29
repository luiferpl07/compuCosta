import Container from "../ui/Container";
import { store } from "../lib/store";
import FavoriteProduct from "../ui/ProductoFavorito";
import { Link } from "react-router-dom";

const Favorito = () => {
  const { favoriteProduct } = store(); // Obtener los productos favoritos desde el store

  return (
    <Container>
      {favoriteProduct?.length ? (
        <div>
          <div className="border-b border-b-gray-300 pb-6">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
              Productos favoritos
            </h2>
            <p className="mt-2 text-sm text-gray-500 max-w-[500px] tracking-wide">
              Aquí puedes ver todos los productos que has agregado a tus favoritos. ¡No olvides revisar periódicamente tus productos favoritos para aprovechar las mejores ofertas!
            </p>
          </div>

          <div className="mt-6 flow-root px-4 sm:mt-10 sm:px-0">
            <div className="-my-6 divide-y divide-gray-200 sm:-my-10">
              {/* Mapea y muestra los productos favoritos */}
              {favoriteProduct.map((product) => (
                <FavoriteProduct key={product.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-auto flex max-w-3xl flex-col gap-3 items-center text-center">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            No se ha agregado nada a Favoritos
          </h2>
          <p className="text-lg tracking-wide leading-6 text-gray-500">
            Aún no has agregado productos a tu lista de favoritos. Explora nuestros productos y marca los que más te gusten.
          </p>
          <Link
            to={"/productos"} // Enlace a la página de productos
            className="w-full mt-2 rounded-md border border-transparent px-8 py-3 text-base font-medium text-red-500 bg-gray-100 sm:w-auto hover:bg-textoRojo hover:text-white duration-200"
          >
            Agregar productos
          </Link>
        </div>
      )}
    </Container>
  );
};

export default Favorito;
