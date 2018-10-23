var http = require('http');
var request = require("request");
var message = "";
var express = require("express");
var path = require("path");
const routes = require('./routes');
const mongoose = require('mongoose');
var app = express();

mongoose.connect('mongodb://localhost/Users');

app.use('/', routes);

app.listen(9000, () => console.log('PassportJS test project running on port 9000!'));
