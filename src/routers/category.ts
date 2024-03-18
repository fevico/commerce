import { createCategory, deleteCategory, getCategories, getCategory, updateCategory } from "#/controller/category";
import { isAdmin, mustAuth } from "#/middleware/user";
import { Router } from "express";

const router = Router();

router.post('/create-category', mustAuth, isAdmin, createCategory);
router.get('/all-category', mustAuth, getCategories);
router.get('/:catId',mustAuth, getCategory); 
router.patch('/:catId', mustAuth, isAdmin, updateCategory); 
router.delete('/:catId',mustAuth, isAdmin, deleteCategory);


export default router;