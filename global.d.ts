namespace NodeJS {
    interface ProcessEnv {
        DATABASE_URL: string
        JWT_SECRET: string
        JWT_REFRESH_SECRET: string
        API_MAIL_USER: string
        API_MAIL_PASS: string
        BASE_URL: string
        EMAIL_REDIRECT_URL: string
    }
}

namespace Express {
    interface Request {
        user: any
    }
}
