export interface ApiProcessResponse {
    jobID: string, //"35fcbe67-32a6-4a32-accc-5cb4a3fcfad1"
    status: "accepted" | "running" | "successful" | "failed" | "dismissed",
    message: string, // "Response successful"
    progress: number, // 0 - 100
    create: string, //"2023-01-25T08:57:39.196+0200"
    links: JobLinks[]
}

export interface JobLinks {
    href: string, // "https://avoin-paikkatieto.maanmittauslaitos.fi/tiedostopalvelu/ogcproc/v1/jobs/35fcbe67-32a6-4a32-accc-5cb4a3fcfad1/results/"
    rel: string, // self
    type: string |"application/json",
    title: string
}

export interface ApiResultsResponse {
    uuid: string, // 'd3bc768c-a35e-4590-9243-948e100814e8'
    jobDescription: JobDescription,
    processId: string, //'korkeusmalli_2m_bbox'
    status: "accepted" | "running" | "successful" | "failed" | "dismissed",
    progress: number, // 0 - 100
    jobCreateTime: string, //'2024-10-21T11:38:06.149+03:00'
    statusMessage: string,//'successfully executed job'
    owner: string, //'default'
    results: JobResults[]
}

export interface JobDescription {
    id: string | 'korkeusmalli_2m_bbox',
    inputs: {
        boundingBoxInput: number[], // [1, 2, 3, 4]
        fileFormatInput: string | 'TIFF'
    }
}


export interface JobResults {
    path: string, // download url
    format: string | 'TIFF',
    crs: string | 'etrs-tm35fin',
    mimeType: string | 'image/tiff',
    length: string // but its number in string..
}