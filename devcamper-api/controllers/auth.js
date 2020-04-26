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