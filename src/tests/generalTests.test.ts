import { test, describe } from 'node:test'
import assert from 'node:assert'
import supertest from 'supertest'
import { app } from '../index'

const appRequest = supertest(app)

describe('API util tests', () => { 
    test('GET /', async () => {
        await appRequest
            .get('/')
            .expect(200)
    })

    test('POST /utils/v1/wgs2etrs', async () => {
        const res = await appRequest
            .post('/utils/v1/wgs2etrs')
            .send({ latitude: 62.600277963310006, longitude: 29.763860324163183 })
            .expect(200)

        const correct = { easting: 641875.5789488759, northing: 6944093.518024502 }
        assert.deepEqual(res.body, correct)
    })

    test('POST /utils/v1/etrs2wgs', async () => {
        const res = await appRequest
            .post('/utils/v1/etrs2wgs')
            .send({ easting: 641875.5789488759, northing: 6944093.518024502 })
            .expect(200)

        const correct = { latitude: 62.60027796330999, longitude: 29.763860324163197 }
        assert.deepEqual(res.body, correct)
    })

    test('POST /utils/v1/etrs2bbox', async () => {
        const res = await appRequest
            .post('/utils/v1/etrs2bbox')
            .send({ easting: 641875.5789488759, northing: 6944093.518024502, size: 1000 })
            .expect(200)

        const correct = [ 641375, 6943593, 642375, 6944593 ]
        assert.deepEqual(res.body.bbox, correct)
    })
})


import { WGS84toETRS89, bboxFromETRS89, ETRS89toWGS84 } from '../utils/projections'
describe('local util tests', () => {
    test('WGS to ETRS', () => {
        const result = WGS84toETRS89(62.600277963310006, 29.763860324163183)
        const correct = [641875.5789488759, 6944093.518024502]

        assert.deepEqual(result, correct)
    })

    test('ETRS to WGS', () => {
        const result = ETRS89toWGS84(641875.5789488759, 6944093.518024502)
        const correct = [62.60027796330999, 29.763860324163197]

        assert.deepEqual(result, correct)
    })

    test('bbox from ETRS', () => {
        const result = bboxFromETRS89(641875.5789488759, 6944093.518024502)
        const correct = [ 641375, 6943593, 642375, 6944593 ]

        assert.deepEqual(result, correct)
    })
})


describe('API MaanMittausLaitos request tests', () => {
    test('POST /api/v1/korkeusmalli2m', async () => {
        const res = await appRequest
            .post('/api/v1/korkeusmalli2m')
            .send({ latitude: 62.600277963310006, longitude: 29.763860324163183 })
            .expect(200)

        
        assert(res.type, 'image/tiff')
        // res.body size is 3507832 @ { latitude: 62.600277963310006, longitude: 29.763860324163183 }
        assert.strictEqual(Buffer.byteLength(JSON.stringify(res.body)), 3507832)
    })

    test('POST /api/v1/kiintopisteet', async () => {
        const res = await appRequest
            .post('/api/v1/kiintopisteet')
            .send({ latitude: 62.600277963310006, longitude: 29.763860324163183, size: 500 })
            .expect(200)

        
        assert(res.type, 'application/x-sqlite3')
    })

    test('POST /api/v1/maastotietokanta', async () => {
        const res = await appRequest
            .post('/api/v1/maastotietokanta')
            .send({ latitude: 62.600277963310006, longitude: 29.763860324163183, size: 500, themeInput: "hallinnollinen_jaotus"})
            .expect(200)

        
        assert(res.type, 'application/x-sqlite3')
    })
})