import { Request, Response, Router } from 'express'
import { api_key } from '../utils/config'
import axios from 'axios'

const baseUrl = 'https://avoin-karttakuva.maanmittauslaitos.fi/ortokuvat-ja-korkeusmallit/wcs/v2?service=WCS&version=2.0.1&request=GetCoverage'

const getWCS = () => {
    const type = '&CoverageID=korkeusmalli_2m'
    const easting = '&SUBSET=E(496000,496200)'
    const northing = '&SUBSET=N(7181000,7181200)'
    const format = '&format=image/tiff'
    //const compression = '&geotiff:compression=LZW'
    //const scale = '&SCALEFACTOR=0.5'

    const url = baseUrl + type + easting + northing + format

    const response = axios.get(
        url,
        { auth: { username: api_key, password: ''}, responseType: 'arraybuffer' }
    )

    return response.then(response => {return response.data})
}

const wcsKorkeusMalli2m = async (req: Request, res: Response) => {
    console.log(req.body)
    try {
        const tifFile = await getWCS()
        res.setHeader('Content-Type', 'image/tiff')
        res.setHeader('Content-Disposition', 'attachment; filename=img.tif')
        res.send(Buffer.from(tifFile, 'ascii')) //, 'utf-16le'
    } catch (error) {
        res.status(400).json({'error': error})
    }
}

const wcsV1 = Router()

wcsV1.post('/korkeusmalli2m', (req: Request, res: Response) => {
    wcsKorkeusMalli2m(req, res)
})

export default wcsV1