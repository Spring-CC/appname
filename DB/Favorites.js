const mongoose = require('mongoose');

const FavoritesSchema = new mongoose.Schema({
    userEmail: String,
    restaurant_Id: [String],
})

mongoose.model("Favorites", FavoritesSchema)