require("dotenv").config();
const Hapi = require("@hapi/hapi");
const mongoose = require("mongoose");
// const Joi = require("joi");

const path = require("path");
const Restaurants = require("../DB/Restaurants");

//<<db setup>>
const DbConnection = require('../../db');
// const dbName = "RestaurantsFinder";
// const collectionName = "Restaurants";

router.get("/restAtlas", async (req, res) => {
	const dbCollection = await DbConnection.getCollection("Restaurants");
	const restaurants = await dbCollection.find().toArray();
	res.json(restaurants);
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
