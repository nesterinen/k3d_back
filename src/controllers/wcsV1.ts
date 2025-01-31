import { Request, Response, Router } from 'express'
import { api_key } from '../utils/config'
import axios from 'axios'
import { WGS84toETRS89, bboxFromETRS89 } from '../utils/projections'
import Joi from 'joi'

// https://www.maanmittauslaitos.fi/ortokuvien-ja-korkeusmallien-kyselypalvelu/tekninen-kuvaus

interface requestSchemaProps{
    latitude: number,
    longitude: number,
    size: number,
}
const requestSchema = Joi.object<requestSchemaProps>({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    size: Joi.number().min(500).max(2000),
})


type coverageType = 'korkeusmalli_2m' | 'ortokuva_vari' | 'ortokuva_vaaravari' // |  'ortokuva_mustavalko'

const getWCS = async (bbox: number[], coverage: coverageType)=> {
    const baseUrl = 'https://avoin-karttakuva.maanmittauslaitos.fi/ortokuvat-ja-korkeusmallit/wcs/v2?service=WCS&version=2.0.1&request=GetCoverage'
    const type = `&CoverageID=${coverage}`
    const easting = `&SUBSET=E(${bbox[0]},${bbox[2]})`
    const northing = `&SUBSET=N(${bbox[1]},${bbox[3]})`
    const format = '&format=image/tiff'
    //const compression = '&geotiff:compression=LZW'

    // normal sizes: korkeus2m 500x500, orto 2000x2000
    let scale = '&SCALEFACTOR=1'
    if (coverage == 'ortokuva_vari' || coverage == 'ortokuva_vaaravari') {
        scale = '&SCALEFACTOR=0.25' // turn 1km2 to 500x500 = 1px = 2m
    }

    const url = baseUrl + type + easting + northing + format + scale

    const response = axios.get(
        url,
        { auth: { username: api_key, password: ''}, responseType: 'arraybuffer' }
    )

    return response.then(response => {return response.data})
}


const wcsBBOXrequest = async (req: Request, res: Response, coverage: coverageType) => {
    const validation = requestSchema.validate(req.body)
    if (validation.error) {
        console.log('WHAT')
        return res.status(400).json({'Validation error:': validation.error.details})
    }

    const coordinates: { latitude: number, longitude: number } = validation.value

    const size = 'size' in validation.value ? validation.value.size : 1000

    //convert wgs84 lat long to etrs89 east north
    const [easting, northing] = WGS84toETRS89(coordinates.latitude, coordinates.longitude)
    //create size square km bounding box from position.
    const bbox = bboxFromETRS89(easting, northing, size)

    try {
        const tifFile = await getWCS(bbox, coverage)

        res.setHeader('Content-Type', 'image/tiff')
        res.setHeader('Content-Disposition', 'attachment; filename=img.tiff')
        res.send(Buffer.from(tifFile, 'ascii')) //, 'utf-16le'
    } catch (error) {
        res.status(400).json({'error': error})
    }
}


const wcsV1 = Router()

wcsV1.post('/korkeusmalli_2m', (req: Request, res: Response) => {
    wcsBBOXrequest(req, res, 'korkeusmalli_2m')
})

wcsV1.post('/ortokuva_vari', (req: Request, res: Response) => {
    wcsBBOXrequest(req, res, 'ortokuva_vari')
})

wcsV1.post('/ortokuva_vaaravari', (req: Request, res: Response) => {
    wcsBBOXrequest(req, res, 'ortokuva_vaaravari')
})

// Description responses

wcsV1.get('/', (req: Request, res: Response) => {
    res.json({
        paths: ['/korkeusmalli_2m', '/ortokuva_vari', '/ortokuva_vaaravari']
    })
})

wcsV1.get('/korkeusmalli_2m', (req: Request, res: Response) => {
    res.json({
        inputs: requestSchema.describe(),
        output: {
            style: 'Digital Elevation Model',
            fileType: '.tiff',
            'Content-Type': 'image/tiff',
            sizeOfPixel: '2m'  
        }
    })
})

wcsV1.get('/ortokuva_vari', (req: Request, res: Response) => {
    res.json({
        inputs: requestSchema.describe(),
        output: {
            style: 'orthoimage',
            fileType: '.tiff',
            'Content-Type': 'image/tiff',
            sizeOfPixel: '2m'  
        }
    })
})

wcsV1.get('/ortokuva_vaaravari', (req: Request, res: Response) => {
    res.json({
        inputs: requestSchema.describe(),
        output: {
            style: 'orthoimage',
            fileType: '.tiff',
            'Content-Type': 'image/tiff',
            sizeOfPixel: '2m'  
        }
    })
})

export default wcsV1