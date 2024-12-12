import "react-multi-carousel/lib/styles.css";
import BannerCategories from "./ui/BannerCategories";
import HomeBanner from "./ui/HomeBanner";
import Hightlights from "./ui/Hightlights";
import Categorias from "./ui/Categoria";
import ProductList from "./ui/ListaProductos";
import DiscountedBanner from "./ui/DiscountedBanner";



function App() {
  
  return (
    <main>
    <BannerCategories />
    <HomeBanner />
    <Hightlights />
    <Categorias />
    {/* ProductList */}
    <ProductList />
    {/* DiscountedBanner */}
    <DiscountedBanner />
   
  </main>
  );
}

export default App;
