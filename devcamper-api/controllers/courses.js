const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')

//@desc Get courses
//@route GET /api/v1/courses
//@route GET /api/v1/bootcamps/:bootcampId/courses 
//@access Public

exports.getCourses = asyncHandler(async (req, res, next) => {
    console.log("res", res)

    if (req.params.bootcampId) {
        const courses = await Course.find({ bootcamp: req.params.bootcampId })
        //if getCourses is just for a specific bootcamp
        return res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
        //if getCourses is get ALL courses for all bootcamps
    } else {
        ///get ALL courses
        res.status(200).json(res.advancedResults)
    }

})

//@desc Get a single course
//@route GET /api/v1/courses/:id
//@access Public


exports.getCourse = asyncHandler(async (req, res, next) => {
    console.log("res", res)
    //populate to show bootcamp name and description 
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    })

    if (!course) {
        return next(new ErrorResponse(`No course with the id of ${req.params.id}`), 404)
    }

    res.status(200).json({
        success: true,
        data: course
    })
})


//@desc Add course
//@route POST /api/v1/bootcamps/:bootcampId/courses 
//@access Private - to add a new course, only a logged in user should be able to do this

exports.addCourse = asyncHandler(async (req, res, next) => {

    req.body.bootcamp = req.params.bootcampId
    req.body.user = req.user.id

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    //check to see if the bootcamp exists
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootamp with the id of ${req.params.bootcampId}`), 404)
    }

    // Make sure user is bootcamp owner & not an admin
    if (bootcamp.user.toString() !== req.user.id && req.user.id !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to add a course to bootcamp ${bootcamp._id}`, 401))
    }

    //create new course- req.body includes anything we include in the body including or bootcampId which we pulled out of the URL 
    const course = await Course.create(req.body)

    res.status(200).json({
        success: true,
        data: course
    })
})


//@desc Update course
//@route PUT /api/v1/courses/:id
//@access Private - 

exports.updateCourse = asyncHandler(async (req, res, next) => {

    let course = await Course.findById(req.params.id)

    //check to see if the course exists
    if (!course) {
        return next(new ErrorResponse(`No bootamp with the id of ${req.params.id}`), 404)
    }


    // Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.id !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to update a course ${course._id}`, 401))
    }

    //Update course= findByIdAndUpdate takes id and what we want to update with and options {}
    course = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    })

    res.status(200).json({
        success: true,
        data: course //sends back updated course
    })
})


//@desc Delete course
//@route DELETE /api/v1/courses/:id
//@access Private - 

exports.deleteCourse = asyncHandler(async (req, res, next) => {

    const course = await Course.findById(req.params.id)

    //check to see if the course exists
    if (!course) {
        return next(new ErrorResponse(`No bootamp with the id of ${req.params.id}`), 404)
    }


    // Make sure user is course owner
    if (course.user.toString() !== req.user.id && req.user.id !== 'admin') {
        return next(new ErrorResponse(`User ${req.user.id} is not authorized to delete a course ${course._id}`, 401))
    }


    //Remove 
    await course.remove()


    res.status(200).json({
        success: true,
        data: {} //return empty object for delete
    })
})