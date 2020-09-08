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
const DbConnection = require("../dbatlas");
const app = express();

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

  const dbCollection = await DbConnection.getCollection("Users");
  let user = await dbCollection.find().toArray();

  await dbCollection.insertOne({
    username: newUser.username,
    password: newUser.password,
  });

  //return updated list
  const users = await dbCollection.find().toArray();
  res.json(users);
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
