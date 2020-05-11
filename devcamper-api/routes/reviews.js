const express = require('express')
const {
    getReviews
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



module.exports = router 