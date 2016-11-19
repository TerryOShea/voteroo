'use strict';

module.exports = (app, Polls, passport) => {
    app.route('/')
        .get(isLoggedIn, (req, res) => {
            Polls.find({}, (err, polls) => {
                if (err) throw err;
                //console.log(polls[0].id);
                res.render('pages/index', { polls: polls });
            });
        });
    
    app.route('/profile')
        .get(mustBeLoggedIn, (req, res) => {
            Polls.find({ owner: req.user.local.email }, (err, polls) => {
                if (err) throw err;
                res.render('pages/profile', { polls: polls } );
            });
        });
    
    app.route('/signin')
        .get((req, res) => {
            res.render('pages/signin', { message: req.flash('signinMessage') });
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
            res.render('pages/register', { message: req.flash('registerMessage') });
        })
        .post(passport.authenticate('local-register', {
            successRedirect: '/profile', 
            failureRedirect: '/register', 
            failureFlash: true
        }));
    
    app.route('/see_poll')
        .get(isLoggedIn, (req, res) => {
            Polls.findOne({ _id: req.query.id }, (err, poll) => {
                if (err) throw err;
                res.render('pages/pollpage', { poll: poll });
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
            });
            res.redirect(req.get('referer'));
        });
    
    app.route('/add_new_poll')
        .get(mustBeLoggedIn, (req, res) => {
            res.render('pages/addnew');
        })
        .post(mustBeLoggedIn, (req, res) => {
            var title = req.body.title.trim(), 
                options = req.body.options.filter(x => x !== '');
                //if options is a string
                //make sure options are unique
                //options = req.body.options;
            

            var poll = new Polls({ title: title, 
                                   allvotes: options.map(function(a) { return { option: a, votes: 0 } }), 
                                   owner: req.user.local.email });
            poll.save(function(err, poll) {
                if (err) throw err;
                console.log(poll);
            });
            res.redirect('/');
        });
    
    app.route('/delete_poll')
        .get(mustBeLoggedIn, (req, res) => {
            console.log(req.query.title);
            Polls.remove({ title: req.query.title }, (err, result) => {
                if (err) throw err;
                res.redirect('/profile');
            });
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