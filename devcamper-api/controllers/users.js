const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const User = require('../models/User')


//@desc Get all users
//@route GET /api/v1/auth/users
//@access Private/Admin
exports.getUsers = asyncHandler(async (req, res, next) => {
    res.status(200).json(res.advancedResults)
})

//@desc Get single user
//@route GET /api/v1/auth/users/:id
//@access Private/Admin
exports.getUser = asyncHandler(async (req, res, next) => {
    const user = await User.findById(req.params.id);

    res.status(200).json({ success: true, data: user })
})


//@desc Create user
//@route POST /api/v1/auth/users
//@access Private/Admin
exports.createUser = asyncHandler(async (req, res, next) => {
    const user = await User.create(req.body);// to create,do .create and pass in req.body

    res.status(200).json({ success: true, data: user })
})

//@desc Update user
//@route POST /api/v1/auth/users/:id
//@access Private/Admin
exports.updateUser = asyncHandler(async (req, res, next) => {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });// pass in req.params.id to get id from URL, pass in req.body 

    res.status(200).json({ success: true, data: user }) // send back the updated user
})

//@desc Delete user
//@route DELETE /api/v1/auth/users/:id
//@access Private/Admin
exports.deleteUser = asyncHandler(async (req, res, next) => {
    await User.findByIdAndDelete(req.params.id);// all we need to pass in is the id, don't need to save it to a varable bc we're deleting

    res.status(200).json({ success: true, data: {} }) // send back empty object
})