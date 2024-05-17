import { create, deleteBlog, getAllBlogs, getBlogById, updateBlog } from "#/controller/blog";
import { isAdmin, mustAuth } from "#/middleware/user";
import { validate } from "#/middleware/validator";
import { blogValidationSchema } from "#/utils/validationSchema";
import { Router } from "express";

const router = Router()

router.post('/create', mustAuth, isAdmin, validate(blogValidationSchema), create)
router.get('/all-blogs', getAllBlogs)
router.get('/:id', getBlogById)
router.patch('/:id', mustAuth, isAdmin, updateBlog)
router.delete('/:id', mustAuth, isAdmin, deleteBlog)

export default router