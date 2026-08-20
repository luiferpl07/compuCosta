import { Link } from "react-router-dom";
import Container from "./Container";
import Title from "./Title";
import Pagination from "./Pagination";
import { useRef } from "react";

const ProductList = () => {
  const productListRef = useRef<HTMLDivElement>(null);

  return (
    <Container>
      <div ref={productListRef} className="mb-10">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
          <Title text="Productos" />
          <Link
            to={"/productos"}
            className="font-medium relative group overflow-hidden mt-2 sm:mt-0"
          >
            Ver todos los productos
            <span className="absolute bottom-0 left-0 w-full block h-[1px] bg-gray-600 -translate-x-[100%] group-hover:translate-x-0 duration-300" />
          </Link>
        </div>
        <div className="w-full h-[1px] bg-gray-200 mt-2" />
      </div>
      {/* Pagination - Pasamos la referencia */}
      <Pagination scrollTargetRef={productListRef} />
    </Container>
  );
};

export default ProductList;