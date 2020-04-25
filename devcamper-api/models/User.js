const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

//pass in an object with all of our fields
const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true, //can't have 2 users with the same email
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'publisher'], //only 2 choices
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minLength: 6,
        select: false, //when we get a user from API it's not going to return password
        resetPasswordToken: String,
        resetPasswordExpire: Date,
        createdAt: {
            type: Date,
            default: Date.now()
        }
    }
})

// Ecncrypt password using bcrypt 
UserSchema.pre('save', async function (next) {
    //Generate a salt to use that to actually hash the password
    //When we call genSalt, it returns a promise so we need to use await. It takes in the number of rounds - higher the num, more secure, but heavier it is on your system. 10 is rec in docs. 
    const salt = await bcrypt.genSalt(10)
    //hash password with the salt 
    this.password = await bcrypt.hash(this.password, salt)

})


module.exports = mongoose.model('User', UserSchema);