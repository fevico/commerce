import { createCategory, deleteCategory, getCategories, getCategory, updateCategory } from "#/controller/category";
import { Router } from "express";

const router = Router();

router.post('/create-category', createCategory);
router.get('/all-category', getCategories);
router.get('/:catId', getCategory); 
router.patch('/:catId', updateCategory); 
router.delete('/:catId', deleteCategory);


export default router;