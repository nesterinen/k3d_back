import { Request, Response, Router } from 'express'

const mainPage = Router()

mainPage.get('/', (req: Request, res: Response) => {
    console.log('main page')
    res.send('Welcome to Kartta3d backend.')
})

export default mainPage