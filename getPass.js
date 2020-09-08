const bcrypt = require("bcrypt")

const passwordEnteredByUser = "yuricc13japan"
const hash = "$2b$10$lvVBpmqTBCCJ9QehECbQt.Bis3RQpSEy.z9eoeAZppnaaIc/S0grG"

bcrypt.compare(passwordEnteredByUser, hash, function(err, isMatch) {
  if (err) {
    throw err
  } else if (!isMatch) {
    console.log("Password doesn't match!")
  } else {
    console.log("Password matches!")
  }
})