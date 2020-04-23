const express = require('express')
const {
    getBootcamps,
    getBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsInRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps')

const Bootcamp = require('../models/Bootcamp')
const advancedResults = require('../middleware/advancedResults')

// Include other resource routers 
const courseRouter = require('./courses')

const router = express.Router()

// Re-route into other resource routers
// Anything that has :/bootcampId/courses, we know if that param is included, we want to mount that into the course router
//Rather than bringing in getCourses into this router 
router.use('/:bootcampId/courses', courseRouter);


router
    .route('/radius/:zipcode/:distance')
    .get(getBootcampsInRadius)

router
    .route('/')
    .get(advancedResults(Bootcamp, 'courses'), getBootcamps)
    .post(createBootcamp)

router
    .route('/:id')
    .get(getBootcamp)
    .put(updateBootcamp)
    .delete(deleteBootcamp)

router.route('/:id/photo').put(bootcampPhotoUpload)

module.exports = router