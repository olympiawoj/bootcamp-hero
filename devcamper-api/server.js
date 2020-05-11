
//Load env vars
const dotenv = require('dotenv');
const path = require('path')
const express = require('express')
const morgan = require('morgan')
const colors = require('colors')
const fileupload = require('express-fileupload')
const cookieParser = require('cookie-parser')

const errorHandler = require('./middleware/error')

// Load env vars
dotenv.config({ path: './config/config.env' });



//Bring in Route files
const bootcamps = require('./routes/bootcamps')
const courses = require('./routes/courses')
const auth = require('./routes/auth')
const users = require('./routes/users')

const connectDB = require('./config/db')

//Connect to database
connectDB()

const app = express()

// Body parser
app.use(express.json())

// Cookie Parser
app.use(cookieParser())

//File uploading
app.use(fileupload())

// Set public as our static folder 
app.use(express.static(path.join(__dirname, 'public')))
console.log(__dirname + 'public')

//Dev logging middleware
if (process.env.NODE_ENV === "development") {
    app.use(morgan('dev'))
}

//Mount routers
app.use('/api/v1/bootcamps', bootcamps)
app.use('/api/v1/courses', courses)
app.use('/api/v1/auth', auth)
app.use('/api/v1/users', users)

//errorHandler must be after bootcamps to be used in controllers/bootcamps.js 
app.use(errorHandler)

const PORT = process.env.PORT || 5000

const server = app.listen(PORT, console.log(`Server running in, ${process.env.NODE_ENV} mode on port ${PORT}`.yellow.bold))

//Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err.message}`.red)
    //Close server and exit process
    server.close(() => process.exit(1))
})