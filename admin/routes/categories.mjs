import { Router } from "express";
import { categorias, productos } from "../constants/index.mjs";

const router = Router();

router.get("/categorias", (req, res) => {
  res.send(categorias);
});

router.get("/categorias/:id", (req, res) => {
  const id = req.params.id;
  const matchedProducts = productos?.filter((item) => item?._base === id);

  if (!matchedProducts || matchedProducts.length === 0) {
    return res
      .status(404)
      .json({ message: "No products matched with this category" });
  }
  res.json(matchedProducts);
});

export default router;
