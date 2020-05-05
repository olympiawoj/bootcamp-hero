const mongoose = require('mongoose')

//pass in an object with all fields 
const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    weeks: {
        type: String,
        required: [true, 'Please add number of weeks']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minium skill'],
        //enum means it HAS to be one of these choices
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false,
    },
    createdAt: {
        type: Date,
        default: Date.now //current date and time 
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }


})


// Static method to get avg of course tuitions
CourseSchema.statics.getAverageCost = async function (bootcampId) {
    console.log("Calculating avg cost....".blue)
    //aggregation- call method aggregate which returns a promise so use await
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        }, {
            $group: {
                _id: '$bootcamp',
                averageCost: { $avg: '$tuition' }
            }
        }
    ])
    //when this is done what we get is the object
    console.log(obj)//array with single object keys id and averageCost

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(obj[0].averageCost / 10) * 10
        })
    } catch (err) {
        console.log(err)

    }
}

// Call getAverageCost after save
CourseSchema.post('save', function () {
    //run it on the actual model bc static method
    this.constructor.getAverageCost(this.bootcamp)
})

// Call getAverageCost before remove
CourseSchema.pre('remove', function () {
    this.constructor.getAverageCost(this.bootcamp)
})



module.exports = mongoose.model('Course', CourseSchema)
