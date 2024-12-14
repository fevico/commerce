import { searchProducts } from "#/controller/search";
import { Router } from "express";

const searchRouter = Router()
searchRouter.get('/products', searchProducts)
export default searchRouter