'use strict';

var express = require('express'),
    routes = require('./app/routes.js'), 
    bodyParser = require('body-parser'),
    mongoose = require('mongoose'), 
    passport = require('passport'), 
    flash = require('connect-flash'), 
    session = require('express-session');

require('dotenv').config({ silent: true });

var app = express();

var Polls = require('./app/models/poll');

mongoose.connect(process.env.MONGOLAB_URI, (err) => {
    if (err) return console.log(err)
    else console.log('Mongoose successfully connected.');
	
    require('./config/passport')(passport);
	
    app.set('view engine', 'ejs');
    
    app.use('/views', express.static(process.cwd() + '/views'));
    app.use(bodyParser.urlencoded({ extended: true }));
    app.use(session({ secret: 'gveikcisdxhbrmyedcazxyxdcrshhnduffu', resave: false, saveUninitialized: false }));
    app.use(flash());
    app.use(passport.initialize());
    app.use(passport.session());

    routes(app, Polls, passport);

    app.listen(process.env.PORT || 8080, () => {
        console.log('listening on 8080');
    });
});