require("dotenv").config();
// required for server
const express = require("express");
const morgan = require("morgan");
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
// for database
const mongoose = require("mongoose");
const ObjectId = require("mongoose").Types.ObjectId;
const DbConnection = require("../dbatlas");
// required for login with Auth0
const session = require("express-session");
const passport = require("passport");
const Auth0Strategy = require("passport-auth0");
// used for machine learning
const { PythonShell } = require("python-shell");
const { parse } = require("json2csv");
const fs = require("fs");
// for favorites
require("../DB/Favorites");
const Favorites = mongoose.model("Favorites");

// Initalizing app
const app = express();
// Getting DB login from the ENV file
const mongoURI = "" + process.env.API_URL + "";
// Connecting to DB
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
mongoose.connection.on("connected", () => {
  console.log("connected to mongodb");
});
mongoose.connection.on("error", (error) => {
  console.log("error", error);
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

// Check status route
app.get("/", (req, res) => {
  try {
    res.json({ message: "The server for Munchify is running." });
  } catch (error) {
    res.json({ message: error });
  }
});

//mongoDB routes**********************************************************************

//get all restaurants
app.get("/restaurants", async (req, res) => {
  try {
    const dbCollection = await DbConnection.getCollection("Restaurants");
    const restaurants = await dbCollection.find().toArray();
    res.json(restaurants);
  } catch (error) {
    console.log(error)
  }
});

//get all users, Auth0 users
app.get("/users", async (req, res) => {
  try {
    const dbCollection = await DbConnection.getCollection("Users");
    const users = await dbCollection.find().toArray();
    res.json(users);
  } catch (error) {
    console.log(error)
  }
});

//Get restaurants by ID (params)
app.get("/restaurants/:id", async (req, res) => {
  try {
    const restId = req.params.id;
    const dbCollection = await DbConnection.getCollection("Restaurants");
    const restaurant = await dbCollection.findOne({ id: restId });
    res.json(restaurant);
  } catch (error) {
    console.log(error)
  }
});

//Get restaurants by category/type of restaurant  (params)
app.get("/restaurants/:category/categories", async (req, res) => {
  try {
    const restCat = req.params.category;
    const dbCollection = await DbConnection.getCollection("Restaurants");
    const restaurant = await dbCollection.findOne({ category: restCat });
    res.json(restaurant);
  } catch (error) {
    console.log(error)
  }
});
//*************Favorites system **********************************************************************/
//add favorite to user (rename?)
app.post("/favorites/:rest_id", async (req, res) => {
  try {
    const user = req.body.user_Id;
    const restaurant = req.params.rest_id;
    const dbCollection = await DbConnection.getCollection("favorites");
    await dbCollection.findOneAndUpdate(
      { user_Id: user },
      { $push: { restaurant_Id: restaurant } }
    );
    res.json("update it");
  } catch (error) {
    console.log(error)
  }
});

//delete favorite in user <-- should be app.delete then?
app.delete("/favorites/:userId/:rest_id", async (req, res) => {
  try {
    const user = req.params.userId;
    const restaurant = req.params.rest_id;
    const dbCollection = await DbConnection.getCollection("favorites");
    await dbCollection.updateOne(
      { user_Id: user },
      { $pull: { restaurant_Id: restaurant } }
    );
    res.json("Deleted restaurant");
  } catch (error) {
    console.log(error)
  }
});

// get favorites
app.get("/favorites", async (req, res) => {
  try {
    const dbCollection = await DbConnection.getCollection("favorites");
    const favorites = await dbCollection.find().toArray();
    res.json(favorites);
  } catch (error) {
    console.log(error)
  }
});

//Mongoose Favorite route**********************************************************************
// add new user in the favorites
app.post("/favorites/user/:id", (req, res) => {
  const favorite = new Favorites({
    user_Id: req.params.id,
    restaurant_Id: req.body.restaurant_Id,
  });
  favorite
    .save()
    .then((data) => {
      res.send("posted");
    })
    .catch((error) => {
      console.log(error)
    });
});

// Get restaurants testuser liked : recommender system ****************************************************
// the name is not good

app.get("/recommender/:id", async (req, res) => {
  res.json(["g008249","g600156","gdwe301","gab1400","gatj212","g661400","6272655","a616599","6277861","ga5n905","ggsz700","gdkx700","7262655","gd63300","gacb209","g005301","gghw900","g441105","gc5u602","gf4a900","a127670","g685302","g008235","a188908","6460824","gd5n100","gefr202","g111304","g278000","e628402","5252459","7500211","gf6d300","e295813","6390635","g084651","g600188","gf1h200","b963607","p701503","g887404","6183474","gamh200","6390667","geez505","g600165","g600108","7362957","ggxm500","g486510","g783903","g939319","gacb242","g097925","e991603","a482827","gek1100","gdmy707","gas2101","ge2b701","6390637","gf2t939","7734533","5153762","a527200","gdtp006","gdh4400","6710182","6390645","e093000","gg1x500","gfek607","ggxr200","gfkt100","gey4501","a616569","gddc701","p663200","7660648","6184808"]);

// app.get("/recommender/:id", async (req, res) => { // use "userid"
//   try {
//     const userId = req.params.id;
//     const dbCollection = await DbConnection.getCollection("Testdata");
//     const current_user = await dbCollection.findOne({userid: userId,});
//     console.log(current_user)
//     const options = {
//       scriptPath: path.resolve(__dirname, "..", "recommender"),
//       args: [current_user._id],
//     };
//     await PythonShell.run("machine.py", options, async function (error, results) {
//       if (error) throw error;
//       const recomm_user = await dbCollection.findOne({
//         _id: mongoose.Types.ObjectId(results[1]),
//       });
//       console.log(recomm_user)
//       let result = recomm_user.swiped_right.filter((elem) => {
//         return !current_user.swiped_right.includes(elem);
//       });
//       const dbRestCollection = await DbConnection.getCollection("Restaurants");
//       const unswiped_rest = await dbRestCollection
//         .find({ id: { $in: result } })
//         .toArray();
//         // const unswiped_rest = [];
//       res.json(unswiped_rest);
//     });  
//   } catch (error) {
//     console.log(error)
//   }
});

//get recommender users
app.get("/recommender/users", async (req, res) => {
  try {
    const dbCollection = await DbConnection.getCollection("Testdata");
    const testUsers = await dbCollection.find().toArray();
    res.json(testUsers);
  } catch (error) {
    console.log(error)
  }
});

//Post restaurant ID to testdata database, for recommender
app.post("/recommender/:id", async (req, res) => {   // use "userid"
  try {
    const userId = req.params.id;
    const restId = req.body.restId;
    const dbCollection = await DbConnection.getCollection("Testdata");
    dbCollection.findOneAndUpdate(
      { userid: userId },
      { $addToSet: { swiped_right: restId } },
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
    // update csv for that user
    res.json(dummyuser);
  } catch (error) {
    console.log(error)
  }
});
// shared route ***************************************************************************************
app.post("/shared", async (req, res) => {
  // try {
  //     // first users ID
  // const sUser = req.body.sharingUser;
  // const dbCollection = await DbConnection.getCollection("Testdata");
  // const sharing_User = await dbCollection.findOne({
  //   userid: sUser,
  // });
  // // second user ID
  // const rUser = req.body.receivingUser;
  // // const dbCollection = await DbConnection.getCollection("Testdata");
  // const receiving_User = await dbCollection.findOne({
  //   //userid: mongoose.Types.ObjectId(userId),
  //   userid: rUser,
  // });
  // // current_user = sharing_User + receiving_User (arrays)
  // let current_user_array = [
  //   ...new Set([...sharing_User.swiped_right, ...receiving_User.swiped_right]),
  // ];

  // //append new data in csv file
  // const fields = ["_id", "userid", "swiped_right"];

  // const appendThis = [
  //   {
  //     _id: "2000",
  //     userid: "2000",
  //     swiped_right: current_user_array,
  //   },
  // ];

  // const toCsv = {
  //   // data: appendThis,
  //   fields: fields,
  //   header: false,
  // };

  // fs.stat("./data/testdata2.csv", function (error, stat) {
  //   if (error) { console.log(error) } else {
  //     let csv = parse(appendThis, toCsv);
  //     fs.appendFile("./data/testdata2.csv", csv, function (error) {
  //       if (error) {console.log(error)}
  //     });
  //   }
  // });

  // const options = {
  //   scriptPath: path.resolve(__dirname, "..", "recommender"),
  //   args: ["2000"],
  // };
  // await PythonShell.run("machine.py", options, async function (error, results) {
  //   if (error) throw error;
  //   const recomm_user = await dbCollection.findOne({
  //     _id: mongoose.Types.ObjectId(results[4]),
  //   });
  //   let result = recomm_user.swiped_right.filter((elem) => {
  //     return !appendThis[0].swiped_right.includes(elem);
  //   });
  //   const dbRestCollection = await DbConnection.getCollection("Restaurants");
  //   const unswiped_rest = await dbRestCollection
  //     .find({ id: { $in: result } })
  //     .toArray();

  //   //remove from the csv file
  //   const filename = "./data/testdata2.csv";
  //   fs.readFile(filename, function (error, data) {
  //     if (error) throw error;
  //     let theFile = data.toString().split("\n");
  //     theFile[theFile.length - 1] = "";
  //     fs.writeFile(filename, theFile.join("\n"), function (error) {
  //       if (error) {
  //         console.log(error);
  //       }
  //     });
  //   });
  //   res.json(unswiped_rest);
  // });
  // } catch (error) {
  //   console.log(error)
  // }
  res.json(["ggeg300","p458303","g286917","ggwj601","get2520","g083512","e220211","gak5856","e534100","6089381","e093000","gfkt100","7453022","p770504","p701503","ggx4800","gd4u672","gacb247","e904800","p690002","a585203","gak5896","ggaw100","gf11418","g695000","ge6a105","ggx1700","e259912","g029054","gb3b901","gdf5833","7088271","gddn402","7463312","gg3z000","geb8903","gf5j400","gdup005","p864044","gaj9300","ggy5100","gf34800","g111339","gb0d200","gejf201","g029049","7262710","ggkw600","a773100","g454105","gg4u502","a585201","g641744","7499207","b274903","g914009","g084605","gacb241","g801100","7402189","gf16301","ggwd700","b165201","e295810","gc5u602","ggwx001","e860404","gg0v004","7460571","g286916","ga1k804","p864087","gefr202","g047005","ga5c300","g725438","gf1h200","6390652","gf22504"])
});

// Updata CSV file when a user login / signup *****************************************************************
app.post("/updatecsv", async (req, res) => {
  const dbCollection = await DbConnection.getCollection("Testdata");
  const current_user = await dbCollection
    .find({}, { swiped_left: 0 })
    .toArray();
  res.json(current_user);

  const fields = ["_id", "userid", "swiped_right"];

  const toCsv = {
    fields: fields,
    header: true,
  };
  let csv = parse(current_user, toCsv) + "\n";

  fs.writeFile("./data/testdata2.csv", csv, function (error) {
    if (error) {
      return console.log(error);
    }
    console.log("CSV file updated!!");
  });
});

//***************************************************************************************** */

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

const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
