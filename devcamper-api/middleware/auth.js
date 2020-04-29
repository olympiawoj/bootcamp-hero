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

        token = req.headers.authorization.split(' ')[1]; //gives us the token

    }
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
