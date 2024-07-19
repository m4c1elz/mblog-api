import { faker } from "@faker-js/faker"
import { users, comments, posts, followers } from "./schema"
import { hashSync } from "bcryptjs"
import { db } from "./connection"
import { createSpinner } from "nanospinner"

const spinner = createSpinner()

async function seed() {
    spinner.start({
        text: "Initializing...",
    })

    const seedUsers: (typeof users.$inferInsert)[] = []
    const seedPosts: (typeof posts.$inferInsert)[] = []
    const seedComments: (typeof comments.$inferInsert)[] = []
    const seedFollowers: (typeof followers.$inferInsert)[] = []

    spinner.update({ text: "Creating users..." })

    const uniqueIds = faker.helpers.uniqueArray(
        () => faker.number.int({ max: 800 }),
        80
    )
    const uniqueAtsigns = faker.helpers.uniqueArray(
        () => faker.person.firstName().toLowerCase(),
        20
    )

    Array.from({ length: 20 }).forEach((_, index) => {
        seedUsers.push({
            id: uniqueIds[index],
            name: faker.person.firstName(),
            atsign: uniqueAtsigns[index],
            email: faker.internet.email(),
            description: faker.person.bio(),
            password: hashSync("senha123", 10),
            createdAt: faker.date.between({
                from: "2024-01-01",
                to: "2024-07-16",
            }),
            isVerified: 1,
        })
    })

    spinner.update({ text: "Creating posts..." })

    Array.from({ length: 50 }).forEach((_, index) => {
        const randomUser = Math.floor(Math.random() * seedUsers.length)

        const userId = seedUsers[randomUser].id as number

        seedPosts.push({
            id: uniqueIds[index],
            userId,
            post: faker.lorem.sentence(),
            createdAt: faker.date.between({
                from: "2024-01-01",
                to: "2024-07-16",
            }),
        })
    })

    spinner.update({ text: "Creating comments..." })

    Array.from({ length: 50 }).forEach((_, index) => {
        const randomUser = Math.floor(Math.random() * seedUsers.length)
        const userId = seedUsers[randomUser].id as number

        const randomPost = Math.floor(Math.random() * seedPosts.length)
        const postId = seedPosts[randomPost].id as number

        seedComments.push({
            id: uniqueIds[index],
            userId,
            postId,
            comment: faker.lorem.sentence(),
            createdAt: faker.date.between({
                from: "2024-01-01",
                to: "2024-07-16",
            }),
        })
    })

    spinner.update({ text: "Creating followers..." })

    for (const _ in [0]) {
        let lastCombination: number[][] = []
        let currentIndex: number = -1
        for (const _ in seedUsers) {
            currentIndex++
            const randomUserIndex = Math.floor(Math.random() * seedUsers.length)
            const randomUser = seedUsers[randomUserIndex]

            const randomFollowerIndex = Math.floor(
                Math.random() * seedUsers.length
            )
            const randomFollower = seedUsers[randomFollowerIndex]

            if (randomUser.id === randomFollower.id) continue

            const combination = [randomUser.id!, randomFollower.id!]
            if (combination === lastCombination[currentIndex]) continue

            seedFollowers.push({
                userId: randomUser.id!,
                followerId: randomFollower.id!,
            })
            lastCombination.push([randomUser.id!, randomFollower.id!])
        }
    }

    spinner.update({
        text: "Pushing data to database...",
    })

    await db.insert(users).values(seedUsers)
    await db.insert(posts).values(seedPosts)
    await db.insert(comments).values(seedComments)
    await db.insert(followers).values(seedFollowers)

    spinner.success({
        text: "Database seeded with success.",
    })

    process.exit()
}

seed()
