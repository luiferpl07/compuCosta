import React, { useEffect, useState, useMemo } from "react";
import { FaStar } from "react-icons/fa";
import { toast } from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { config } from "../../config";
import { ChevronDown, ChevronUp } from "lucide-react";

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
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // ─── Cargar reseñas del producto ─────────────────────────────────────────
  useEffect(() => {
    if (!productId) return;

    const fetchReviews = async () => {
      setLoadingReviews(true);
      try {
        // FIX: Pasar productId como número limpio, sin decimales ni NaN
        const pid = parseInt(productId, 10);
        if (isNaN(pid)) {
          console.error("❌ productId inválido:", productId);
          return;
        }

        const url = `${config?.baseUrl}${config?.apiPrefix}/reviews?productId=${pid}`;
        console.log("📌 Cargando reseñas:", url);

        const res = await fetch(url, { cache: "no-store" });
        if (!res.ok) throw new Error(`Error ${res.status} cargando reseñas`);

        const data = await res.json();

        const filtered = Array.isArray(data)
          ? data.filter((r: Review) => r.id_producto === pid)
          : [];

        console.log(`✅ Reseñas cargadas: ${filtered.length} para producto ${pid}`);
        setReviews(filtered);
      } catch (error) {
        console.error("❌ Error cargando reseñas:", error);
        toast.error("No se pudieron cargar las reseñas");
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchReviews();
  }, [productId]);

  // ─── Redirección al login ─────────────────────────────────────────────────
  const handleLoginRedirect = () => {
    const currentPath = location.pathname;
    navigate(`/perfil?redirect=${encodeURIComponent(currentPath)}`);
  };

  // ─── Enviar reseña ────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      handleLoginRedirect();
      return;
    }

    if (!newReview.comentario.trim()) {
      toast.error("Por favor escribe un comentario");
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error("Por favor selecciona una calificación");
      return;
    }

    const pid = parseInt(productId, 10);
    if (isNaN(pid)) return;

    const reviewData: NewReview = {
      id_producto: pid,
      nombre_cliente: `${currentUser.firstName} ${currentUser.lastName}`,
      calificacion: rating,
      comentario: newReview.comentario.trim(),
      fecha_review: new Date().toISOString(),
      aprobado: true,
    };

    setSubmitting(true);
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

      toast.success("¡Reseña enviada!");

      // FIX: No agregar al listado visible hasta que sea aprobada
      // Solo notificar al padre si corresponde
      if (onAddReview && responseData.id_producto === pid) {
        onAddReview(responseData);
      }

      setNewReview({ calificacion: 5, comentario: "" });
      setRating(5);
    } catch (error) {
      const msg = error instanceof Error ? error.message : "Error al enviar la reseña";
      toast.error(msg);
      console.error("❌ Error enviando reseña:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Datos para el gráfico ────────────────────────────────────────────────
  const ratingData = useMemo(() => {
    if (!reviews.length) return [];
    return [5, 4, 3, 2, 1].map((star) => ({
      rating: `${star} ★`,
      count: reviews.filter((r) => r.calificacion === star).length,
    }));
  }, [reviews]);

  // ─── Promedio ─────────────────────────────────────────────────────────────
  const averageRating = useMemo(() => {
    if (!reviews.length) return "0.0";
    return (
      reviews.reduce((acc, r) => acc + r.calificacion, 0) / reviews.length
    ).toFixed(1);
  }, [reviews]);

  const visibleReviews = expandedComments ? reviews : reviews.slice(0, 3);
  const hasMoreReviews = reviews.length > 3;

  return (
    <div className="mt-10 border-t pt-8 w-full">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">Opiniones del producto</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* ── Estadísticas ─────────────────────────────────────────────── */}
        <div className="bg-gray-50 p-6 rounded-lg">
          {loadingReviews ? (
            <div className="flex items-center justify-center h-32 text-gray-400">
              <span>Cargando reseñas...</span>
            </div>
          ) : reviews.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-gray-500 text-sm">
              <span>Aún no hay reseñas aprobadas para este producto.</span>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-4">
                <span className="text-3xl font-bold text-gray-900">{averageRating}</span>
                <div className="flex">
                  {[...Array(5)].map((_, i) => (
                    <FaStar
                      key={i}
                      className={
                        i < Math.round(parseFloat(averageRating))
                          ? "text-yellow-400"
                          : "text-gray-300"
                      }
                      size={24}
                    />
                  ))}
                </div>
                <span className="text-gray-600">({reviews.length} reseñas)</span>
              </div>

              <ResponsiveContainer width="100%" height={120}>
                <BarChart data={ratingData} layout="vertical" barSize={10}>
                  <XAxis type="number" hide />
                  <YAxis
                    type="category"
                    dataKey="rating"
                    width={40}
                    tick={{ fill: "#333", fontSize: 12 }}
                  />
                  <Tooltip cursor={{ fill: "#f3f4f6" }} />
                  <Bar dataKey="count" fill="#DC2626" radius={[3, 3, 3, 3]} />
                </BarChart>
              </ResponsiveContainer>
            </>
          )}
        </div>

        {/* ── Formulario ───────────────────────────────────────────────── */}
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Escribe tu reseña</h3>

          {!currentUser && !loading ? (
            <p className="text-gray-600 text-sm">
              <button
                className="text-red-600 font-semibold hover:text-red-800 transition-colors"
                onClick={handleLoginRedirect}
              >
                Inicia sesión
              </button>{" "}
              para dejar una reseña.
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              {/* Estrellas */}
              <div className="flex items-center gap-1 mb-2">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <label key={index} className="cursor-pointer">
                      <input
                        type="radio"
                        name="rating"
                        className="hidden"
                        value={ratingValue}
                        onChange={() => setRating(ratingValue)}
                      />
                      <FaStar
                        color={ratingValue <= (hover || rating) ? "#FBBF24" : "#e4e5e9"}
                        size={28}
                        onMouseEnter={() => setHover(ratingValue)}
                        onMouseLeave={() => setHover(0)}
                        onClick={() => setRating(ratingValue)}
                      />
                    </label>
                  );
                })}
                <span className="ml-2 text-sm text-gray-500">
                  {rating === 1 && "Muy malo"}
                  {rating === 2 && "Malo"}
                  {rating === 3 && "Regular"}
                  {rating === 4 && "Bueno"}
                  {rating === 5 && "Excelente"}
                </span>
              </div>

              <textarea
                className="border border-gray-300 p-3 rounded-lg shadow-sm focus:ring-2
                  focus:ring-red-500 focus:border-red-500 text-gray-700
                  placeholder-gray-500 min-h-[80px] resize-none"
                placeholder="Comparte tu experiencia con este producto..."
                required
                value={newReview.comentario}
                onChange={(e) =>
                  setNewReview({ ...newReview, comentario: e.target.value })
                }
              />

              <button
                type="submit"
                disabled={submitting}
                className="py-3 bg-red-600 text-white font-semibold rounded-lg shadow-md
                  hover:bg-red-700 transition duration-200 disabled:opacity-60
                  disabled:cursor-not-allowed"
              >
                {submitting ? "Enviando..." : "Enviar reseña"}
              </button>

              
            </form>
          )}
        </div>
      </div>

      {/* ── Lista de comentarios ──────────────────────────────────────────── */}
      <div className="mt-10">
        <h3 className="text-xl font-semibold text-gray-800 mb-4">
          Comentarios{reviews.length > 0 && ` (${reviews.length})`}
        </h3>

        {loadingReviews ? (
          <p className="text-gray-400 text-sm">Cargando comentarios...</p>
        ) : reviews.length === 0 ? (
          <p className="text-gray-600">Aún no hay comentarios.</p>
        ) : (
          <div>
            {visibleReviews.map((review) => (
              <div key={review.id} className="mb-4 p-4 border rounded-lg bg-white shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1">
                    {[...Array(5)].map((_, index) => (
                      <FaStar
                        key={index}
                        size={14}
                        color={index < review.calificacion ? "#FBBF24" : "#e4e5e9"}
                      />
                    ))}
                    <span className="ml-2 text-sm font-medium text-gray-700">
                      {review.calificacion}/5
                    </span>
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.fecha_review).toLocaleDateString("es-CO", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                {review.comentario && (
                  <p className="mt-2 text-gray-800 text-sm leading-relaxed">
                    {review.comentario}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500 font-medium">
                  Por: {review.nombre_cliente}
                </p>
              </div>
            ))}

            {hasMoreReviews && (
              <button
                onClick={() => setExpandedComments(!expandedComments)}
                className="mt-4 flex items-center gap-1 text-red-600 hover:text-red-800
                  transition-colors mx-auto font-medium text-sm"
              >
                <span>
                  Ver {expandedComments ? "menos" : `${reviews.length - 3} más`} comentarios
                </span>
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