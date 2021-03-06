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

passport.use(new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
  },
  function(email, password, done) {
    console.log("verifying...")
    User.findOne({
      email: email
    }, function(err, user) {
      if (err) {
        console.log(err);
        return done(err);
      }
      if (!user) {
        console.log("no such user")
        return done(null, false, {
          message: 'Incorrect email.'
        });
      }
      console.log("USER!!!!!!!!!: "+user)
      userSchema.comparePassword(password, user.password, function(err, isMatch) {
        if (err) {
          return done(err);
        }
        if (!isMatch) {
          return done(null, false, {
            message: 'Login failed. Please try again.'
          });
        }
        return done(null, user);
      });
    });
  }
));

function requireAdmin() {
  return function(req, res, next) {
    var good = true
    User.findOne({
      email: req.body.email
    }, function(err, user) {
      if (err) {
        return next(err);
      }
      if (!user) {
        console.log(req.body.email + " does not exist")
        good = false
        res.status(401).json({
          error: 'You are not authorized to view this content'
        });
      }
      if (!user.admin) {
        console.log(req.body.email + " is not an admin")
        good = false
        res.status(401).json({
          error: 'You are not authorized to view this content'
        });
      }
      if (good) {
        next();
      }
    });
  }
}

function loggedInAsAdmin(req, res, next) {
  console.log(req)
  var good = false
  if (req) {
    if (req.user) {
      if (req.user.admin) {
        good = true
        next();
      } else {
        res.status(401).json({
          error: 'You are not authorized to view this content'
        });
      }
    } else {
      res.status(401).json({
        error: 'You are not authorized to view this content'
      });
    }
  } else {
    res.status(401).json({
      error: 'You are not authorized to view this content'
    });
  }
}

function loggedIn(req, res, next) {
  console.log(req)
  if (req) {
    if (req.user) {
      console.log(req.user)
      next();
    } else {
      res.redirect('/login');
    }
  }
}

function includeMessages(req, res, next) {
  res.locals.messages = require('express-messages')(req, res);
  next();
};

routes.use(require('cookie-parser')());
routes.use(require('body-parser').urlencoded({
  extended: true
}));
routes.use(require('express-session')({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false
}));
routes.use(passport.initialize());
routes.use(passport.session());
routes.use(flash())

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

routes.get('/', loggedIn, includeMessages, (req, res) => {
  res.render('main', {
    user: req.user
  })
});

routes.get('/login', (req, res) => {
  fs.readFile('./login.html', 'utf8', async function read(err, html) {
    res.status(200).send(html);
  })
});

routes.get('/logout', function(req, res) {
  req.logout();
  res.redirect('/');
});

routes.get('/admin', (req, res) => {
  res.render('loginasadmin', {
    expressFlash: ""
  })
});

routes.get('/register', (req, res) => {
  fs.readFile('./register.html', 'utf8', async function read(err, html) {
    res.status(200).send(html);
  })
});

routes.post('/register', (req, res) => {
  var email = req.body.email
  var pass = req.body.password

  var temp = new User({
    email: email,
    password: pass
  })
  temp.save().then((doc) => {
    req.login(temp, function(err) {
      if (!err) {
        res.redirect('/');
      } else {
        console.log(err)
      }
    })
  })

})

routes.post('/login',
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/login',
    failureFlash: 'failed',
    successFlash: 'WIN'
  })
);

routes.post('/loginasadmin',
  requireAdmin(),
  passport.authenticate('local', {
    successRedirect: '/',
    failureRedirect: '/test',
    failureFlash: 'failed',
    successFlash: 'WIN'
  })
);

module.exports = routes;
