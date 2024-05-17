import { createUser, generateForgetPasswordLink, getAllUsers, getTotalUsers, isValidPasswordReset, signIn, updatePassword, updateProfile } from "#/controller/auth";
import { isAdmin, isValidPasswordResetToken, mustAuth } from "#/middleware/user";
import { validate } from "#/middleware/validator";
import { SignInValidationSchema, TokenAndIDValidation, UpdatePasswordSchema, userValidation } from "#/utils/validationSchema";
import { Router } from "express";

const router = Router();

router.post('/create', validate(userValidation), createUser)
router.post('/sign-in', validate(SignInValidationSchema), signIn)
router.post('/generate-password-link', generateForgetPasswordLink)
router.post('/verify-password-link', validate(TokenAndIDValidation), isValidPasswordResetToken, isValidPasswordReset)
router.post('/update-password', validate(UpdatePasswordSchema), updatePassword)
router.patch('/update-profile', mustAuth, updateProfile)
router.get('/total-user', mustAuth, getTotalUsers)
router.get('/all-user', mustAuth, isAdmin, getAllUsers)

export default router;