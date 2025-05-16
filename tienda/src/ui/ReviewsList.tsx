import React from "react";
import { Rating } from "@mui/material";
import { Box, Typography, Paper } from "@mui/material";

interface Review {
  id: number;
  nombre_cliente: string;
  calificacion: number;
  comentario?: string;
  fecha_review: Date;
}

interface ReviewsListProps {
  reviews: Review[];
}

const ReviewsList: React.FC<ReviewsListProps> = ({ reviews }) => {
  return (
    <Box sx={{ mt: 4 }}>
      <Typography variant="h6">Reseñas</Typography>
      {reviews.length > 0 ? (
        reviews.map((review) => (
          <Paper key={review.id} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
            <Typography variant="subtitle1" fontWeight="bold">
              {review.nombre_cliente}
            </Typography>
            <Rating value={review.calificacion} readOnly />
            <Typography variant="body2" color="text.secondary">
              {review.comentario}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {new Date(review.fecha_review).toLocaleDateString()}
            </Typography>
          </Paper>
        ))
      ) : (
        <Typography>No hay reseñas aún.</Typography>
      )}
    </Box>
  );
};

export default ReviewsList;
