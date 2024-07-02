import { Router } from "express"
import { authController } from "../controllers/auth-controller"

const router = Router()

router.get("/refresh", authController.refresh)
router.post("/login", authController.login)

export const authRouter = router
