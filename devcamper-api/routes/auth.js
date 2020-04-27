const express = require('express')
const { register, login } = require('../controllers/auth')

//creates router 
const router = express.Router();

//creates routes- call register method
router.post('/register', register)
router.post('/login', login)


module.exports = router