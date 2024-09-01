import { NextFunction, Request, Response } from "express"

export async function errorHandler(
    err: Error,
    req: Request,
    res: Response,
    next: NextFunction
) {
    res.status(500).json({
        msg: "Unexpected error.",
        info: err.message,
    })
}
