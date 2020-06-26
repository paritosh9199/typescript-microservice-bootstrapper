import express from "express"

const apiService = (app: express.Application) => {
    const router = express.Router()

    router.get("/", (req: express.Request, res: express.Response) => {
        if (req.session)
            req.session.key1 = "value1"
        res.send("Hey!")
    })
    app.use(router)
}

export default apiService