import { createUser, generateForgetPasswordLink, isValidPasswordReset, signIn, updatePassword } from "#/controller/auth";
import { isValidPasswordResetToken } from "#/middleware/user";
import { Router } from "express";

const router = Router();

router.post('/create', createUser)
router.post('/sign-in', signIn)
router.post('/generate-password-link', generateForgetPasswordLink)
router.post('/verify-password-link', isValidPasswordResetToken, isValidPasswordReset)
router.post('/update-password', updatePassword)

export default router;