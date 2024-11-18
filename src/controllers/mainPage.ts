import { request, Request, Response, Router } from 'express'

const mainPage = Router()

mainPage.get('/', (req: Request, res: Response) => {
    console.log('main page')
    res.send('Welcome to Kartta3d backend.')
})

mainPage.get('/favicon.ico', (req: Request, res: Response) => {
    res.status(204) // 204 no content
})

export default mainPage