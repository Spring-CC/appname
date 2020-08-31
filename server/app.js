const Hapi = require("@hapi/hapi");
// const Mongoose = require("mongoose");
// const Joi = require("joi");
// const db = require("./db");
const path = require("path");
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
