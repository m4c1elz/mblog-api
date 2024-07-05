import { Router } from "express"
import { userController } from "../controllers/user-controller"
import { validateToken } from "../middlewares/validate-token"

const router = Router()

router.get("/", userController.getUsers)
router.get("/:id", userController.getUser)
router.put("/:id", validateToken, userController.updateUser)
router.delete("/:id", validateToken, userController.deleteUser)

export const userRouter = router
