const Hapi = require("@hapi/hapi");
// const mongoose = require("mongoose");
// const Joi = require("joi");
// const db = require("./db");
// const passport = require('passport');
// const Auth0Strategy = require('passport-auth0');

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

// // Configure Passport to use Auth0
// const strategy = new Auth0Strategy(
//   {
//     domain: process.env.AUTH0_DOMAIN,
//     clientID: process.env.AUTH0_CLIENT_ID,
//     clientSecret: process.env.AUTH0_CLIENT_SECRET,
//     callbackURL:
//       process.env.AUTH0_CALLBACK_URL || 'http://localhost:3000/callback'
//   },
//   function (accessToken, refreshToken, extraParams, profile, done) {
//     // accessToken is the token to call Auth0 API (not needed in the most cases)
//     // extraParams.id_token has the JSON Web Token
//     // profile has all the information from the user
//     return done(null, profile);
//   }
// );

// passport.use(strategy);

// server.route(passport.initialize());
// server.route(passport.session());
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
