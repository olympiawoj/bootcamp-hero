const Bootcamp = require('../models/Bootcamp')
const ErrorResponse = require('../utils/errorResponse')

//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access Public
exports.getBootcamps = async (req, res, next) => {
    try {
        const bootcamps = await Bootcamp.find()
        res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps })
    }
    catch (err) {
        next(err)
    }
}


//@desc Get single bootcamps
//@route GET /api/v1/bootcamps/:id
//@access Public
exports.getBootcamp = async (req, res, next) => {
    try {
        //Get id using req.params.id - this gets what's on the URL 
        const bootcamp = await Bootcamp.findById(req.params.id);
        if (!bootcamp) {
            //make sure to return the first one
            // return res.status(400).json({ success: false })
            //is a formatted object id BUT it's not in the database
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }
        res.status(200).json({ success: true, data: bootcamp })
    } catch (err) {
        // res.status(400).json({ success: false })
        //not a formated object id
        // next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        next(err)
    }
}


//@desc Create new bootcamp
//@route POST /api/v1/bootcamps
//@access Private aka must be logged in or send token
exports.createBootcamp = async (req, res, next) => {
    // console.log(req.body)
    // res.status(200).json({ success: true, msg: "Create new bootcamp" })
    try {
        const bootcamp = await Bootcamp.create(req.body)
        res.status(201).json({
            success: true,
            data: bootcamp
        })
    } catch (err) {
        next(err)
    }
}


//@desc Update bootcamp
//@route PUT /api/v1/bootcamps/:id
//@access Private
exports.updateBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
            new: true,
            runValidators: true
        })

        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }
        res.status(200).json({ success: true, data: bootcamp })
    }
    catch (err) {
        next(err)
    }
}



//@desc Delete single bootcamps
//@route DELETE /api/v1/bootcamps/:id
//@access Private
exports.deleteBootcamp = async (req, res, next) => {
    try {
        const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

        if (!bootcamp) {
            return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
        }
        res.status(200).json({ success: true, data: {} })
    }
    catch (err) {
        next(err)
    }
}
