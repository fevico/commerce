import { createCategory, deleteCategory, getCategories, getCategory, updateCategory } from "#/controller/category";
import { isAdmin, mustAuth } from "#/middleware/user";
import { Router } from "express";

const router = Router();

router.post('/create-category', mustAuth, isAdmin, createCategory);
router.get('/all-category', getCategories);
router.get('/:catId', getCategory); 
router.patch('/:catId', mustAuth, isAdmin, updateCategory); 
router.delete('/:catId',mustAuth, isAdmin, deleteCategory);


export default router;