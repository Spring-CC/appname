const server = require("./app");
const Bell = require("@hapi/bell");
const dotenv = require("dotenv");
dotenv.config();

const internals = {};
internals.start = async function () {
  const init = async () => {
    await server.register(Bell);
    server.auth.strategy("twitter", "bell", {
      provider: "twitter",
      password: "cookie_encryption_password_secure",
      isSecure: false,
      clientId: process.env.API_KEY, // Set client id
      clientSecret: process.env.API_SECRET, // Set client secret
    });

    server.route({
      method: ["GET", "POST"],
      path: "/login",
      options: {
        auth: {
          mode: "try",
          strategy: "twitter",
        },
        handler: function (request, h) {
          if (!request.auth.isAuthenticated) {
            return `Authentication failed due to: ${request.auth.error.message}`;
          }

          // Perform any account lookup or registration, setup local session,
          // and redirect to the application. The third-party credentials are
          // stored in request.auth.credentials. Any query parameters from
          // the initial request are passed back via request.auth.credentials.query.

          return h.redirect("/home");
        },
      },
    });
    await server.start();
    console.log("Server running on %s", server.info.uri);
  };
  init();

  process.on("unhandledRejection", (err) => {
    console.log(err);
    process.exit(1);
  });
};
internals.start();
