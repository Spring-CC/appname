require("dotenv").config();
// const db = require("./db");
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
// const db = require("./server/db");
const DbConnection = require("../dbatlas");

const app = express();

app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'
  )
);

const corsOptions = {
  origin: "http://localhost:8081",
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "..", "dist")));

// simple route
app.get("/", (req, res) => {
  res.json({ message: "HIIIIIII SPRING" });
});

//mongoDB routes**********************************************************************

//get all restaurants
app.get("/restAtlas", async (req, res) => {
	const dbCollection = await DbConnection.getCollection("Restaurants");
	const restaurants = await dbCollection.find().toArray();
	res.json(restaurants);
});

//Get restaurants by ID
app.get("/restAtlas/:id", async (req,res)=> {
  const restId = req.params.id;
  const dbCollection = await DbConnection.getCollection("Restaurants");
  const restaurant = await dbCollection.findOne({id: restId});
  res.json(restaurant);
})

//Get restaurants by category
app.get("/restAtlas/:category/categories", async (req,res)=> {
  const restCat = req.params.category;
  const dbCollection = await DbConnection.getCollection("Restaurants");
  const restaurant = await dbCollection.findOne({category: restCat});
  res.json(restaurant);
})

//***************************************************************************************** */
// db.mongoose
//   .connect(db.url, {
//     useNewUrlParser: true,
//     useUnifiedTopology: true
//   })
//   .then(() => {
//     console.log("Connected to the database!");
//   })
//   .catch(err => {
//     console.log("Cannot connect to the database!", err);
//     process.exit();
//   });

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "dist", "index.html"));
});
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
