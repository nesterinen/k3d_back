import { Request, Response, Router } from 'express'
import { WGS84toETRS89, bboxFromETRS89, ETRS89toWGS84 } from '../utils/projections'
import Joi from 'joi'

const wgs2etrsSchema = Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
})

const etrs2wgsSchema = Joi.object({
    easting: Joi.number().min(-3669433.9).max(3638050.95).required(),
    northing: Joi.number().min(1737349.4).max(9567789.69).required()
})

const etrs2bboxSchema = Joi.object({
    easting: Joi.number().min(-3669433.9).max(3638050.95).required(),
    northing: Joi.number().min(1737349.4).max(9567789.69).required(),
    size: Joi.number().min(1).required()
})

const utilsV1 = Router()

utilsV1.get('/wgs2etrs', (req: Request, res: Response) => {
    res.send('Welcome to /wgs2etrs')
})

utilsV1.post('/wgs2etrs', (req: Request, res: Response) => {
    const validation = wgs2etrsSchema.validate(req.body)

    if(validation.error) {
        res.status(400).json({'validation error:': validation.error})
        return
    }

    const etrs89 = WGS84toETRS89(validation.value.latitude, validation.value.longitude)

    res.status(200).json({
        easting: etrs89[0],
        northing: etrs89[1]
    })
})

utilsV1.post('/etrs2wgs', (req: Request, res: Response) => {
    const validation = etrs2wgsSchema.validate(req.body)

    if(validation.error) {
        res.status(400).json({'validation error:': validation.error})
        return
    }

    const WGS84 = ETRS89toWGS84(validation.value.easting, validation.value.northing)

    res.status(200).json({
        latitude: WGS84[0],
        longitude: WGS84[1]
    })
})

utilsV1.post('/etrs2bbox', (req: Request, res: Response) => {
    const validation = etrs2bboxSchema.validate(req.body)

    if(validation.error) {
        res.status(400).json({'validation error:': validation.error})
        return
    }

    const bbox = bboxFromETRS89(validation.value.easting, validation.value.northing, validation.value.size)

    res.status(200).json({bbox})
})

export default utilsV1