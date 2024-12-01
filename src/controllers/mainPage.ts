import { Request, Response, Router } from 'express'

const mainPage = Router()

mainPage.get('/', (req: Request, res: Response) => {
    res.json({
        message: 'Welcome to Kartta3d backend.',
        paths: ['/api/v1', '/utils/v1', '/wcs/v1']
    })
})

export default mainPage