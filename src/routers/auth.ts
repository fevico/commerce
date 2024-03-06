import { createUser } from "#/controller/auth";
import { Router } from "express";

const router = Router();

router.post('/create', createUser)

export default router;