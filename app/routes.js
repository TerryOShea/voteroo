'use strict';

module.exports = (app, Polls, passport) => {
    app.route('/')
        .get((req, res) => {
            Polls.find({}, (err, polls) => {
                if (err) throw err;
                res.render('pages/index', { polls: polls });
            })
        });
    
    app.route('/profile')
        .get(isLoggedIn, (req, res) => {
            res.render('pages/profile', { user: req.user });
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
    
    app.route('/auth/facebook')
        .get(passport.authenticate('facebook', { scope: 'email' }));
    
    app.route('/auth/facebook/callback')
        .get(passport.authenticate('facebook', {
            successRedirect: '/profile', 
            failureRedirect: '/'
        }));
    
    app.route('/signout')
        .get((req, res) => {
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
        .get((req, res) => {
            Polls.find({ title: req.query.title }, (err, poll) => {
                if (err) throw err;
                res.render('pages/pollpage', { poll: poll[0] });
            });
        })
        .post((req, res) => {
            var pollinfo = JSON.parse(req.body.selected);
            Polls.find({ title: pollinfo.title }, (err, poll) => {
                if (err) throw err;
                var currVotes = poll[0].allvotes;
                currVotes[pollinfo.index].votes += 1;
                Polls.update({ title: pollinfo.title }, { $set: { allvotes: currVotes } }, function(err) {
                    if (err) throw err;
                });
            });
            res.redirect(req.get('referer'));
        });
    
    app.route('/add_new_poll')
        .get((req, res) => {
            res.render('pages/addnew');
        })
        .post((req, res) => {
            var poll = new Polls({ title: req.body.title.trim(), allvotes: req.body.options.split(', ').map(function(opt) { return { option: opt, votes: 0 } }) });
            poll.save(function(err, poll) {
                if (err) throw err;
                console.log('Saved ' + poll);
            });
            res.redirect('/');
        });
};

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) return next();
    res.redirect('/signin');
}