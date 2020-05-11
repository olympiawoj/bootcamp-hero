const express = require('express')

const {
    getUsers,
    getUser,
    createUser,
    updateUser,
    deleteUser,
} = require("../controllers/users")

const User = require('../models/User')

const { protect, authorize } = require('../middleware/auth')
const advancedResults = require('../middleware/advancedResults')

const router = express.Router({ mergeParams: true })

router.use(protect); // anything below this will use protect, you don't have to stick in each one
router.use(authorize('admin'))//

// advancedResults takes in Model and populate from controllers if we need it
router.route('/')
    .get(advancedResults(User), getUsers)
    .post(createUser)

router.route('/:id')
    .get(getUser)
    .put(updateUser)
    .delete(deleteUser)

module.exports = router 