
const NodeGeocoder = require('node-geocoder')

const options = {
    provider: process.env.GEOCODER_PROVIDER || 'mapquest',
    httpAdapter: 'https',
    apiKey: 'FdTibKAC6y1JeNhX1FkGGQirX35pt7pn',
    formatter: null
}


const geocoder = NodeGeocoder(options);

module.exports = geocoder