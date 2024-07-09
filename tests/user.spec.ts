import { beforeAll, expect, expectTypeOf, test, afterAll } from "vitest"
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

test("GET /users in page 1 should return a list of 10 users", async () => {
    const response = await fetch(`${BASE_URL}/users?page=1`)
    const result = await response.json()

    expect(response.status).toBe(200)
    expectTypeOf(result).toMatchTypeOf<Partial<User>[]>()
})

test("PUT /users should update a user", async () => {
    const response = await fetch(`${BASE_URL}/users/${userId}`, {
        method: "PUT",
        body: JSON.stringify({
            description: "Usuário editado via testes",
        }),
        headers: new Headers({
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
        }),
    })

    expect(response.status).toBe(201)
})

test("DELETE /users with a different id from the logged in one should return 403 error", async () => {
    const response = await fetch(`${BASE_URL}/users/${userId + 1}`, {
        method: "DELETE",
        headers: new Headers({
            "Content-Type": "application/json",
            authorization: `Bearer ${token}`,
        }),
    })

    expect(response.status).toBe(403)
})
