const mongoose = require('mongoose')
const slugify = require('slugify')
const geocoder = require('../utils/geocoder')

const BootcampSchema = new mongoose.Schema({
    //fields 
    name: {
        type: String,
        required: [true, 'Please add a name'],
        //no 2 bootcamps can have the same name
        unique: true,
        trim: true,
        maxlength: [50, 'Name cannot be more than 50 characters']
    },
    //slug is a URL friendly version of the name in this case, reason I want slug is for the frontend
    slug: String, //Devcentral Bootcamp --> devcentral-bootcamp with hyphen 
    description: {
        type: String,
        required: [true, 'Please add a description'],
        //no 2 bootcamps can have the same name
        maxlength: [500, 'Name cannot be more than 50 characters']
    },
    website: {
        type: String,
        //custom validation using regex and match - takes in bracket with regular expression with forward slashes- this expression can get from gist or search for javascript regex url and it's what is a good regular expression? Same javascript regex email 
        match: [
            /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
            //if doesnt match, get error
            'Please use a valid URL with HTTP or HTTPS'
        ]
    },
    phone: {
        type: String,
        maxlength: [20, 'Phone number can not be longer than 20 characters']
    },
    email: {
        type: String,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    //address that's sent to our server from a client
    address: {
        type: String,
        required: [true, 'Please add an address']
    },
    //use geocoder to get lat and lon so our location fields type will be GeoJSON point
    location: {
        // GeoJSON Point
        type: {
            type: String,
            enum: ['Point']
        },
        coordinates: {
            type: [Number],
            index: '2dsphere'
        },
        //other fields we can add
        formattedAddress: String,
        street: String,
        city: String,
        state: String,
        zipcode: String,
        country: String
    },
    careers: {
        // Array of strings
        type: [String],
        required: true,
        //Enum means these are the only available values that you can have
        enum: [
            'Web Development',
            'Mobile Development',
            'UI/UX',
            'Data Science',
            'Business',
            'Other'
        ]
    },
    averageRating: {
        type: Number,
        min: [1, 'Rating must be at least 1'],
        max: [10, 'Rating must can not be more than 10']
    },
    averageCost: Number,
    //in db, will be the name of the file, if there is no photo display a default photo 
    photo: {
        type: String,
        default: 'no-photo.jpg'
    },
    housing: {
        type: Boolean,
        default: false
    },
    jobAssistance: {
        type: Boolean,
        default: false
    },
    jobGuarantee: {
        type: Boolean,
        default: false
    },
    acceptGi: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    }

}, {
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
}
)

// Create bootcamp slug from the name 
BootcampSchema.pre('save', function (next) {
    this.slug = slugify(this.name, { lower: true })
    next()
})
//Geocode & create location field
BootcampSchema.pre('save', async function (next) {
    //geocoder is the file we call in - call geocode on the address- any fields we can access with this keyword
    const loc = await geocoder.geocode(this.address)
    //construction location as a geojson object- must have a type point and coordinates - two required fields in our model/Bootcamp.js to have a geojson point 
    this.location = {
        type: 'Point',
        coordinates: [loc[0].longitude, loc[0].latitude], //lon then lat
        formattedAddress: loc[0].formattedAddress,
        street: loc[0].streetName,
        city: loc[0].city,
        state: loc[0].stateCode,
        zipcode: loc[0].zipcode,
        countryCode: loc[0].countryCode,
    }
    //Do not save address in DB
    this.address = undefined
    next()
})

//Cascade delete courses when a bootcamp is deleted 
BootcampSchema.pre('remove', async function (next) {
    console.log(`Courses being removed from bootcamp ${this._id}`)
    //Call the delete many method on the course model 
    await this.model('Course').deleteMany({ bootcamp: this._id })
    next()
})

//Reverse populate with virtuals
BootcampSchema.virtual('courses', {
    ref: 'Course',
    localField: '_id',
    foreignField: 'bootcamp',
    justOne: false
})


module.exports = mongoose.model('Bootcamp', BootcampSchema)