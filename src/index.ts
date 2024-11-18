import express, { Application } from 'express'
const app: Application = express()

import cors from 'cors'
app.use(cors())

import morgan from 'morgan'
app.use(morgan('tiny'))

import mainPage from './controllers/mainPage'
app.use('/', mainPage)

import { config } from './utils/config'
app.listen(config.port, () => {
  console.log(`Server running on http://localhost:${config.port}`)
})

export { app }