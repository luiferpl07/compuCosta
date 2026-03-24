import { useEffect, useState } from "react";
import { IoChevronUp } from "react-icons/io5";

const BackToTop = () => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      setVisible(window.scrollY > 100);
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <button
      aria-label="Volver arriba"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="fixed bottom-28 right-4 sm:bottom-20 sm:right-6 lg:bottom-6 lg:right-6 z-60 bg-gray-900 text-white p-4 sm:p-3 rounded-full shadow-lg hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-red-200"
    >
      <IoChevronUp className="w-6 h-6 sm:w-5 sm:h-5" />
    </button>
  );
};

export default BackToTop;
