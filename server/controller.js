const db = require("./db");
const Restaurants = db.restaurants;

exports.findAll = (req, res) => {
  const title = req.query.title;
  var condition = title
    ? { title: { $regex: new RegExp(title), $options: "i" } }
    : {};

  Restaurants.find(condition)
    .then((data) => {
      res.send(data);
    })
    .catch((err) => {
      res.status(500).send({
        message: err.message || "Error findAll!",
      });
    });
};

exports.findOne = (req, res) => {
  const id = req.params.id;

  Restaurants.findById(id)
    .then((data) => {
      if (!data)
        res.status(404).send({ message: "Not found restaurant with id " + id });
      else res.send(data);
    })
    .catch((err) => {
      res
        .status(500)
        .send({ message: "Error retrieving restaurant with id=" + id });
    });
};
