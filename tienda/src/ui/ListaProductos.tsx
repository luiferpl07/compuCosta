import { Link } from "react-router-dom";
import Container from "./Container";
import Title from "./Title";
import Pagination from "./Pagination";

const   ProductList = () => {
  return (
    <Container>
      <div className="mb-10">
        <div className="flex items-center justify-between">
          <Title text="Productos" />
          <Link to={"/productos"} className="font-medium relative group overflow-hidden">
          Ver todos los productos
          <span className="absolute bottom-0 left-0 w-full block h-[1px] bg-gray-600 -translate-x-[100%] group-hover:translate-x-0 duration-300" /></Link>
        </div>
        <div className="w-full h-[1px] bg-gray-200 mt-2" />
      </div>
      {/* Pagination */}
      <Pagination />
    </Container>
  );
};

export default ProductList;
