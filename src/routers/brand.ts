import { create, deleteBrandById, getAllBrand, getBrandById, updateBrandById } from "#/controller/brand";
import { Router } from "express";

const brandRouter = Router()

brandRouter.post('/create', create)
brandRouter.get('/all-brands', getAllBrand)
brandRouter.get('/:id', getBrandById)
brandRouter.patch('/:id', updateBrandById)
brandRouter.delete('/:id', deleteBrandById)
export default brandRouter