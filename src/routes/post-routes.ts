import { Router } from "express"
import { postController } from "../controllers/post-controller"
import { validateToken } from "../middlewares/validate-token"

const router = Router()

router.get("/", validateToken, postController.getPosts)
router.get("/:id", validateToken, postController.getPost)
router.post("/", validateToken, postController.createPost)
router.put("/:id", validateToken, postController.updatePost)

export const postRouter = router
