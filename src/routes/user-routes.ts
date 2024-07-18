import { Router } from "express"
import { userController } from "../controllers/user-controller"
import { validateToken } from "../middlewares/validate-token"

const router = Router()

router.get("/", userController.getUsers)
router.get("/:id", userController.getUserById)
router.get("/:id/posts", userController.getUserPosts)
router.get("/atsign/:atsign", userController.getUserByAtsign)
router.post("/:id/follow", validateToken, userController.follow)
router.put("/:id", validateToken, userController.updateUser)
router.delete("/:id/unfollow", validateToken, userController.unfollow)
router.delete("/:id", validateToken, userController.deleteUser)

export const userRouter = router
