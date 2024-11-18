import dotenv from 'dotenv'

dotenv.config()


export const port = process.env.PORT || 8000

export const api_key = process.env.API_KEY || 'no_api_key'
