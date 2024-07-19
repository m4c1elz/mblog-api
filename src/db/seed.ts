import { faker } from "@faker-js/faker"
import { db } from "./connection"
import { comments, posts, users } from "./schema"
import { hashSync } from "bcryptjs"
import { createSpinner } from "nanospinner"

const spinner = createSpinner()

async function seed() {
    spinner.start({
        text: "Gerando usuários...",
    })

    let availableUsers: number[] = []
    let availablePosts: number[] = []

    await Promise.all(
        Array.from({ length: 20 }).map(async () => {
            try {
                const [user] = await db.insert(users).values({
                    name: faker.person.firstName(),
                    email: faker.internet.email(),
                    password: hashSync(faker.internet.password(), 10),
                    atsign: faker.person.firstName().toLowerCase(),
                    description: faker.person.bio(),
                    isVerified: 1,
                    createdAt: faker.date.between({
                        from: new Date("2023-01-01"),
                        to: new Date(),
                    }),
                })
                availableUsers.push(user.insertId)
            } catch (error) {
                console.log(error)
            }
        })
    )

    spinner.update({
        text: "Adicionando postagens...",
    })

    await Promise.all(
        availableUsers.map(async user => {
            const [post] = await db.insert(posts).values({
                userId: user,
                post: faker.person.bio(),
            })
            availablePosts.push(post.insertId)
        })
    )

    spinner.update({
        text: "Adicionando comentários...",
    })

    await Promise.all(
        availablePosts.map(async post => {
            await db.insert(comments).values({
                postId: availablePosts[
                    Math.floor(Math.random() * availableUsers.length)
                ],
                userId: availableUsers[
                    Math.floor(Math.random() * availableUsers.length)
                ],
                comment: faker.person.bio(),
            })
        })
    )

    spinner.success({
        text: "Seed do banco de dados feito com sucesso.",
    })

    process.exit()
}

seed()
