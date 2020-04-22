const path = require('path')
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
    const removeFields = ['select', 'sort', 'page', 'limit']
    //Loop over removeFields and delete them from reqQuery 
    removeFields.forEach(param => delete reqQuery[param])

    // Create query string
    let queryStr = JSON.stringify(reqQuery) //query param as json string

    // Create operators ($gt, $gte, etc)
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`)//1st param-replace takes in regex, g=global means doesnt stop at the first it finds, 2nd param- takes in a function, match => what to return?

    // Finding resource 
    query = Bootcamp.find(JSON.parse(queryStr)).populate('courses')

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

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25; //25 bootcamps by default
    const startIndex = (page - 1) * limit//gives us amount to skip, where we'll start
    const endIndex = page * limit
    const total = await Bootcamp.countDocuments(); //method to count ALL the documents

    //later we populate with courses, but we havent created the courses resource
    query = query.skip(startIndex).limit(limit)


    // Executing our query
    const bootcamps = await query
    // Pagination result
    const pagination = {}

    // If we dont have a prev page, don't want to show a previous page. If we don't have a next page, if we're on the last page, dont' want to show the next page. 
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    //Include pagination object in response 
    //pagination is same as pagionation:pagionatin bc variable is same as key
    res.status(200).json({ success: true, count: bootcamps.length, pagination, data: bootcamps })

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
    const bootcamp = await Bootcamp.findById(req.params.id)

    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    bootcamp.remove();//calls middleware 

    res.status(200).json({ success: true, data: {} })

})



//@desc Upload photo for bootcamp
//@route PUT /api/v1/bootcamps/:id/photo
//@access Private
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {
    const bootcamp = await Bootcamp.findById(req.params.id)
    //check to make sure there is a bootcamp
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id of ${req.params.id}`, 404))
    }

    //check to see if a file was actually uploaded
    if (!req.files) {
        return next(new ErrorResponse(`Please upload a file`, 404))
    }

    // console.log(req.files)
    const file = req.files.file

    //Make sure the image is a photo 
    // always be image/jpeg, png etc 
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`Please upload an image file`, 404))
    }

    // Check filesize 
    if (file.size > process.env.MAX_FILE_UPLOAD) {
        return next(new ErrorResponse(`Please upload an image less than ${process.env.MAX_FILE_UPLOAD}`, 404))
    }

    // Before we save the file using the mv method attached to this - which will move it to a directory we want, I want to create a custom file name bc if someone else uploads an image with the same name it's just going to override it
    // We could call the file photo_whatever the Id of the bootcamp 
    //Create custom filename 

    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`
    console.log(file.name)

    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async err => {
        if (err) {
            console.error(err)
            //500 server error
            return next(new ErrorResponse(`Problem with file upload`, 500))
        }

        //insert the filename into the DB
        await Bootcamp.findByIdAndUpdate(req.params.id, { photo: file.name })

        res.status(200).json({
            success: true,
            data: file.name
        })

    })

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

