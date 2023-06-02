// const passportLocal = require('passport-local')
// const Strategy = require('passport-local').Strategy
const LocalStrategy = require('passport-local').Strategy;
const User = require('models').User;

const local = new LocalStrategy({ usernameField: 'email' }, (email, password, done) => {
  User.findOne({
    where: { email: email },
  }).then((user) => {
    if (!user) return done(null, false, { message: `Invalid email or password` });
    user.comparePassword(password, (err, isMatch) => {
      if (isMatch) {
        return done(null, user);
      } else {
        return done(null, false, { message: 'Invalid email or password' });
      }
    });
  });
});

module.exports = function (app, passport) {
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });

  passport.deserializeUser((id, done) => {
    User.findById(id, (err, user) => {
      done(err, user);
    });
  });

  passport.use(local);
};
