
const fs = require('fs')
const mongoose = require('mongoose')
const colors = require('colors')
const dotenv = require('dotenv');



//Load env vars
dotenv.config({ path: './config/config.env' })

//Load models
const Bootcamp = require('./models/Bootcamp')
const Course = require('./models/Course')

//Connect to DB 
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useFindAndModify: true,
    useUnifiedTopology: true
})

//Read JSON files - we need to parse JSON
//readFileSync does this synchronously
//__dirname gives us current directory name 
//gives us the file
const bootcamps = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'))
const courses = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'))

//Import data into  our DB with function
const importData = async () => {
    try {
        //similar to Bootcamp controller method - we're not saving it bc we don't need to respond with anything. Goal is just to import it into the DB. 
        await Bootcamp.create(bootcamps)
        // await Course.create(courses)

        console.log('Data Imported...'.green.inverse)
        //exit from process
        process.exit()
    }
    catch (err) {
        console.error(err)
    }
}


// Add ability to delete or destroy data
const deleteData = async () => {
    try {
        //DeleteMany is a mongoose method,if we don't pass anything in it just deletes all of them 
        await Bootcamp.deleteMany()
        await Course.deleteMany()

        console.log('Data Destroyed...'.red.inverse)
        //exit from process
        process.exit()
    }
    catch (err) {
        console.error(err)
    }
}

if (process.argv[2] === '-i') {
    importData()
} else if (process.argv[2] === '-d') {
    deleteData()
} else {
    console.log("Please add valid options for the seeder -")
    process.exit()
}