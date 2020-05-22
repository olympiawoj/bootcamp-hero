const jwt = require('jsonwebtoken')
const asyncHandler = require('./async')
const ErrorResponse = require('../utils/errorResponse');

// look up user by id in token
const User = require('../models/User');

// Protect routes
exports.protect = asyncHandler(async (req, res, next) => {
    //initialize variable token
    let token
    //check headers- req.headers - make sure it's formatted correctly 
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')) {

        // Set token from Bearer token in header
        token = req.headers.authorization.split(' ')[1]; //gives us the token

    }
    // Set token from cookie
    // else if (req.cookies.token) {
    //     token = req.cookies.token
    // }

    // Make sure token exists - or else send 401 un-authorized
    if (!token) {
        return next(new ErrorResponse('Not authorized to access this route', 401))
    }

    try {
        // Verify token - jwt has a method verify, takes in token itself and secret
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        console.log('decoded', decoded)

        req.user = await User.findById(decoded.id); // w/e id is in the token which user got 

        next()

    } catch (err) {
        console.log('err', err)
        return next(new ErrorResponse('Not authorized to access this route 2', 401))
    }


})


//  Grant access to specific roles
exports.authorize = (...roles) => {
    // Return middleware function
    return (req, res, next) => {
        // Check if currently logged in user includes if the role is included in what's passed in here
        // console.log('roles')
        // console.log('user roles')
        // console.log('headers', req.headers)
        console.log('this authorize is ru nning....')
        //Each user has a role property
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User role ${req.user.role} is unauthorized to access this route`, 403)
            ); //403 is a forbidden error
        }
        next()
    }
}