import React, { useEffect, useState, useMemo } from "react";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { config } from "../../config";
import { ChevronDown, ChevronUp } from 'lucide-react';

interface Review {
  id: number;
  id_producto: number;
  nombre_cliente: string;
  calificacion: number;
  comentario?: string;
  fecha_review: string;
  aprobado: boolean;
}

type NewReview = Omit<Review, "id">;

interface ReviewProps {
  productId: string;
  onAddReview?: (review: Review) => void;
}

const ReviewsSection = ({ productId, onAddReview }: ReviewProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [newReview, setNewReview] = useState({ calificacion: 5, comentario: "" });
  const [rating, setRating] = useState(5);
  const [hover, setHover] = useState(0);
  const [expandedComments, setExpandedComments] = useState(false);
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();

  // 🔹 Cargar reseñas
  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const url = `${config?.baseUrl}${config?.apiPrefix}/reviews?productId=${Number(productId)}`;
        console.log("📌 URL de reseñas:", url);
        const res = await fetch(url);
        if (!res.ok) throw new Error("Error cargando reseñas");
        const data = await res.json();
        const filteredReviews = data.filter((review: Review) => review.id_producto === Number(productId));
        setReviews(filteredReviews);
      } catch (error) {
        console.error(error);
      }
    };
    fetchReviews();
  }, [productId]);

  // 🔹 Enviar reseña
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      navigate("/perfil");
      return;
    }

    const reviewData: NewReview = {
      id_producto: Number(productId),
      nombre_cliente: `${currentUser.firstName} ${currentUser.lastName}`,
      calificacion: rating,
      comentario: newReview.comentario,
      fecha_review: new Date().toISOString(),
      aprobado: false,
    };

    try {
      const response = await fetch(`${config?.baseUrl}${config?.apiPrefix}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reviewData),
      });

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || "Error al enviar la reseña");
      }

      toast.success("Reseña enviada");
      if (responseData.id_producto === Number(productId)) {
        setReviews((prev) => [...prev, responseData]);
      }
      setNewReview({ calificacion: 5, comentario: "" });
      setRating(5);
    } catch (error) {
      toast.error("Error al enviar la reseña");
      console.error("🚨 Error en fetch:", error);
    }
  };

  // 🔹 Datos para gráfico de barras
  const ratingData = useMemo(() => {
    if (!reviews.length) return [];
    return [5, 4, 3, 2, 1].map((star) => ({
      rating: `${star} ★`,
      count: reviews.filter((r) => r.calificacion === star).length,
    }));
  }, [reviews]);

  // 🔹 Calificación promedio
  const averageRating = useMemo(() => {
    return reviews.length > 0
      ? (reviews.reduce((acc, r) => acc + r.calificacion, 0) / reviews.length).toFixed(1)
      : "0.0";
  }, [reviews]);

  // 🔹 Comentarios visibles
  const visibleReviews = expandedComments ? reviews : reviews.slice(0, 3);
  const hasMoreReviews = reviews.length > 3;

  return (
    <div className="mt-10 border-t pt-8 w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Opiniones del producto</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 📌 Estadísticas */}
        <div className="bg-gray-50 p-6 rounded-lg">
          <div className="flex items-center justify-between mb-4">
            <span className="text-3xl font-bold text-gray-900">{averageRating}</span>
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FaStar
                  key={i}
                  className={i < Math.round(parseFloat(averageRating)) ? "text-yellow-400" : "text-gray-300"}
                  size={24}
                />
              ))}
            </div>
            <span className="text-gray-600">({reviews.length} reseñas)</span>
          </div>

          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={ratingData} layout="vertical" barSize={10}>
              <XAxis type="number" hide />
              <YAxis type="category" dataKey="rating" width={40} tick={{ fill: "#333", fontSize: 12 }} />
              <Tooltip cursor={{ fill: "#f3f4f6" }} />
              <Bar dataKey="count" fill="#DC2626" radius={[3, 3, 3, 3]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* 📌 Formulario de reseñas */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Escribe tu reseña</h3>

          {!currentUser && !loading ? (
            <p className="text-gray-600 text-sm">
              <button className="text-red-600 font-semibold" onClick={() => navigate("/perfil")}>
                Inicia sesión
              </button>{" "}
              para dejar una reseña.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex items-center mb-4">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <label key={index}>
                      <input
                        type="radio"
                        name="rating"
                        className="hidden"
                        value={ratingValue}
                        onClick={() => setRating(ratingValue)}
                      />
                      <FaStar
                        className="cursor-pointer"
                        color={ratingValue <= (hover || rating) ? "#FBBF24" : "#e4e5e9"}
                        size={24}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                      />
                    </label>
                  );
                })}
              </div>

              <textarea
                className="border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2 focus:ring-red-500 focus:border-red-500 text-gray-700 placeholder-gray-500 min-h-20"
                placeholder="Comparte tu experiencia con este producto..."
                required
                value={newReview.comentario}
                onChange={(e) => setNewReview({ ...newReview, comentario: e.target.value })}
              ></textarea>

              <button
                type="submit"
                className="py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md hover:bg-red-700 transition duration-200"
              >
                Enviar reseña
              </button>
            </form>
          )}
        </div>
      </div>

      {/* 🔹 Sección de comentarios guardados */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">Comentarios</h3>
        {reviews.length === 0 ? (
          <p className="text-gray-600">Aún no hay comentarios.</p>
        ) : (
          <div>
            {visibleReviews.map((review) => (
              <div key={review.id} className="mb-4 p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        color={index < review.calificacion ? "#FBBF24" : "#e4e5e9"}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.fecha_review).toLocaleDateString()}
                  </span>
                </div>
                <p className="mt-2 text-gray-800">{review.comentario}</p>
                <p className="mt-1 text-sm text-gray-600">Por: {review.nombre_cliente}</p>
              </div>
            ))}
            
            {hasMoreReviews && (
              <button 
                onClick={() => setExpandedComments(!expandedComments)}
                className="mt-4 flex items-center gap-1 text-red-600 hover:text-red-800 transition-colors mx-auto"
              >
                <span>Ver {expandedComments ? 'menos' : 'más'} comentarios</span>
                {expandedComments ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ReviewsSection;