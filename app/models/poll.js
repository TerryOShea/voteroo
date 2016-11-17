var mongoose = require('mongoose');

var pollSchema = mongoose.Schema({
    title: String, 
    allvotes: Array, 
    owner: String
});

module.exports = mongoose.model('Poll', pollSchema);