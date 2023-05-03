// Require Packages
const createError = require('http-errors')
const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const logger = require('morgan')
const mongoose = require('mongoose')
const cors = require('cors')
const { DB_URL } = require('./db')
// Build the App
const app = express()

// Middleware
app.use(logger('tiny'))
app.use(
  cors({
    credentials: true,
    origin: 'http://localhost:3000',
  })
)

app.use(express.json())
app.use(express.urlencoded({ extended: false }))
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
app.use(cookieParser())

// Database
mongoose.connect(
  DB_URL,
  { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false },
  () => {
    console.log('Connected to MongoDB')
  }
)

// Models
const bookings = require('./models/bookings')
const houses = require('./models/houses')
const Reviews = require('./models/Reviews')
const Users = require('./models/users')

// Security
require('./express-sessions')(app)

// Routes

// ::::
app.get('/', async (req, res) => {
  console.log(req.query)
  let products = await Users.find({})
  console.log(products)
  res.send('Hello from the Airbnb API')
})

app.get('/houses', (req, res) => {
  console.log(req.query)
  res.send('Hello from Houses')
})

app.get('/houses/:id', (req, res) => {
  console.log(req.params.id)
  res.send('Hello from Houses ID')
})

// POST /houses
app.post('/houses', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.body)
    res.send('post from houses')
  } else {
    console.log('not auth')
    res.send('Not authorized')
  }
})
// PATCH /houses/:id
app.patch('/houses/:id', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.body)
    res.send('patch from houses with ID')
  } else {
    res.send('Not authorized')
  }
})

// DELETE /houses/:id
app.delete('/houses/:id', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.body)
    res.send('delete from houses with ID')
  } else {
    res.send('Not authorized')
  }
})

// GET /bookings
app.get('/bookings', (req, res) => {
  console.log(req.body)
  res.send('Hello from Bookings')
})

// POST /bookings
app.post('/bookings', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.body)
    res.send('post bookings')
  } else {
    res.send('Not authorized')
  }
})

// GET /reviews
app.get('/reviews', (req, res) => {
  console.log(req.body)
  res.send('Hello from Reviews')
})

// POST /reviews
app.post('/reviews', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.body)
    res.send('post reviews')
  } else {
    res.send('Not authorized')
  }
})

// GET /profile
app.get('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.body)
    res.send('get profile')
  } else {
    res.send('Not authorized')
  }
})
// PATCH /profile
app.patch('/profile', (req, res) => {
  if (req.isAuthenticated()) {
    console.log(req.body)
    res.send('patch profile')
  } else {
    res.send('Not authorized')
  }
})

// POST /login
app.post('/login', async (req, res) => {
  try {
    // find user that matches email and password
    let userFound = await Users.findOne({
      email: req.body.email,
      password: req.body.password,
    })
    // check if user exits, meaning it does not equal and empty string
    if (!userFound) {
      // #TODO respond with passport
      console.log('Cannot login: User does not exist. Please sign up instead.')
      res.send('Cannot login: User does not exist. Please sign up instead.')
    } else {
      console.log(userFound)
      req.login(userFound, (err) => {
        if (err) {
          return next(err)
        }
        res.send(userFound)
      })
    }
  } catch (err) {
    res.send(err)
  }
})

// POST /signup
app.post('/signup', async (req, res) => {
  try {
    let userExists = await Users.findOne({
      email: req.body.email,
    })

    if (!userExists) {
      let user = await Users.create(req.body)
      console.log(req.body)
      res.send(user)
    } else {
      console.log('User with this email already exists')
      res.send('User with this email already exists')
    }
  } catch (err) {
    res.send(err)
  }
})

// GET /logout
app.get('/logout', async (req, res) => {
  console.log('ok')
  req.logout(function (err) {
    if (err) {
      return next(err)
    }
    req.session.destroy(function (err) {
      if (err) {
        return next(err)
      }
      res.clearCookie('connect.sid')
      res.send('Logged out')
    })
  })
})

// ::::

// Catch 404 and forward to error handler
app.use((req, res, next) => {
  next(createError(404))
})

// Error Handler
app.use((err, req, res, next) => {
  // Respond with an error
  res.status(err.status || 500)
  res.send({
    message: err,
  })
})

module.exports = app
