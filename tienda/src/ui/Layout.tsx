import React, { useEffect, useState } from "react";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "react-hot-toast";
import BackToTop from "./BackToTop";

const Layout = ({ children }: { children: React.ReactNode }) => {
  const [headerHeight, setHeaderHeight] = useState<number>(0);

  useEffect(() => {
    const updateHeaderHeight = () => {
      const el = document.querySelector('.site-header') as HTMLElement | null;
      if (el) {
        const rect = el.getBoundingClientRect();
        setHeaderHeight(Math.ceil(rect.height));
      }
    };

    // Initial measurement
    updateHeaderHeight();

    // Update on resize and when fonts/layout change
    window.addEventListener('resize', updateHeaderHeight, { passive: true });
    const ro = new ResizeObserver(updateHeaderHeight);
    const el = document.querySelector('.site-header');
    if (el) ro.observe(el);

    return () => {
      window.removeEventListener('resize', updateHeaderHeight);
      try { if (el) ro.unobserve(el); } catch (e) {}
      try { ro.disconnect(); } catch (e) {}
    };
  }, []);

  // Use the actual header height (no artificial reduction) to match fixed heights
  const adjustedPaddingTop = headerHeight ? `${headerHeight}px` : undefined;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow" style={{ paddingTop: adjustedPaddingTop }}>
        {children}
      </main>
      <Footer />
      <BackToTop />
      <Toaster
        position="bottom-right"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        toastOptions={{
          style: {
            backgroundColor: "black",
            color: "white",
          },
        }}
      />
    </div>
  );
};

export default Layout;
