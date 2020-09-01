module.exports = (app) => {
  const restaurants = require("./controller");

  let router = require("express").Router();

  router.get("/", restaurants.findAll);

  router.get("/:id", restaurants.findOne);

  app.use("/api/restaurants", router);
};
