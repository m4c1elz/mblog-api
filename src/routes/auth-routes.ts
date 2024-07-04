import { Router } from "express"
import { authController } from "../controllers/auth-controller"

const router = Router()

router.get("/refresh", authController.refresh)
router.post("/login", authController.login)
router.post("/register", authController.register)

export const authRouter = router
