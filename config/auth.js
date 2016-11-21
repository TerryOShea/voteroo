module.exports = {
    'facebookAuth': {
        'clientID': process.env.FB_APP_ID, 
        'clientSecret': process.env.FB_APP_SECRET, 
        'callbackURL': 'https://' + process.env.BASE_URL + '/auth/facebook/callback'
    }, 
    'twitterAuth': {
        'consumerKey': process.env.TWITTER_CONSUMER_KEY,
        'consumerSecret': process.env.TWITTER_CONSUMER_SECRET,
        'callbackURL': 'https://' + process.env.BASE_URL + '/auth/twitter/callback'
    }
};