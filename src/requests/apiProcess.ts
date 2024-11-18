import axios from 'axios'
import { api_key } from '../utils/config'
import { ApiProcessResponse, ApiResultsResponse } from './apiProcessTypes'

const baseUrl = 'https://avoin-paikkatieto.maanmittauslaitos.fi/tiedostopalvelu/ogcproc/v1/'

const startProcess = async (url: string, api_key: string, request_json: any): Promise<ApiProcessResponse> => {
    const response = axios.post(
        url,
        request_json,
        { auth: { username: api_key, password: '' } }
    )

    return response.then(response => {return response.data})
}

const processPolling = async (url: string, api_key: string, retries = 15, timeout = 1500): Promise<ApiProcessResponse>  => {
    function wait(ms: number) {
        return new Promise(res => setTimeout(res, ms));
    }

    return new Promise(async (resolve, reject) => {
        while (retries > 0) {
            const result: ApiProcessResponse = await axios.get(url, { auth: { username: api_key, password: '' } })
                .then(response => { return response.data })
                .catch(error => {
                    retries = 0
                    reject(error)
                })

            console.log(`status: ${result.status}, retries left: ${retries}`)

            if (result.status == 'successful') {
                resolve(result)
                return
            }

            await wait(timeout)
            retries--
        }

        reject(`Request failed after ${retries} retries`)
    })
}


const processResults = async (url: string, api_key: string): Promise<ApiResultsResponse> => {
    const response = axios.get(
        url,
        { auth: { username: api_key, password: '' } }
    )

    return response.then(response => {return response.data})
}


const apiProcess = async (url: string, api_key: string, request_json: any, retries: number) => {
    const apiProcessUrl = await startProcess(url, api_key, request_json)
        .then(data => { return data.links[0].href })
        .catch(error => { throw error.message })
      
    const apiPollingResultUrl = await processPolling(apiProcessUrl, api_key, retries)
        .then(data => { return data.links[0].href })
        .catch(error => { throw error.message })

    const apiResultsUrl = await processResults(apiPollingResultUrl, api_key)
        .then(data => { return data.results[0].path })
        .catch(error => { throw error.message })

    return apiResultsUrl
}


export const apiElevationTif= async (bbox: number[], retries=15) => {
    const processUrl = baseUrl + "processes/korkeusmalli_2m_bbox/execution"

    const request_json = {
        id: "korkeusmalli_2m_bbox",
        inputs: {
            boundingBoxInput: bbox,
            fileFormatInput: "TIFF"
        }
    }

    return await apiProcess(processUrl, api_key, request_json, retries)
}