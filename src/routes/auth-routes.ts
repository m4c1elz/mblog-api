import { Router } from "express"
import { authController } from "../controllers/auth-controller"

const router = Router()

router.get("/refresh", authController.refresh)
router.post("/login", authController.login)
router.post("/register", authController.register)
router.get("/confirm/:token", authController.verifyEmail)

export const authRouter = router
