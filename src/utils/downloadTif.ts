import axios from "axios"

const downloadTif = async (urlPath: string) => {
    return axios
        .get(urlPath, { responseType: 'arraybuffer' })
        .then(response => {
            return response.data
        })
        .catch(error => {
            throw error
        })
}

export default downloadTif