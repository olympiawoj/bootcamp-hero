const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const geocoder = require('../utils/geocoder')
const Bootcamp = require('../models/Bootcamp')

//@desc Get all bootcamps
//@route GET /api/v1/bootcamps
//@access Public
exports.getBootcamps = asyncHandler(async (req, res, next) => {
    let query;

    // Copy req.query
    const reqQuery = { ...req.query }

    // Fields to exclude
    const removeFields = ['select', 'sort']
    //Loop over removeFields and delete them from reqQuery 
    removeFields.forEach(param => delete reqQuery[param])

    // Create query string
    let queryStr = JSON.stringify(reqQuery) //query param as json string

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)//1st param-replace takes in regex, g=global means doesnt stop at the first it finds, 2nd param- takes in a function, match => what to return?

    // Finding resource 
    query = Bootcamp.find(JSON.parse(queryStr))

    // Build & Sort adds onto our query
    // Select Fields- do this if select is included
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ')
        query = query.select(fields)
    }
    // Sort
    if (req.query.sort) {
        //sort by multiple comma separated field values then turned into spaced strings
        const sortBy = req.query.sort.split(',').join(' ')
        query = query.sort(sortBy)
    } else {
        //default sort, descending created at
        query = query.sort('-createdAt')

    }

    // Executing our query
    const bootcamps = await query
    res.status(200).json({ success: true, count: bootcamps.length, data: bootcamps })

})


//@desc Get single bootcamps
//@route GET /api/v1/bootcamps/:id
//@access Public
exports.getBootcamp = asyncHandler(async (req, res, next) => {
    //Get id using req.params.id - this gets what's on the URL 
    const bootcamp = await Bootcamp.findById(req.params.id);
    if (!bootcamp) {
        //make sure to return the first one
        // return res.status(400).json({ success: false })
        //is a formatted object id BUT it's not in the database
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    res.status(200).json({ success: true, data: bootcamp })

})


//@desc Create new bootcamp
//@route POST /api/v1/bootcamps
//@access Private aka must be logged in or send token
exports.createBootcamp = asyncHandler(async (req, res, next) => {
    // console.log(req.body)
    const bootcamp = await Bootcamp.create(req.body)
    res.status(201).json({
        success: true,
        data: bootcamp
    })
})


//@desc Update bootcamp
//@route PUT /api/v1/bootcamps/:id
//@access Private
exports.updateBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
    res.status(200).json({ success: true, data: bootcamp })

})



//@desc Delete single bootcamps
//@route DELETE /api/v1/bootcamps/:id
//@access Private
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findByIdAndDelete(req.params.id)

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }
    res.status(200).json({ success: true, data: {} })

})



//@desc Get bootcamps within a radius 
//@route DELETE /api/v1/bootcamps/radius/:zipcode/:distance
//@access Private
exports.getBootcampsInRadius = asyncHandler(async (req, res, next) => {
    // Pull out params from URL
    const { zipcode, distance } = req.params

    // Get lat and lon from geocoder 
    const loc = await geocoder.geocode(zipcode)
    // Loc is an array
    const lat = loc[0].latitude
    const lng = loc[0].longitude

    // Calc radius using radians - unit of measurement for spheres
    // Divide distance is by radius of the earth - earth radius = 3,963 mi / 6,378km
    const radius = distance / 3963
    //find by location using geoWithin and centerSphere
    const bootcamps = await Bootcamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [[lng, lat], radius]
            }
        }
    })
    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    })
})

