import { Request, Response } from "express"
import { hash } from "bcryptjs"
import type { User } from "../types/user"
import * as userServices from "../services/user"

export const userController = {
    async getUsers(req: Request, res: Response) {
        const { query } = req

        const page = Number(query.page)
        const search = typeof query.search === "string" ? query.search : ""

        if (!page || isNaN(page)) {
            return res.status(400).json({ msg: "Please inform the page." })
        }

        const result = await userServices.getUsers({ page, search })

        return res.json(result)
    },
    async getUserPosts(req: Request, res: Response) {
        const { params } = req

        const id = Number(params.id)

        const result = await userServices.getUserPosts({ userId: id })

        return res.json(result)
    },
    async getUserById(req: Request, res: Response) {
        const { params } = req

        const id = Number(params.id)

        const user = await userServices.getById({
            userId: id,
            authUserId: req.user.userId,
        })

        if (!user) return res.sendStatus(404)

        return res.json(user)
    },
    async getUserByAtsign(req: Request, res: Response) {
        const { atsign } = req.params

        const result = await userServices.getByAtsign({
            atsign,
            authUserId: req.user.userId,
        })

        return res.json(result)
    },
    async follow(req: Request, res: Response) {
        const { params } = req

        const id = Number(params.id)

        if (isNaN(id)) {
            return res.sendStatus(406)
        }

        await userServices.followUser({
            id,
            authUserId: req.user.userId,
        })

        return res.sendStatus(201)
    },
    async unfollow(req: Request, res: Response) {
        const { params } = req

        const id = Number(params.id)

        if (isNaN(id)) {
            return res.sendStatus(406)
        }

        await userServices.unfollowUser({
            id,
            authUserId: req.user.userId,
        })

        return res.sendStatus(204)
    },
    async updateUser(req: Request, res: Response) {
        const { params } = req
        const { userId } = req.user
        const userData: Partial<User> = req.body

        const id = Number(params.id)

        if (isNaN(id)) return res.sendStatus(406)
        if (id !== userId) return res.sendStatus(403)

        if (userData.password) {
            userData.password = await hash(userData.password, 10)
        } else {
            delete userData.password
        }

        await userServices.updateUser({
            userId,
            userData,
        })

        return res.sendStatus(201)
    },
    async deleteUser(req: Request, res: Response) {
        const { userId } = req.user
        const { params } = req

        const id = Number(params.id)

        if (isNaN(id)) return res.sendStatus(406)
        if (id !== userId) return res.sendStatus(403)

        await userServices.deleteUser({ id })

        res.clearCookie("refresh-token")
        return res.sendStatus(200)
    },
}
