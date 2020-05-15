const mongoose = require('mongoose')

//pass in an object with all fields 
const ReviewSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a title for the review'],
        maxlength: 100
    },
    text: { //the review itself
        type: String,
        required: [true, 'Please add some text']
    },
    rating: {
        type: Number,
        min: 1,
        max: 10,
        required: [true, 'Please add a rating between 1 and 10']
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

// A user can only add 1 review per bootcamp
// Prevent user from submitting more than 1 review per bootcamp
ReviewSchema.index({
    bootcamp: 1,
    user: 1
}, {
    unique: true
})


// Static method to get avg bootcamp rating and save 
ReviewSchema.statics.getAverageRating = async function (bootcampId) {
    console.log("Calculating avg cost....".blue)
    //aggregation- call method aggregate which returns a promise so use await
    const obj = await this.aggregate([
        {
            $match: { bootcamp: bootcampId }
        }, {
            $group: {
                _id: '$bootcamp',
                averageRating: { $avg: '$rating' } //call avg operator on rating
            }
        }
    ])
    // //when this is done what we get is the object
    // console.log(obj)//array with single object keys id and averageCost

    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageRating: obj[0].averageRating
        })
    } catch (err) {
        console.log(err)

    }
}

// Call getAverageRating after save
ReviewSchema.post('save', async function () {
    //run it on the actual model bc static method
    await this.constructor.getAverageRating(this.bootcamp)
})

// Call getAverageRating before remove
ReviewSchema.pre('remove', async function () {
    await this.constructor.getAverageRating(this.bootcamp)
})




module.exports = mongoose.model('Review', ReviewSchema)
