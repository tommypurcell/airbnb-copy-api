const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const session = require('express-session')
const MongoDBStore = require('connect-mongodb-session')(session)
const Users = require('./models/users')
const { DB_URL, SESSION_SECRET } = require('./db')

module.exports = (app) => {
  passport.serializeUser((user, done) => {
    done(null, user._id)
  })

  passport.deserializeUser((id, done) => {
    console.log('In deserializeUser')
    console.log('id:', id)

    Users.findById(id, (err, user) => {
      if (err) {
        console.log('Error in deserializeUser:', err)
      } else {
        console.log('User found in deserializeUser:', user)
      }

      done(err, user)
    })
  })

  passport.use(
    new LocalStrategy((email, password, done) => {
      process.nextTick(async () => {
        let user = await Users.findOne({ email: email })
        if (user) {
          return done(null, user)
        } else {
          return done(null, false, 'user not found')
        }
      })
    })
  )

  const sessionStore = new MongoDBStore({
    uri: DB_URL,
    collection: 'sessions',
  })

  app.use(
    session({
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      rolling: true,
      unset: 'destroy',
      store: sessionStore,
      cookie: {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 1 week in milliseconds
      },
    })
  )

  app.use(
    passport.initialize({
      userProperty: 'user',
    })
  )
  app.use(passport.session())
}
