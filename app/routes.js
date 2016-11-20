'use strict';

var async = require('async'), 
    crypto = require('crypto'), 
    nodemailer = require('nodemailer'), 
    User = require('../app/models/user');

module.exports = (app, Polls, passport) => {
    app.route('/')
        .get(isLoggedIn, (req, res) => {
            Polls.find({}, (err, polls) => {
                if (err) throw err;
                res.render('pages/index', { polls: polls, title: 'Home', message: req.flash('homeMessage') });
            });
        });
    
    app.route('/profile')
        .get(mustBeLoggedIn, (req, res) => {
            Polls.find({ owner: req.user.local.email }, (err, polls) => {
                if (err) throw err;
                res.render('pages/profile', { polls: polls, title: 'Profile' } );
            });
        });
    
    app.route('/signin')
        .get((req, res) => {
            res.render('pages/signin', { message: req.flash('signinMessage'), title: 'Sign in' });
        })
        .post(passport.authenticate('local-signin', {
            successRedirect: '/profile', 
            failureRedirect: '/signin', 
            failureFlash: true
        }));
    
    app.route('/auth/twitter')
        .get(passport.authenticate('twitter'));
    
    app.route('/auth/twitter/callback')
        .get(passport.authenticate('twitter', {
            successRedirect: '/profile', 
            failureRedirect: '/'
        }));
    
    app.route('/auth/facebook')
        .get(passport.authenticate('facebook', { scope: 'email' }));
    
    app.get('/auth/facebook/callback', passport.authenticate('facebook', {
            successRedirect: '/profile', 
            failureRedirect: '/'
        }));
    
    app.route('/signout')
        .get(mustBeLoggedIn, (req, res) => {
            req.logout();
            res.redirect('/');
        });
    
    app.route('/register')
        .get((req, res) => {
            res.render('pages/register', { message: req.flash('registerMessage'), title: 'Register' });
        })
        .post(passport.authenticate('local-register', {
            successRedirect: '/profile', 
            failureRedirect: '/register', 
            failureFlash: true
        }));
    
    app.route('/poll')
        .get(isLoggedIn, (req, res) => {
            Polls.findOne({ _id: req.query.id }, (err, poll) => {
                if (err) throw err;
                res.render('pages/pollpage', { poll: poll, title: 'Poll: ' + poll.title });
            });
        })
        .post((req, res) => {
            var pollinfo = JSON.parse(req.body.selected);
            Polls.findOneAndUpdate({ _id: pollinfo.id, "allvotes.option": pollinfo.option }, { $inc: { "allvotes.$.votes" : 1 } }, function(err) {
                if (err) throw err;
            });
            res.redirect(req.get('referer'));
        });
    
    app.route('/custom_option')
        .post(mustBeLoggedIn, (req, res) => {
            Polls.findOneAndUpdate({ _id: req.body.id }, { $push: { allvotes: { votes: 1, option: req.body.newoption } } }, function(err) {
                if (err) throw err;
                res.redirect(req.get('referer'));
            });
        });
    
    app.route('/add_new_poll')
        .get(mustBeLoggedIn, (req, res) => {
            res.render('pages/addnew', { title: 'Add new poll' });
        })
        .post(mustBeLoggedIn, (req, res) => {
            var title = req.body.title.trim(), 
                options = req.body.options.filter(x => x !== '');

            var poll = new Polls({ title: title, 
                                   allvotes: options.map(function(a) { return { option: a, votes: 0 } }), 
                                   owner: req.user.local.email });
            poll.save(function(err, poll) {
                if (err) throw err;
                res.redirect('/poll?id=' + poll.id);
            });
        });
    
    app.route('/delete_poll')
        .get(mustBeLoggedIn, (req, res) => {
            Polls.remove({ title: req.query.title }, (err, result) => {
                if (err) throw err;
                res.redirect('/profile');
            });
        });
    
    app.route('/forgot_password')
        .get((req, res) => {
            res.render('pages/forgotpassword', { title: 'Forgot password', message: req.flash('forgotPasswordMessage') });
        })
        .post((req, res, next) => {
            async.waterfall([
                function(done) {
                    crypto.randomBytes(20, (err, buf) => {
                        let token = buf.toString('hex');
                        done(err, token);
                    });
                }, 
                function(token, done) {
                    User.findOneAndUpdate({ "local.email": req.body.email }, 
                                          { "local.resetPasswordToken": token, "local.resetPasswordExpires": Date.now() + 3600000 }, 
                                          { new: true }, (err, user) => {
                        if (err) console.log(err);
                        if (!user) {
                            req.flash('forgotPasswordMessage', 'No account with that email address exists.');
                            return res.redirect('/forgot_password');
                        }
                        done(err, token, user);
                    });
                },
                function(token, user, done) {
                    var transporter = nodemailer.createTransport({
                        host: 'smtp.gmail.com',
                        port: 465, 
                        secure: true, 
                        auth: { user: process.env.GMAIL_USERNAME, pass: process.env.GMAIL_PASSWORD }
                    });
                    var mailOptions = {
                        to: user.local.email,
                        from: 'passwordreset@voteroo.herokuapp.com',
                        subject: 'Voteroo Password Reset',
                        text: 'You are receiving this because you (or someone else) have requested the reset of the password for your account.\n\n' +
                        'Please click on the following link, or paste this into your browser to complete the process:\n\n' +
                        'http://' + req.headers.host + '/reset_password/' + token + '\n\n' +
                        'If you did not request this, please ignore this email and your password will remain unchanged.\n'
                    };
                    transporter.sendMail(mailOptions, (err) => {
                        req.flash('homeMessage', 'An email has been sent to ' + user.local.email + ' with further instructions.');
                        done(err, 'done');
                    });
                }
            ], function(err) {
                if (err) return next(err);
                res.redirect('/');
            });
        });
    
    app.route('/reset_password/:token')
        .get((req, res) => {
            User.findOne({ "local.resetPasswordToken": req.params.token }, (err, user) => {
                if (err) console.log(err);
                if (!user) {
                    req.flash('forgotPasswordMessage', 'Password reset token is invalid. Please get a new one below.');
                    return res.redirect('/forgot_password');
                }
                if (user.local.resetPasswordExpires < Date.now()) {
                    req.flash('forgotPasswordMessage', 'Password reset token has expired. Please get a new one below.');
                    return res.redirect('/forgot_password');
                }
                res.render('pages/resetpassword', { id: user.id, title: 'Reset password', message: req.flash('resetPasswordMessage') });
            });
        })
        .post((req, res) => {
            var bcrypt = require('bcrypt-nodejs');
            
            if (req.body.password !== req.body.confirmation) {
                req.flash('resetPasswordMessage', 'Password and confirmation do not match.');
                return res.redirect('back');
            }
            if (req.body.password.length < 6) {
                req.flash('resetPasswordMessage', 'Password is too short.');
                return res.redirect('back');
            }
            var passhash = bcrypt.hashSync(req.body.password, bcrypt.genSaltSync(8), null);
            User.findOneAndUpdate({ _id: req.body.id }, { "local.resetPasswordToken": undefined, "local.resetPasswordExpires": undefined, "local.password": passhash }, (err, user) => {
                if (err) console.log(err);
                req.flash('homeMessage', 'Password reset was successful.');
                res.redirect('/');
            })
        });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
        return next(); 
    }
    return next();
}

function mustBeLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        res.locals.user = req.user;
        return next();
    }
    res.redirect('/signin');
}