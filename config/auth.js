module.exports = {
    'facebookAuth': {
        'clientID': process.env.FB_APP_ID, 
        'clientSecret': process.env.FB_APP_SECRET, 
        'callbackURL': 'http://localhost:8080/auth/facebook/callback'
    }, 
    'twitterAuth': {
        'callbackURL': 'https://voteroo.herokuapp.com/auth/twitter/callback'
    }
}