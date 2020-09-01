require("dotenv").config();

async function getdata () {
    const data = await axios.get(`https://api.gnavi.co.jp/RestSearchAPI/v3/?keyid=${process.env.REACT_APP_API_KEY}pref=PREF13`)
    console.log(data)
  }

  getdata();