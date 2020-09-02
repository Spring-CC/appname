const mongoose = require('mongoose');

const restaurantsSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    category:{
        type: String,
        required: true
    },
    address:{
        type: String,
        required: true
    }
})

module.exports = mongoose.model('restaurants',restaurantsSchema)