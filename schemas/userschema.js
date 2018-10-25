var mongoose = require('mongoose');
var fs = require("fs");
const User_Schema = new mongoose.Schema({
  email: String,
  password: String,
  admin: Boolean
});
const User = mongoose.model('User', User_Schema);
exports.User_model = function() {
  return User
};
