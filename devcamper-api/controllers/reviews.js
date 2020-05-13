const ErrorResponse = require('../utils/errorResponse')
const asyncHandler = require('../middleware/async')
const Review = require('../models/Review')
const Bootcamp = require('../models/Bootcamp')

//@desc Get reviews
//@route GET /api/v1/reviews
//@route GET /api/v1/bootcamps/:bootcampId/reviews 
//@access Public

exports.getReviews = asyncHandler(async (req, res, next) => {
    console.log('is this runnning?')
    if (req.params.bootcampId) {
        const reviews = await Review.find({ bootcamp: req.params.bootcampId })

        return res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        })
        //if getReviews is get ALL courses for all bootcamps
    } else {
        ///get ALL courses
        res.status(200).json(res.advancedResults)
    }

})

//@desc Get single review
//@route GET /api/v1/reviews/:id
//@access Public

exports.getReview = asyncHandler(async (req, res, next) => {
    const review = await Review.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    })

    if (!review) {
        return next(new ErrorResponse(`No review found with the id of ${req.params.id}`, 404))
    }
    res.status(200).json({
        success: true,
        data: review
    })


})


//@desc Add review
//@route GET /api/v1/bootcamps/:bootcampId/reviews
//@access Private - have to be logged in AND a user so add auth middleware
exports.addReview = asyncHandler(async (req, res, next) => {

    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id //req.user.id gets logged in user

    const bootcamp = await Bootcamp.findById(req.params.bootcampId)
    //make sure bootcamp exists
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with the id of ${req.params.bootcampId}`, 404))
    }

    const review = await Review.create(req.body); //req.body has all body data submitted, bootcamp, AND user

    res.status(201).json({  //201 for creating a resource
        success: true,
        data: review
    })


})