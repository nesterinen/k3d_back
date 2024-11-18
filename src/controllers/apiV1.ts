import { Request, Response, Router, NextFunction } from 'express'
import { WGS84toETRS89, bboxFromETRS89 } from '../utils/projections'
import { apiElevationTif, apiGeodeticGPKG, apiGeoInfo } from '../requests/apiProcess'
import downloadTif from '../utils/downloadTif'

import Joi from 'joi'
const requestSchema = Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    size: Joi.number().min(500).max(5000),
})


const apiBoundingBox = async (req: Request, res: Response, schema: Joi.ObjectSchema<any>) => {
    const validation = schema.validate(req.body)
    if (validation.error) {
        throw validation.error.details
    }

    const coordinates: { latitude: number, longitude: number } = validation.value

    const size = 'size' in validation.value ? validation.value.size : 1000

    //convert wgs84 lat long to etrs89 east north
    const [easting, northing] = WGS84toETRS89(coordinates.latitude, coordinates.longitude)
    //create size square km bounding box from position.
    const bbox = bboxFromETRS89(easting, northing, size)

    return bbox
}


const apiKorkeusMalli2m = async (req: Request, res: Response) => {
    try {
        const bbox = await apiBoundingBox(req, res, requestSchema)
        const resultsUrl = await apiElevationTif(bbox, 30)
        const tifFile = await downloadTif(resultsUrl)
        
        res.setHeader('Content-Type', 'image/tiff')
        res.setHeader('Content-Disposition', 'attachment; filename=img.tif')
        res.send(Buffer.from(tifFile, 'utf-16le'))
    } catch (error) {
        res.status(400).json({'error': error})
    }
}


const apiKiintopisteet= async (req: Request, res: Response) => {
    try {
        const bbox = await apiBoundingBox(req, res, requestSchema)
        const resultsUrl = await apiGeodeticGPKG(bbox, 30)
        const tifFile = await downloadTif(resultsUrl)
        
        res.setHeader('Content-Type', 'application/x-sqlite3')
        res.setHeader('Content-Disposition', 'attachment; filename=GeoPackage.gpkg')
        res.send(Buffer.from(tifFile, 'utf-16le'))
    } catch (error) {
        res.status(400).json({'error': error})
    }
}


const apiMaastoTieto = async (req: Request, res: Response) => {
    const extendedSchema = requestSchema.keys({
        themeInput: Joi.string().valid(
            "maastotietokanta_kaikki",
            "maasto",
            "tieliikenne",
            "vesiliikenne",
            "raideliikenne",
            "johtoverkosto",
            "hydrografia",
            "rakennukset",
            "korkeussuhteet",
            "suojelukohteet",
            "hallinnollinen_jaotus",
        ).required()
    })
    try {
        const bbox = await apiBoundingBox(req, res, extendedSchema)
        const resultsUrl = await apiGeoInfo(bbox, req.body.themeInput, 30)
        const tifFile = await downloadTif(resultsUrl)
        
        res.setHeader('Content-Type', 'application/x-sqlite3')
        res.setHeader('Content-Disposition', 'attachment; filename=GeoPackage.gpkg')
        res.send(Buffer.from(tifFile, 'utf-16le'))
    } catch (error) {
        res.status(400).json({'error': error})
    }
}


const apiV1 = Router()

apiV1.get('/korkeusmalli2m', (req: Request, res: Response, next: NextFunction) => {
    res.json(requestSchema.describe())
})

apiV1.post('/korkeusmalli2m', (req: Request, res: Response, next: NextFunction) => {
    apiKorkeusMalli2m(req, res)
})

apiV1.post('/kiintopisteet', (req: Request, res: Response, next: NextFunction) => {
    apiKiintopisteet(req, res)
})

apiV1.post('/maastotietokanta', (req: Request, res: Response, next: NextFunction) => {
    apiMaastoTieto(req, res)
})

export default apiV1