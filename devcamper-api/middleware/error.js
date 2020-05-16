const ErrorResponse = require('../utils/errorResponse')

const errorHandler = async (err, req, res, next) => {
    let error = { ...err }
    error.message = err.message

    //Log to console for dev
    // console.log(err.stack.red)
    console.log(err)

    //Mongoose bad ObjectId - let's test for the CastError
    console.log(err.name)
    if (err.name === 'CastError') {
        //send message- resource not found
        const message = `Resource not found with id of ${err.value}`
        //set error value- instead of sending the error response in the controllers/bootcamp.js catch, we're doing it right in the error ahndler if it matches this CastError
        error = new ErrorResponse(message, 404);
    }

    //Mongoose duplicate key error 
    if (err.code == 11000) {
        const message = 'Duplicate field value entered'
        error = new ErrorResponse(message, 400) //duplicate field is 400 bad request
    }

    //Mongoose validation error
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message)
        error = new ErrorResponse(message, 400)
    }

    //instead of err, use error
    res.status(error.statusCode || 500).json({
        success: false,
        error: error.message || "Server Error"
    })
}


module.exports = errorHandler