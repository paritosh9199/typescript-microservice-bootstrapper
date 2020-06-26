// eslint-disable-next-line no-unused-vars
import express, { Request, Response } from "express"
import { registerController, loginController, logoutController } from "../controllers/auth_controller"

import { auth_middleware_wrapper_IS_LOGGED_OUT, auth_middleware_wrapper_IS_LOGGED_IN } from "../middleware/auth_middleware"

const authService = (app: express.Application) => {
    const router = express.Router()

    router.get("/auth", (req: Request, res: Response) => {
        res.send("Auth!")
    })

    router.post("/register",
        auth_middleware_wrapper_IS_LOGGED_OUT,
        registerController)

    router.post("/login",
        auth_middleware_wrapper_IS_LOGGED_OUT,
        loginController)

    router.post("/logout",
        auth_middleware_wrapper_IS_LOGGED_IN,
        logoutController)

    app.use(router)
}

export default authService