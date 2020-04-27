const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const User = require('../models/User')
const getSignedJwtToken = require('../')

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

    // Create token 
    const token = user.getSignedJwtToken()

    res.status(200).json({
        success: true,
        token: token
    })
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



    // Create token 
    const token = user.getSignedJwtToken()

    res.status(200).json({
        success: true,
        token: token
    })
})