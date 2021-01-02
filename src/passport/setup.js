const { User } = require('../lib/db')
const passport = require('passport')
const LocalStrategy = require('passport-local').Strategy
const jwttoken = require('../lib/token')

passport.serializeUser((user, done) => {
  done(null, user.id)
})

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user)
  })
})

passport.use(
  new LocalStrategy({ usernameField: 'email' }, async (email, password, done) => {
    const user = await User.findOne({ where: { email: email } })
    // if (err) { return done(err) }
    if (user === null) {
      return done(null, false, { message: 'Incorrect email.' })
    }
    if (!jwttoken.validPassword(user, password)) {
      return done(null, false, { message: 'Incorrect password.' })
    }
    return done(null, user)
  })
)

module.exports = passport
