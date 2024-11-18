import { Request, Response, Router, NextFunction } from 'express'
import { WGS84toETRS89, bboxFromETRS89 } from '../utils/projections'
import { apiElevationTif } from '../requests/apiProcess'

import Joi from 'joi'
// -90 to 90 for latitude and -180 to 180 for longitude.
const requestSchema = Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required()
})


const test123 = async (req: Request, res: Response, next: NextFunction) => {
    const validation = requestSchema.validate(req.body)
    if (validation.error) {
        res.status(400).json(validation.error.details)
        return
    }

    const coordinates: { latitude: number, longitude: number } = validation.value

    //convert wgs84 lat long to etrs89 east north
    const [easting, northing] = WGS84toETRS89(coordinates.latitude, coordinates.longitude)
    //create 1 square km bounding box from position.
    const bbox = bboxFromETRS89(easting, northing)

    try {
        const resultsUrl = await apiElevationTif(bbox)
        res.json({url: resultsUrl})
        return
    } catch (error) {
        res.status(400).json({'Maanmittauslaitos(error)': error})
        return
    }
}



const apiV1 = Router()

apiV1.get('/korkeusmalli2m', (req: Request, res: Response, next: NextFunction) => {
    res.json({'hello': 123})
})

apiV1.post('/korkeusmalli2m', (req: Request, res: Response, next: NextFunction) => {
    test123(req, res, next)
})

export default apiV1