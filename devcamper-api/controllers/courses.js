const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Course = require('../models/Course')
const Bootcamp = require('../models/Bootcamp')

//@desc Get courses
//@route GET /api/v1/courses
//@route GET /api/v1/bootcamps/:bootcampId/courses 
//@access Public

exports.getCourses = asyncHandler(async (req, res) => {
    console.log("res", res)
    //build our query 
    let query
    if (req.params.bootcampId) {
        query = Course.find({ bootcamp: req.params.bootcampId })
    } else {
        //if NO id, getall courses
        query = Course.find().populate({
            path: 'bootcamp',
            select: 'name description'
        })
    }

    const courses = await query;
    console.log('courses', courses)

    res.status(200).json({
        success: true,
        count: courses.length,
        data: courses
    })
})

//@desc Get a single course
//@route GET /api/v1/courses/:id
//@access Public


exports.getCourse = asyncHandler(async (req, res) => {
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

exports.addCourse = asyncHandler(async (req, res) => {

    req.body.bootcamp = req.params.bootcampId

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)

    //check to see if the bootcamp exists
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootamp with the id of ${req.params.bootcampId}`), 404)
    }

    //create new course- req.body includes anything we include in the body including or bootcampId which we pulled out of the URL 
    const course = await Course.create(req.body)

    res.status(200).json({
        success: true,
        data: course
    })
})