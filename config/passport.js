var LocalStrategy = require('passport-local').Strategy, 
    FacebookStrategy = require('passport-facebook').Strategy, 
    TwitterStrategy = require('passport-twitter').Strategy,
    User = require('../app/models/user'), 
    configAuth = require('./auth');

module.exports = (passport) => {
    passport.serializeUser((user, done) => {
        done(null, user.id);
    });
    
    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
    
    passport.use('local-register', new LocalStrategy({
        usernameField: 'email', 
        passwordField: 'password', 
        passReqToCallback: true
    }, 
    (req, email, password, done) => {
        process.nextTick(() => {
            User.findOne({ 'local.email': email }, (err, user) => {
                if (err) return done(err);
                if (user) return done(null, false, req.flash('registerMessage', 'That email is already registered!'));
                else {
                    var newUser = new User();
                    newUser.local.email = email;
                    newUser.local.password = newUser.generateHash(password);
                    newUser.local.firstname = req.body.firstname;
                    newUser.local.lastname = req.body.lastname;
                    newUser.save((err) => {
                        if (err) throw err;
                        return done(null, newUser); 
                    });
                }
            });
        });
    }));
    
    passport.use('local-signin', new LocalStrategy({
        usernameField: 'email', 
        passwordField: 'password', 
        passReqToCallback: true
    }, 
    (req, email, password, done) => {
        process.nextTick(() => {
            User.findOne({ 'local.email': email }, (err, user) => {
                if (err) return done(err); 
                if (!user) return done(null, false, req.flash('signinMessage', 
                    'We couldn\'t find that email address--are you sure you\'re registered?')); 
                if (!user.validPassword(password, user.local.password)) return done(null, false, req.flash('signinMessage', 'That password is incorrect!')); 
                return done(null, user);
            }); 
        }); 
    }));
    
    passport.use(new FacebookStrategy({
        clientID: configAuth.facebookAuth.clientID, 
        clientSecret: configAuth.facebookAuth.clientSecret, 
        callbackURL: configAuth.facebookAuth.callbackURL
    }, (token, refreshToken, profile, done) => {
        process.nextTick(() => {
            User.findOne({ 'facebook.id': profile.id }, (err, user) => {
                if (err) return done(err); 
                if (user) return done(null, user); 
                else {
                    var newUser = new User();
                    newUser.facebook.id = profile.id;
                    newUser.facebook.token = token;
                    newUser.facebook.firstname = profile.name.givenName; 
                    newUser.facebook.lastname = profile.name.familyName;
                    newUser.facebook.email = profile.emails[0].value;
                    
                    newUser.save((err) => {
                        if (err) throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }));
    
    passport.use(new TwitterStrategy({
        consumerKey: configAuth.twitterAuth.consumerKey,
        consumerSecret : configAuth.twitterAuth.consumerSecret,
        callbackURL : configAuth.twitterAuth.callbackURL
    }, (token, tokenSecret, profile, done) => {
        process.nextTick(() => {
            User.findOne({ 'twitter.id': profile.id }, (err, user) => {
                if (err) return done(err);
                if (user) return done(null, user);
                else {
                    var newUser = new User();
                    newUser.twitter.id = profile.id;
                    newUser.twitter.token = token;
                    newUser.twitter.username = profile.username;
                    newUser.twitter.displayName = profile.displayName;
                    
                    newUser.save((err) => {
                        if (err) throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }));
};