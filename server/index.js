require("dotenv").config();

const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
const router = require("./auth0");

const dotenv = require("dotenv");
const bcrypt = require("bcrypt");
const mongoose = require("mongoose");
const saltRounds = 10;
const { spawn } = require("child_process");
const { PythonShell } = require("python-shell");
require("../DB/Favorites");

dotenv.config();
// const db = require("./server/db");
const DbConnection = require("../dbatlas");
const { lstat } = require("fs");
const Favorites = mongoose.model("Favorites");

const app = express();
const mongoURI = "" + process.env.API_URL + "";

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

mongoose.connection.on("connected", () => {
  console.log("connected to mongodb");
});
mongoose.connection.on("error", (err) => {
  console.log("error", err);
});
app.use(
  morgan(
    ':remote-addr - :remote-user [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] :response-time ms'
  )
);

const corsOptions = {
  origin: "http://localhost:19006",
};

app.use(cors(corsOptions));

app.use(bodyParser.json());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.resolve(__dirname, "..", "build")));

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

//get all users
app.get("/users", async (req, res) => {
  const dbCollection = await DbConnection.getCollection("Users");
  const users = await dbCollection.find().toArray();
  res.json(users);
});

//Get restaurants by ID
app.get("/restAtlas/:id", async (req, res) => {
  const restId = req.params.id;
  const dbCollection = await DbConnection.getCollection("Restaurants");
  const restaurant = await dbCollection.findOne({ id: restId });
  res.json(restaurant);
});

//Get restaurants by category
app.get("/restAtlas/:category/categories", async (req, res) => {
  const restCat = req.params.category;
  const dbCollection = await DbConnection.getCollection("Restaurants");
  const restaurant = await dbCollection.findOne({ category: restCat });
  res.json(restaurant);
});

// Post new user
app.post("/users", async (req, res) => {
  const newUser = req.body;
  console.log("Adding new User", newUser);

  const hashPassword = await bcrypt.hash(newUser.password, saltRounds);

  const dbCollection = await DbConnection.getCollection("Users");
  const user = await dbCollection.find().toArray();

  await dbCollection.insertOne({
    username: newUser.username,
    password: hashPassword,
  });

  //return updated list
  const users = await dbCollection.find().toArray();
  res.json(users);
});

//get testusers
app.get("/testdata", async (req, res) => {
  const dbCollection = await DbConnection.getCollection("Testdata");
  const testusers = await dbCollection.find().toArray();
  res.json(testusers);
});

//Post user preference
app.post("/testdata/:id", async (req, res) => {
  const userId = req.params.id;
  const restId = req.body.restId;
  const rest = req.body.rest;
  const dbCollection = await DbConnection.getCollection("Testdata");
  dbCollection.findOneAndUpdate(
    { _id: ObjectId(userId) },
    { $push: { swiped_right: restId } },
    { upsert: true },
    function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log(success);
      }
    }
  );

  //return updated dummyuser
  const dummyuser = await dbCollection
    .find({ _id: ObjectId(userId) })
    .toArray();
  res.json(dummyuser);
});

//add favorite to user
app.post("/favoritesUpdate", async (req, res) => {
  try {
    const user = req.body.user_Id;
    const restaurant = req.body.restaurant_Id;
    const dbCollection = await DbConnection.getCollection("favorites");
    await dbCollection.findOneAndUpdate(
      { user_Id: user },
      { $push: { restaurant_Id: restaurant } }
    );
    res.json("update it");
  } catch (err) {
    console.log(err);
  }
});

//delete favorite in user
app.patch("/deleteFavorite", async (req, res) => {
  try {
    const user = req.body.user_Id;
    const restaurant = req.body.restaurant_Id;
    const dbCollection = await DbConnection.getCollection("favorites");
    await dbCollection.updateOne(
      { user_Id: user },
      { $pull: { restaurant_Id: restaurant } }
    );
    res.json("deleted restaurant");
  } catch (err) {
    console.log(err);
  }
});

// get favorites
app.get("/favoritesInfo", async (req, res) => {
  const dbCollection = await DbConnection.getCollection("favorites");
  const favorites = await dbCollection.find().toArray();
  res.json(favorites);
});

//Mongoose routes**********************************************************************
app.post("/Favorites", (req, res) => {
  const favorite = new Favorites({
    user_Id: req.body.user_Id,
    restaurant_Id: req.body.restaurant_Id,
  });
  favorite
    .save()
    .then((data) => {
      console.log(data);
      res.send("posted");
    })
    .catch((err) => {
      console.log(err);
    });
});

// Get restaurants testuser liked : recommender system ****************************************************
app.get("/dummyfavorites/:userid", async (req, res) => {
  const userId = req.params.userid;
  const dbCollection = await DbConnection.getCollection("Testdata");
  const current_user = await dbCollection.findOne({
    //userid: mongoose.Types.ObjectId(userId),
    userid: userId,
  });
  
  const options = {
    scriptPath: path.resolve(__dirname, "..", "recommender"),
    args: [current_user._id],
  };
  await PythonShell.run("machine.py", options, async function (err, results) {
    if (err) throw err;
    const recomm_user = await dbCollection.findOne({
       _id: mongoose.Types.ObjectId(results[1]),
      
    });
    let result = recomm_user.swiped_right.filter((elem) => {
      return !current_user.swiped_right.includes(elem);
    });
    const dbRestCollection = await DbConnection.getCollection("Restaurants");
    const unswiped_rest = await dbRestCollection
      .find({ id: { $in: result } })
      .toArray();
    res.json(unswiped_rest);
    console.log(unswiped_rest.length);
  });
});

// User unliked restaurant ***************************************************************
app.post("/swipedleft/:id", async (req, res) => {
  const userId = req.params.id;
  const restId = req.body.restId;

  const dbCollection = await DbConnection.getCollection("Testdata");
  dbCollection.findOneAndUpdate(
    { _id: ObjectId(userId) },
    { $push: { swiped_right: restId } },
    { upsert: true },
    function (error, success) {
      if (error) {
        console.log(error);
      } else {
        console.log(success);
      }
    }
  );

  //return updated dummyuser
  const dummyuser = await dbCollection
    .find({ _id: ObjectId(userId) })
    .toArray();
  res.json(dummyuser);
});

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

// config express-session
const sess = {
  secret: "this is some secret",
  cookie: {},
  resave: false,
  saveUninitialized: true,
};

if (app.get("env") === "production") {
  // Use secure cookies in production (requires SSL/TLS)
  sess.cookie.secure = true;

  // Uncomment the line below if your application is behind a proxy (like on Heroku)
  // or if you're encountering the error message:
  // "Unable to verify authorization request state"
  // app.set('trust proxy', 1);
}

app.use(session(sess));

// Configure Passport to use Auth0
var strategy = new Auth0Strategy(
  {
    domain: process.env.AUTH0_DOMAIN,
    clientID: process.env.AUTH0_CLIENT_ID,
    clientSecret: process.env.AUTH0_CLIENT_SECRET,
    callbackURL: process.env.AUTH0_CALLBACK_URL || "http://localhost:8080/",
  },
  function (accessToken, refreshToken, extraParams, profile, done) {
    // accessToken is the token to call Auth0 API (not needed in the most cases)
    // extraParams.id_token has the JSON Web Token
    // profile has all the information from the user
    return done(null, profile);
  }
);

passport.use(strategy);

app.use(passport.initialize());
app.use(passport.session());
app.use(router);

app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "..", "build", "index.html"));
});
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
