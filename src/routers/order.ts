import { createOrder, getAllUserOrders, getOrderById } from "#/controller/order";
import { mustAuth } from "#/middleware/user";
import { Router } from "express";

const router = Router();

router.post('/create-order', mustAuth, createOrder)
router.get('/user-orders', mustAuth, getAllUserOrders)
router.get('/:orderId', mustAuth, getOrderById)

export default router;