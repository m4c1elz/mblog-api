import { Router } from "express"
import { userController } from "../controllers/user-controller"
import { validateToken } from "../middlewares/validate-token"

const router = Router()

router.use("*", validateToken)

router.get("/", userController.getUsers)
router.get("/:id", userController.getUserById)
router.get("/:id/posts", userController.getUserPosts)
router.get("/atsign/:atsign", userController.getUserByAtsign)
router.post("/:id/follow", userController.follow)
router.put("/:id", userController.updateUser)
router.delete("/:id/unfollow", userController.unfollow)
router.delete("/:id", userController.deleteUser)

export const userRouter = router
