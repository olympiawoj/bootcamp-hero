const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Course = require('../models/Course')

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