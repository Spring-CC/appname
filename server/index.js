require("dotenv").config();
const mongoose = require('mongoose');
const server = require("./app");
// const db = require("./db");

const init = async () => {
  await server.start();
  console.log("Server running on %s", server.info.uri);
};

process.on("unhandledRejection", (err) => {
  console.log(err);
  process.exit(1);
});

const URI = `mongodb+srv://${process.env.DBUSER}:${process.env.PASSWORD}@cc13.temn3.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`

mongoose.connect( URI, {
  useUnifiedTopology: true, 
  useNewUrlParser: true
})
.then(() => console.log("DB established"))
.catch(error => console.log("fucked up" + JSON.stringify(error)));

init();
