import { createUser, generateForgetPasswordLink, isValidPasswordReset, signIn, updatePassword, updateProfile } from "#/controller/auth";
import { isValidPasswordResetToken, mustAuth } from "#/middleware/user";
import { Router } from "express";

const router = Router();

router.post('/create', createUser)
router.post('/sign-in', signIn)
router.post('/generate-password-link', generateForgetPasswordLink)
router.post('/verify-password-link', isValidPasswordResetToken, isValidPasswordReset)
router.post('/update-password', updatePassword)
router.patch('/update-profile', mustAuth, updateProfile)

export default router;