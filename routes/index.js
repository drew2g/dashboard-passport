//var app = connect();
const routes = require('express').Router();

var fs = require('fs')
var flash = require('connect-flash');
var connect = require('connect');
var userSchema = require('../schemas/userschema.js')
var mongoose = require('mongoose')
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;
var cookieparser = require('cookie-parser')
var session = require('express-session')
var bodyParser = require('body-parser')
User = userSchema.User_model();

passport.use(new LocalStrategy(
  {
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    console.log("verifying...")
    User.findOne({ email: email }, function(err, user) {
      if (err) { console.log(err); return done(err); }
      if (!user) {
        console.log("no such user")
        return done(null, false, { message: 'Incorrect email.' });
      }
      if (user.password != password) {
        console.log("no such password")
        return done(null, false, { message: 'Incorrect password.' });
      }
      return done(null, user);
    });
  }
));

routes.use(require('cookie-parser')());
routes.use(require('body-parser').urlencoded({ extended: true }));
routes.use(require('express-session')({ secret: 'keyboard cat', resave: false, saveUninitialized: false }));
routes.use(passport.initialize());
routes.use(passport.session());
routes.use(flash())

passport.serializeUser(function(user, cb) {
  cb(null, user.id);
});

passport.deserializeUser(function(id, cb) {
  User.findById(id, function (err, user) {
    if (err) { return cb(err); }
    cb(null, user);
  });
});

passport.serializeUser(function(user, done) {
  console.log("serializing...")
  done(null, user.id);
});

passport.deserializeUser(function(id, done) {
  console.log("deserializing...")
  User.findById(id, function(err, user) {
    done(err, user);
  });
});


routes.get('/test', (req, res) => {
  res.status(200).json({
    message: 'Connected!'
  });
});

routes.get('/login', (req, res) => {
  fs.readFile('./login.html', 'utf8', async function read(err, html) {
    res.status(200).send(html);
  })
});

routes.get('/register', (req, res) => {
  fs.readFile('./register.html', 'utf8', async function read(err, html) {
    res.status(200).send(html);
  })
});

routes.post('/register', (req,res) => {
  var email = req.body.email
  var pass = req.body.password

  console.log(email)
  console.log(pass)

  var temp = new User({email:email, password:pass})
  temp.save()
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/test',
                                   failureFlash: 'failed',
                                   successFlash: 'WIN'})
  res.status(200).send({"hi":email})
})

routes.post('/login',
  passport.authenticate('local', { successRedirect: '/',
                                   failureRedirect: '/test',
                                   failureFlash: 'failed',
                                   successFlash: 'WIN' })
);





module.exports = routes;
