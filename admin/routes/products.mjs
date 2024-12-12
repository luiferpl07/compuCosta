import { Router } from "express";
import { productos } from "../constants/index.mjs";

const router = Router();

router.get("/productos", (req, res) => {
  res.send(productos);
});

router.get("/productos/:id", (req, res) => {
  const productId = parseInt(req.params.id);
  const producto = productos.find((item) => item._id === productId);

  if (!productId) {
    return res.status(404).json({ message: "No se encontro ningun producto" });
  }
  res.send(producto);
});

export default router;
