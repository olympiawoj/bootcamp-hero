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