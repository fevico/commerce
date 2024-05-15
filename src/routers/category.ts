import { createCategory, deleteCategory, getCategories, getCategory, updateCategory } from "#/controller/category";
import { isAdmin, mustAuth } from "#/middleware/user";
import { validate } from "#/middleware/validator";
import { categoryValidation } from "#/utils/validationSchema";
import { Router } from "express";

const router = Router();

router.post('/create-category', mustAuth, isAdmin, validate(categoryValidation), createCategory);
router.get('/all-category', getCategories);
router.get('/:catId', getCategory); 
router.patch('/:catId', mustAuth, isAdmin, validate(categoryValidation), updateCategory); 
router.delete('/:catId',mustAuth, isAdmin, deleteCategory);

export default router; 