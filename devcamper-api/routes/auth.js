const express = require('express')
const { register } = require('../controllers/auth')

//creates router 
const router = express.Router();

//creates routes- call register method
router.post('/register', register)


module.exports = router