const crypto = require('crypto')
const ErrorResponse = require('../utils/errorResponse')
const sendEmail = require('../utils/sendEmail')
const asyncHandler = require('../middleware/async')
const User = require('../models/User')


//@desc Register user
//@route POST /api/v1/auth/register
//@access Public - anyone can register, even not logged in
exports.register = asyncHandler(async (req, res, next) => {
    const { name, email, password, role } = req.body

    // Create user
    const user = await User.create({
        name,
        email,
        password,
        role
    });

    //this replaces commented out code below
    sendTokenResponse(user, 200, res)

    // // Create token 
    // const token = user.getSignedJwtToken()
    // res.status(200).json({
    //     success: true,
    //     token: token
    // })
})


//@desc Register user
//@route POST /api/v1/auth/login
//@access Public
// Use data passed in to JUST authenticate - let's check manually 
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body

    // Validate email and password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide an email and password.'))
    }

    // Check for the User - findOne finds one record, email:email is same as email 
    // On the user model 
    // We want the password included to validate it for log in 
    const user = await User.findOne({ email }).select('+password')
    // Make sure the user exists- if not, 401 is unauthorized
    if (!user) {
        return next(new ErrorResponse('Invalid credentials', 401))
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
        return next(new ErrorResponse("Invalid credentials", 401))
    }
    //this replaces commented out code below
    sendTokenResponse(user, 200, res)

    // // Create token 
    // const token = user.getSignedJwtToken()
    // res.status(200).json({
    //     success: true,
    //     token: token
    // })
})



//@desc Get current logged in user
//@route POST /api/v1/auth/me
//@access Private - need token to access
exports.getMe = asyncHandler(async (req, res, next) => {
    // since it's a protect route, we have access to route.user
    const user = await User.findById(req.user.id);

    res.status(200).json({
        success: true,
        data: user
    });
})

//@desc Update user details
//@route PUT /api/v1/auth/updateddetails
//@access Private 
exports.updateDetails = asyncHandler(async (req, res, next) => {
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email
    }
    // since it's a protect route, we have access to route.user
    // pass in logged in user's id and fields to update
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    res.status(200).json({
        success: true,
        data: user
    });
})

//@desc Update password
//@route PUT /api/v1/auth/updatepassword
//@access Private - need token to access
exports.updatePassword = asyncHandler(async (req, res, next) => {

    // since it's a protect route, we have access to route.user
    const user = await User.findById(req.user.id).select('+password');

    // Check current password - make sure it's true
    // in our model we have that matchPassword method and it's asynchronous and it returns a promise
    // if NOT that
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse("Password is incorrect", 401))
    }

    // take user object and set password to new password
    user.password = req.body.newPassword
    //save user
    await user.save()

    // send token back, just like when they reset the password
    sendTokenResponse(user, 200, res)

})



//@desc Forgot password
//@route POST /api/v1/auth/forgotpassword
//@access Public 
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    // find email matching email to req.body.email
    const user = await User.findOne({ email: req.body.email });

    if (!user) {
        return next(new ErrorResponse('There is no user with that email', 404))
    }

    // Get reset token - method on model itself user
    const resetToken = user.getResetPasswordToken()

    // Save user
    await user.save({ validateBeforeSave: false })

    // Create reset url
    const resetUrl = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`

    // Create message to pass in
    const message = `You are recieving this email because you (or someone else) has requested the reset of a password. Please make a PUT request to: \n\n ${resetUrl}`;

    // Call send email function from utility
    try {
        //sendEmail takes in an object of options
        await sendEmail({
            email: user.email,
            subject: "Password reset token",
            message
        })

        return res.status(200).json({ success: true, data: 'Email sent!' })

    } catch (err) {
        //If something goes wrong, get rid of tokens in db
        console.log('err', err)
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({ validateBeforeSave: false })
        return next(new ErrorResponse('Email could not be sent', 500))
    }

    // res.status(200).json({
    //     success: true,
    //     data: user
    // });
})



//@desc Reset password
//@route PUT /api/v1/auth/resetpassword/:resettoken 
//@access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    console.log('token?', req.params.resettoken)
    // Hash the token with crypto package
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex')

    //Find the user by reset token, and only if expiry is greater than right now
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() } //greater than date.now
    })

    // Does our user exit?
    if (!user) {
        return next(new ErrorResponse("Invalid Token", 400))
    }


    // Set new password- it should get encrypted bc our encrypted middleware
    // If we can find the user by token and it's not expired, lets
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined


    await user.save()


    sendTokenResponse(user, 200, res)
})




// Helper - not an actual controller method
//  Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
    // Create token 
    const token = user.getSignedJwtToken()
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    // checkes what environment we're in
    if (process.env.NODE_ENV === 'production') {
        options.secure = true
    }


    res.status(statusCode)
        .cookie('token', token, options)
        .json({
            success: true,
            token
        })


}