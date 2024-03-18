import { createProduct, deleteproduct, getAllproduct, getProductById, updateProduct } from "#/controller/product";
import { isAdmin, mustAuth } from "#/middleware/user";
import { Router } from "express";

const router = Router();

router.get("/products", mustAuth, isAdmin, getAllproduct);
router.get('/:productId',mustAuth, isAdmin, getProductById);
router.post('/create-product',mustAuth, isAdmin, createProduct);
router.patch('/:productId', mustAuth, isAdmin, updateProduct);
router.delete('/:productId', mustAuth, isAdmin, deleteproduct);

export default router 