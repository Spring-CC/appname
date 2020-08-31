const mongoose = require('mongoose');

const restaurantsSchema = new mongoose.Schema({
    restaurantType:{
        type: String,
        required: true
    },
    restaurantAdress:{
        type: String,
        required: true
    },

    restaurantReview:{
        type: String,
        required: true
    },

    restaurantPriceRange: {
        type: Number,
        min: 1,
        max: 5
    }
})

module.exports = mongoose.model('restaurants',restaurantsSchema)