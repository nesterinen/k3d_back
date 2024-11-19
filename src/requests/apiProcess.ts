import axios, { AxiosResponse } from 'axios'
import { api_key } from '../utils/config'
import { ApiProcessResponse, ApiResultsResponse } from './apiProcessTypes'

const baseUrl = 'https://avoin-paikkatieto.maanmittauslaitos.fi/tiedostopalvelu/ogcproc/v1/'
// https://www.maanmittauslaitos.fi/paikkatiedon-tiedostopalvelu/tekninen-kuvaus


interface requestJsonType {
    id: string,
    inputs: {
        boundingBoxInput: number[],
        fileFormatInput: string,
        themeInput?: string
    }
}


const startProcess = async (url: string, api_key: string, request_json: requestJsonType): Promise<ApiProcessResponse> => {
    const response = axios.post(
        url,
        request_json,
        { auth: { username: api_key, password: '' } }
    )

    return response.then(response => { return response.data })
}


const processPolling = async (url: string, api_key: string, retries = 15, timeout = 1500): Promise<ApiProcessResponse> => {
    function wait(ms: number) {
        return new Promise(res => setTimeout(res, ms));
    }

    function getProcess() {
        return new Promise<AxiosResponse<ApiProcessResponse>>(resolve => {
            const processData = axios.get<ApiProcessResponse>(url, { auth: { username: api_key, password: '' } })
            resolve( processData )
        })
    }

    return new Promise((resolve, reject) => {
        function poller(){
            getProcess()
                .then((res) => {
                    console.log(`status: ${res.data.status}, retries left: ${retries}`)
                    if ( res.data.status == 'successful') resolve(res.data)
                })
                .then(() => {    
                    if (retries <= 1) {
                        reject({message: `Request timeout after ${retries} retries`})
                    }
                    
                    wait(timeout).then(() => {
                        retries--;
                        poller()
                    })
                })
                .catch((error) => {
                    reject(error)
                })
        }

        poller()
    })
}


const processResults = async (url: string, api_key: string): Promise<ApiResultsResponse> => {
    const response = axios.get(
        url,
        { auth: { username: api_key, password: '' } }
    )

    return response.then(response => { return response.data })
}


const apiProcess = async (url: string, api_key: string, request_json: requestJsonType, retries: number) => {
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


export const apiElevationTif = async (bbox: number[], retries = 15) => {
    const processUrl = baseUrl + "processes/korkeusmalli_2m_bbox/execution"
    // https://avoin-paikkatieto.maanmittauslaitos.fi/tiedostopalvelu/ogcproc/v1/processes/korkeusmalli_2m_bbox

    const request_json = {
        id: "korkeusmalli_2m_bbox",
        inputs: {
            boundingBoxInput: bbox,
            fileFormatInput: "TIFF"
        }
    }

    return await apiProcess(processUrl, api_key, request_json, retries)
}


export const apiGeodeticGPKG = async (bbox: number[], retries = 15) => {
    const processUrl = baseUrl + "processes/kiintopisteet_bbox/execution"
    // https://avoin-paikkatieto.maanmittauslaitos.fi/tiedostopalvelu/ogcproc/v1/processes/kiintopisteet_bbox

    const request_json = {
        id: "kiintopisteet_bbox",
        inputs: {
            boundingBoxInput: bbox,
            fileFormatInput: "GPKG"
        }
    }

    return await apiProcess(processUrl, api_key, request_json, retries)
}


export const apiGeoInfo = async (bbox: number[], themeInput: string, retries = 15) => {
    const processUrl = baseUrl + "processes/maastotietokanta_bbox/execution"
    // https://avoin-paikkatieto.maanmittauslaitos.fi/tiedostopalvelu/ogcproc/v1/processes/maastotietokanta_bbox

    const request_json = {
        id: "maastotietokanta_bbox",
        inputs: {
            boundingBoxInput: bbox,
            themeInput,
            fileFormatInput: "GPKG"
        }
    }

    return await apiProcess(processUrl, api_key, request_json, retries)
}
