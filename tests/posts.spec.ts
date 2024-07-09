import { afterAll, beforeAll, expect, expectTypeOf, test } from "vitest"
import { User } from "../src/types/user"
import jwt from "jsonwebtoken"
import { UserPayload } from "../src/types/user-payload"

const { JWT_SECRET, BASE_URL } = process.env

let token: string
let user: Partial<User["name"]>
let userId: Partial<User["id"]>
async function logTestUserIn() {
    const response = await fetch(`${BASE_URL}/auth/login`, {
        method: "POST",
        headers: new Headers({ "Content-Type": "application/json" }),
        body: JSON.stringify({
            email: "gridhaha@gmail.com",
            password: "senha123",
        }),
    })
    if (!response.ok) throw new Error("Error on sign in")
    const result = await response.json()

    token = result.token
    user = result.user

    const decoded = jwt.verify(token, JWT_SECRET) as UserPayload
    userId = decoded.userId
}

async function logTestUserOut() {
    const response = await fetch(`${BASE_URL}/auth/logout`, {
        headers: new Headers({
            authorization: `Bearer ${token}`,
        }),
    })
    if (!response.ok) throw new Error("Error on sign out")
}

beforeAll(logTestUserIn)
afterAll(logTestUserOut)

test("GET /posts without token should return 401 unauthorized error", async () => {
    const response = await fetch(`${BASE_URL}/posts`)

    expect(response.status).toBe(401)
    expect(await response.text()).toBe("Unauthorized")
})

test("/GET /posts with token should return a list of posts", async () => {
    const response = await fetch(`${BASE_URL}/posts`, {
        headers: new Headers({
            authorization: `Bearer ${token}`,
        }),
    })

    expect(response.status).toBe(200)
    expectTypeOf(await response.json()).toMatchTypeOf<
        {
            id: number
            name: string | null
            atsign: string | null
            post: string
            createdAt: Date
            updatedAt: Date | null
        }[]
    >()
})

test("POST /posts should return status 201", async () => {
    const response = await fetch(`${BASE_URL}/posts`, {
        method: "POST",
        body: JSON.stringify({
            post: "Esta postagem foi criada via teste.",
        }),
        headers: new Headers({
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
        }),
    })

    expect(response.status).toBe(201)
})
