import { Router } from "express"
import { postController } from "../controllers/post-controller"
import { validateToken } from "../middlewares/validate-token"

const router = Router()

router.use("*", validateToken)

router.get("/", postController.getPosts)
router.get("/:id", postController.getPost)
router.post("/", postController.createPost)
router.post("/:id/comments", postController.createComment)
router.put("/:post_id/comments/:comment_id", postController.updateComment)
router.put("/:id", postController.updatePost)
router.delete("/:id", postController.deletePost)
router.delete("/:post_id/comments/:comment_id", postController.deleteComment)

export const postRouter = router
