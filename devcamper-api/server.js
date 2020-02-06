const express = require('express')
const app = express()

//Route files
const bootcamps = require('./routes/bootcamps')
const dotenv = require('dotenv')

//Load env vars
dotenv.config({ path: './config/config.env' })




//Mount routers
app.use('/api/v1/bootcamps', bootcamps)


const PORT = process.env.PORT || 5000

app.listen(PORT, console.log(`Server running in, ${process.env.NODE_ENV} mode on port ${PORT}`))