const mongoose = require('mongoose');

const FavoritesSchema = new mongoose.Schema({
    user_Id: String,
    restaurant_Id: [String],
})

mongoose.model("Favorites", FavoritesSchema)