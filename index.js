const db = require('./db')
const express = require('express')
const path = require('path')
const bodyParser = require('body-parser')
const cors = require('cors')

db.connect()
  .then(api => {

    const app = express()

    app.use(bodyParser.urlencoded({ extended: true }))
    app.use(bodyParser.json())
    app.use(cors())
    app.options('*', cors())

    const port = process.env.PORT || 3000     

    console.log(`Listening on port ${port}`)
    app.listen(port)

    app.get('/', (req, res) => {
      res.sendFile(__dirname + '/index.html')
    })
    app.get('/index.html', (req, res) => {
      res.sendFile(__dirname + '/index.html')
    })

    app.get('/service-worker.js', (req, res) => {
      res.sendFile(__dirname + '/service-worker.js')    
    })

    app.use("/static", express.static(__dirname + '/static'));

    // session
    app.get('/api/v0/sessions/:id', (req, res) => {
      api.session(req.params.id)
        .then(res.json.bind(res))
    })

    // sessions
    app.get('/api/v0/sessions', (req, res) => {
      api.sessions()
        .then(res.json.bind(res))
    })

    // startSession
    app.post('/api/v0/sessions', (req, res) => {
      const location = req.body.location
      const timestamp = new Date().toISOString() 
      const sessionId =  `${location}-${timestamp}`
      api.startSession(sessionId, timestamp, req.body.location)
        .then(() => res.json({id: sessionId, timestamp, location}))
    })

    // buyIn
    app.post('/api/v0/sessions/:id/buyIn', (req, res) => {
      const sessionId = req.params.id
      api.buyIn(sessionId, new Date().toISOString(), req.body.amount)
        .then(() => api.session(sessionId))
        .then(res.json.bind(res))
    })

    //endSession
    app.post('/api/v0/sessions/:id/cashOut', (req, res) => {
      const sessionId = req.params.id
      api.endSession(sessionId, new Date().toISOString(), req.body.amount)
        .then(() => api.session(sessionId))
        .then(res.json.bind(res))
    })
  })
  .catch(err => {
    console.log('mongodb connection error', err)
  })
