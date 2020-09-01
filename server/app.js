require("dotenv").config();
const Hapi = require("@hapi/hapi");
const mongoose = require("mongoose");
// const Joi = require("joi");

const path = require("path");
const Restaurants = require("../DB/Restaurants");

//<<db setup>>
const db = require("../dbatlas");
const dbName = "RestaurantsFinder";
const collectionName = "Restaurants";

//<< db init>>
db.initialize(dbName, collectionName, function(dbCollection) { // successCallback
  // get all items
  dbCollection.find().toArray(function(err, result) {
      if (err) throw err;
        console.log(result);
  });

  // << db CRUD routes >>

}, function(err) { // failureCallback
  throw (err);
});



const server = Hapi.Server({
  port: process.env.PORT || 3000,
  host: "localhost",
  routes: {
    cors: true,
    files: {
      relativeTo: path.join(__dirname, "public"),
    },
  },
});

server.route({
  method: "GET",
  path: "/res",
  handler: async (request, h) => {
    try {
      const result = await Restaurants.find({});
      console.log(result);
      return h.response(result);
    } catch (error) {
      return h.response("error");
    }
  },
});

server.route({
  method: "GET",
  path: "/",
  handler: async (request, h) => {
    try {
      return h.response("Hello from HapiJS!");
    } catch (error) {
      return h.response(error).code(500);
    }
  },
});



// server.route({
//   method: "GET",
//   path: "/restaurant",
//   handler: async (request, h) => {
//     try {
//       let restaurant = await db.find().exec();
//       return h.response(restaurant);
//     } catch (error) {
//       return h.response(error).code(500);
//     }
//   },
// });

// server.route({
//   method: "GET",
//   path: "/restaurant/{id}",
//   handler: async (request, h) => {
//     try {
//       let restaurant = await db.findById(request.params.id).exec();
//       return h.response(restaurant);
//     } catch (error) {
//       return h.response(error).code(500);
//     }
//   },
// });

// server.route({
//   method: "POST",
//   path: "/user",
//   options: {
//     validate: {},
//   },
//   handler: async (request, h) => {},
// });

// server.route({
//   method: "PUT",
//   path: "/user/{id}",
//   options: {
//     validate: {},
//   },
//   handler: async (request, h) => {},
// });

// server.route({
//   method: "DELETE",
//   path: "/user/{id}",
//   handler: async (request, h) => {},
// });

module.exports = server;
