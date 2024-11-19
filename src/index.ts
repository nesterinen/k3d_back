import express, { Application, json } from 'express'
const app: Application = express()
app.use(json())

import cors from 'cors'
app.use(cors())

import morgan from 'morgan'
app.use(morgan('tiny'))

import mainPage from './controllers/mainPage'
app.use('/', mainPage)

import apiV1 from './controllers/apiV1'
app.use('/api/v1', apiV1)

import utilsV1 from './controllers/utilsV1'
app.use('/utils/v1', utilsV1)

import ignoreFavicon from './middleware/favicon'
app.use(ignoreFavicon)

import { port } from './utils/config'
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`)
})

export { app }