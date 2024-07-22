import express from "express"
import { postRouter } from "./routes/post-routes"
import { userRouter } from "./routes/user-routes"
import { authRouter } from "./routes/auth-routes"
import cookieParser from "cookie-parser"
import cors from "cors"
import "express-async-errors"

const app = express()
const port = process.env.PORT || 8080

app.use(
    cors({
        origin: process.env.CORS_ORIGIN,
        credentials: true,
        methods: ["GET", "POST", "PUT", "DELETE"],
        allowedHeaders: [
            "Origin",
            "Content-Type",
            "X-Requested-With",
            "Authorization",
        ],
    })
)
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

app.use("/posts", postRouter)
app.use("/users", userRouter)
app.use("/auth", authRouter)

app.listen(port, () => {
    console.log(`Server started on port ${port}`)
})
