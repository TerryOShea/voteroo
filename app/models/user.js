var mongoose = require('mongoose'), 
    bcrypt = require('bcrypt-nodejs');

var userSchema = mongoose.Schema({
    local: { firstname: String, 
             lastname: String, 
             email: { type: String, unique: true }, 
             password: String, 
             resetPasswordToken: String, 
             resetPasswordExpires: Date
    }, 
    facebook: { id: String, token: String, email: String, firstname: String, lastname: String }, 
    twitter : { id: String, token: String, displayName: String, username: String }
});

userSchema.methods.generateHash = (password) => bcrypt.hashSync(password, bcrypt.genSaltSync(8), null);

userSchema.methods.validPassword = (password, localPassword) => bcrypt.compareSync(password, localPassword);

module.exports = mongoose.model('User', userSchema);