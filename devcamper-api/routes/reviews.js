const express = require('express')
const {
    getReviews,
    getReview
} = require('../controllers/reviews')

const Review = require('../models/Review')
const { protect, authorize } = require('../middleware/auth')
const advancedResults = require('../middleware/advancedResults')

const router = express.Router({ mergeParams: true })

// advancedResults takes in Model and populate from controllers
router.route('/').get(advancedResults(Review, {
    path: 'bootcamp',
    select: 'name description'
}), getReviews)


router.route('/:id').get(getReview)

module.exports = router 