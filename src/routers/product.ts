import {
  addToFavourite,
  createProduct,
  deleteproduct,
  getAllproduct,
  getProductById,
  getUserFavorites,
  totalNumberOfProducts,
  updateProduct,
} from "#/controller/product"; 
import { isAdmin, mustAuth } from "#/middleware/user";
import { validate } from "#/middleware/validator";
import { productValidation } from "#/utils/validationSchema";
import { Router } from "express";

const router = Router();

router.get("/products", getAllproduct);
router.get("/user-fav", mustAuth, getUserFavorites);
router.get("/:productId", getProductById);
router.post("/create-product", mustAuth, isAdmin, validate(productValidation), createProduct);
router.post("/add-to-fav", mustAuth, addToFavourite);
router.patch("/:productId", mustAuth, isAdmin, validate(productValidation), updateProduct);
router.delete("/:productId", mustAuth, isAdmin, deleteproduct);
router.get("/total/products",mustAuth, isAdmin, totalNumberOfProducts) 

export default router;
