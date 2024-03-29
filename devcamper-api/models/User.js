const crypto = require('crypto')
const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

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
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    createdAt: {
        type: Date,
        default: Date.now()
    }
})

// Ecncrypt password using bcrypt 
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next()
    }
    // ONLY RUNS IF THE PASSWORD IS MODIFIED
    //Generate a salt to use that to actually hash the password
    //When we call genSalt, it returns a promise so we need to use await. It takes in the number of rounds - higher the num, more secure, but heavier it is on your system. 10 is rec in docs. 
    const salt = await bcrypt.genSalt(10)
    //hash password with the salt 
    this.password = await bcrypt.hash(this.password, salt)
})



// Sign JWT and return 
// Take user schme 

UserSchema.methods.getSignedJwtToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    })
}

// Check password - take plain text, match to the encrypted password
// Let's create a model method just like we did right here to get hte token
// Match user entered password to hashed password in database using bcrypt 
UserSchema.methods.matchPassword = async function (enteredPassword) {
    // takes in user entered passwords and actual password in DB - this method will be called on the actual user, we have access ot this users field and hashed password
    return await bcrypt.compare(enteredPassword, this.password)

}

// Generate and hash password token
UserSchema.methods.getResetPasswordToken = function () {
    // Generate the token
    // crypto has method randomBytes - arg we pass in is # of bytes
    // gives us a buffer, format as string
    const resetToken = crypto.randomBytes(20).toString('hex')

    // Hash token and set to resetPasswordToken field - method being called on actual user so can acess users fields with this
    // pass in what we want to hash 
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');


    // Set expire
    this.resetPasswordExpire = Date.now() + 10 + 60 * 1000


    return resetToken

}

module.exports = mongoose.model('User', UserSchema);