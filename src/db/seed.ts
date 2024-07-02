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
    await db.insert(users).values(
        Array.from({ length: 20 }).map(() => ({
            name: faker.person.firstName(),
            email: faker.internet.email(),
            password: hashSync(faker.internet.password(), 10),
            atsign: faker.person.firstName().toLowerCase(),
            description: faker.person.bio(),
            isVerified: 1,
            followers: faker.number.int({
                min: 10,
                max: 100,
            }),
        }))
    )
    spinner.success({
        text: "Usuários gerados!",
    })

    process.exit()
}

seed()
