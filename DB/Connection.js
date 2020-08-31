require("dotenv").config();
const mongoose = require('mongoose');

const URI = `mongodb+srv://${process.env.DBUSER}:${process.env.PASSWORD}@cc13.temn3.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`

const connectDB = async () => {
  await mongoose.connect(URI, {useUnifiedTopology: true, useNewUrlParser: true})
}

module.exports = connectDB;

// in server file const connectDB = require(path of file)