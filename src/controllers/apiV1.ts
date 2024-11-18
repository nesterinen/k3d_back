import { Request, Response, Router, NextFunction } from 'express'


import Joi from 'joi'
// -90 to 90 for latitude and -180 to 180 for longitude.
const requestSchema = Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
})


const test123 = (req: Request, res: Response, next: NextFunction) => {
    const validation = requestSchema.validate(req.body)
    if (validation.error) {
        res.status(400).json(validation.error.details)
        return
    }

    const coordinates = validation.value


    res.json({ coordinates})
}



const apiV1 = Router()

apiV1.get('/korkeusmalli2m', (req: Request, res: Response, next: NextFunction) => {
    res.json({'hello': 123})
})

apiV1.post('/korkeusmalli2m', (req: Request, res: Response, next: NextFunction) => {
    test123(req, res, next)
})

export default apiV1