var mongoose = require('mongoose');
var fs = require("fs");
var bcrypt = require('bcrypt');
const User_Schema = new mongoose.Schema({
  email: String,
  password: String,
  admin: Boolean
});
const User = mongoose.model('User', User_Schema);

User_Schema.pre('save', function(next) {
  console.log("pre-saving password...")
  var User = this;
  var SALT_FACTOR = 5;

  if (!User.isModified('password')) {
    return next();
  }

  bcrypt.genSalt(SALT_FACTOR, function(err, salt) {
    console.log("password is salting...")
    console.log(salt)
    if (err) {
      console.log("err: "+ err)
      return next(err);
    }

    bcrypt.hash(User.password, salt, function(err, hash) {
      if (err) {
        console.log("err: "+ err)
        return next(err);
      }
      console.log("salted password is saving...")
      User.password = hash;
      next();
    });
  });
});

exports.comparePassword = function(enteredPassword, hashedPassword, next) {
  console.log("enteredPassword: "+ enteredPassword)
  console.log("hashedPassword "+ hashedPassword)
  bcrypt.compare(enteredPassword, hashedPassword, function(err, isMatch) {
    console.log("comparing passwords...")
    if (err) {
      return next(err);
    } else {
      next(null, isMatch);
    }
  });
}

exports.testFunction = function(text) {
  return "what is up my dudes"
}

exports.testFunction2 = function(text) {
  return function(text){
    return "text"
  }
}

exports.User_model = function() {
  return User
};
