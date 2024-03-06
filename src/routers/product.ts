import { createProduct, deleteproduct, getAllproduct, getProductById, updateProduct } from "#/controller/product";
import { Router } from "express";

const router = Router();

router.get("/products", getAllproduct);
router.get('/:productId', getProductById);
router.post('/create-product', createProduct);
router.patch('/:productId', updateProduct);
router.delete('/:productId', deleteproduct);

export default router