const express = require('express')
const { register, login, getMe } = require('../controllers/auth')

const { protect } = require('../middleware/auth')

//creates router 
const router = express.Router();

//creates routes- call register method
router.post('/register', register)
router.post('/login', login)
router.get('/me', protect, getMe)


module.exports = router