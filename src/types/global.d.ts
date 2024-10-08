namespace NodeJS {
    interface ProcessEnv {
        DATABASE_URL: string
        JWT_SECRET: string
        JWT_REFRESH_SECRET: string
        API_MAIL_USER: string
        API_MAIL_PASS: string
        BASE_URL: string
        EMAIL_REDIRECT_BASE_URL: string
        CORS_ORIGIN: string
    }
}

namespace Express {
    interface Request {
        user: import("./user-payload").UserPayload
    }
}
