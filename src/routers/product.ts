import { addToFavourite, createProduct, deleteproduct, getAllproduct, getProductById, getUserFavorites, removeFromFavourite, updateProduct } from "#/controller/product";
import { isAdmin, mustAuth } from "#/middleware/user";
import { Router } from "express";

const router = Router();

router.get("/products", mustAuth, isAdmin, getAllproduct);
router.get('/:productId',mustAuth, isAdmin, getProductById);
router.post('/create-product',mustAuth, isAdmin, createProduct);
router.patch('/:productId', mustAuth, isAdmin, updateProduct);
router.delete('/:productId', mustAuth, isAdmin, deleteproduct);
router.post('/add-to-fav', mustAuth, addToFavourite);
router.post('/remove-from-fav', mustAuth, removeFromFavourite)
router.get('/user-fav', mustAuth, getUserFavorites)

export default router 