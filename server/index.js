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
  res.json([
      {
          "@attributes": {
              "order": 0
          },
          "id": "7660648",
          "update_date": "2018-12-14T05:06:16+09:00",
          "name": "麺散",
          "name_kana": "メンチラシ",
          "latitude": "35.666474",
          "longitude": "139.705094",
          "category": "うどん",
          "url": "https://r.gnavi.co.jp/psbcfkgv0000/?ak=9b9qOa6Vs33uQ8KhMyrABLuHYAegxPxVl5x9wObFwQ0%3D",
          "url_mobile": "http://mobile.gnavi.co.jp/shop/7660648/?ak=9b9qOa6Vs33uQ8KhMyrABLuHYAegxPxVl5x9wObFwQ0%3D",
          "coupon_url": {
              "pc": "",
              "mobile": ""
          },
          "image_url": {
              "shop_image1": "https://tblg.k-img.com/restaurant/images/Rvw/93523/640x640_rect_93523976.jpg",
              "shop_image2": "https://tblg.k-img.com/restaurant/images/Rvw/130853/640x640_rect_130853304.jpg",
              "qrcode": "https://c-r.gnst.jp/tool/qr/?id=7660648&q=6"
          },
          "address": "〒150-0001 東京都渋谷区神宮前6-13-7 ",
          "tel": "03-6427-9898",
          "tel_sub": "",
          "fax": "",
          "opentime": "",
          "holiday": "",
          "access": {
              "line": "東京メトロ副都心線",
              "station": "明治神宮前駅",
              "station_exit": "4番口",
              "walk": "徒歩4",
              "note": ""
          },
          "parking_lots": "",
          "pr": {
              "pr_short": "",
              "pr_long": ""
          },
          "code": {
              "areacode": "AREA110",
              "areaname": "関東",
              "prefcode": "PREF13",
              "prefname": "東京都",
              "areacode_s": "AREAS2129",
              "areaname_s": "原宿",
              "category_code_l": [
                  "RSFST08000",
                  ""
              ],
              "category_name_l": [
                  "ラーメン・麺料理",
                  ""
              ],
              "category_code_s": [
                  "RSFST08002",
                  ""
              ],
              "category_name_s": [
                  "うどん",
                  ""
              ]
          },
          "budget": "Information is not provided",
          "party": "Information is not provided",
          "lunch": "Information is not provided",
          "credit_card": "Information is not provided",
          "e_money": "Information is not provided",
          "flags": {
              "mobile_site": 1,
              "mobile_coupon": 0,
              "pc_coupon": 0
          }
        },
        {
          "@attributes": {
              "order": 46
          },
          "id": "gacb229",
          "update_date": "2020-09-01T07:43:56+09:00",
          "name": "蒲田 肉バル バーレイウィート ～barley wheat～",
          "name_kana": "カマタニクバル バーレイウィート",
          "latitude": "35.561987",
          "longitude": "139.714037",
          "category": "クラフトビール×肉バル",
          "url": "https://r.gnavi.co.jp/3p64t06x0000/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
          "url_mobile": "http://mobile.gnavi.co.jp/shop/gacb229/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
          "coupon_url": {
              "pc": "https://r.gnavi.co.jp/3p64t06x0000/coupon/",
              "mobile": "http://mobile.gnavi.co.jp/shop/gacb229/coupon"
          },
          "image_url": {
              "shop_image1": "https://rimage.gnst.jp/rest/img/3p64t06x0000/t_0nx1.jpg",
              "shop_image2": "https://rimage.gnst.jp/rest/img/3p64t06x0000/t_0nx2.jpg",
              "qrcode": "https://c-r.gnst.jp/tool/qr/?id=gacb229&q=6"
          },
          "address": "〒144-0051 東京都大田区西蒲田7-67-14 SANKOビル4F",
          "tel": "050-3467-8070",
          "tel_sub": "03-3731-5131",
          "fax": "03-3731-5131",
          "opentime": "第1,2,3,4,5日 16:00～23:00(L.O.22:00、ドリンクL.O.22:30)(日曜日の営業時間)\n月～土・祝前日・祝日 17:00～24:00(L.O.23:00、ドリンクL.O.23:30)(ビールの在庫や食材の在庫次第で閉める場合が御座います。)",
          "holiday": "不定休日あり",
          "access": {
              "line": "ＪＲ京浜東北線",
              "station": "蒲田駅",
              "station_exit": "",
              "walk": "2",
              "note": ""
          },
          "parking_lots": "",
          "pr": {
              "pr_short": "☆営業再開致します！ご予約、お来店お待ちしております！",
              "pr_long": "■国産クラフトビール\n話題のクラフトビールが15種類以上楽しめる、イタリアン肉バルです！\n小さな醸造所で職人がこだわりを持って造り出すそれぞれの風味を、相性抜群のタパスや肉料理等と一緒にお楽しみいただけます。\n嬉しい飲み比べセットも◎\n\n■飲み放題付宴会パーティーコースはなんと2980円～！／宴会は最大60名様迄OK\n歓迎会・送別会などの宴会は勿論、2次会パーティーや合コンなどの飲み会に◎\n\n■テレビあり！個室あり！様々なシーンでご利用可能\n《個室》デート・女子会・合コン・ママ会などの飲み会や接待にも最適♪\n《カウンター》少人数・お一人でも気軽に寄れるカウンター席♪15TAPの地ビールは圧巻！\n《テーブル席》おしゃれな内観でごゆっくりどうぞ★最大人数：着席時60名様/立食時70名様"
          },
          "code": {
              "areacode": "AREA110",
              "areaname": "関東",
              "prefcode": "PREF13",
              "prefname": "東京都",
              "areacode_s": "AREAS2255",
              "areaname_s": "蒲田",
              "category_code_l": [
                  "RSFST09000",
                  "RSFST10000"
              ],
              "category_name_l": [
                  "居酒屋",
                  "ダイニングバー・バー・ビアホール"
              ],
              "category_code_s": [
                  "RSFST09004",
                  "RSFST10014"
              ],
              "category_name_s": [
                  "居酒屋",
                  "スペインバル・イタリアンバール"
              ]
          },
          "budget": 3000,
          "party": 3500,
          "lunch": "Information is not provided",
          "credit_card": "VISA,MasterCard,UC,DC,アメリカン・エキスプレス,JCB,NICOS,セゾン,MUFG",
          "e_money": "Information is not provided",
          "flags": {
              "mobile_site": 1,
              "mobile_coupon": 1,
              "pc_coupon": 1
          }
      },     
      {
          "@attributes": {
              "order": 8
          },
          "id": "gayx205",
          "update_date": "2020-09-01T12:03:48+09:00",
          "name": "やきとり家すみれ 渋谷宮益坂店",
          "name_kana": "ヤキトリヤスミレ シブヤミヤマスザカテン",
          "latitude": "35.660186",
          "longitude": "139.705003",
          "category": "大山どりやきとり専門店",
          "url": "https://r.gnavi.co.jp/hd329u4r0000/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
          "url_mobile": "http://mobile.gnavi.co.jp/shop/gayx205/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
          "coupon_url": {
              "pc": "https://r.gnavi.co.jp/hd329u4r0000/coupon/",
              "mobile": "http://mobile.gnavi.co.jp/shop/gayx205/coupon"
          },
          "image_url": {
              "shop_image1": "https://rimage.gnst.jp/rest/img/hd329u4r0000/t_0p79.jpg",
              "shop_image2": "https://rimage.gnst.jp/rest/img/hd329u4r0000/t_0p4s.jpg",
              "qrcode": "https://c-r.gnst.jp/tool/qr/?id=gayx205&q=6"
          },
          "address": "〒150-0002 東京都渋谷区渋谷1-8-8",
          "tel": "050-3464-6956",
          "tel_sub": "03-6427-9504",
          "fax": "03-6427-9504",
          "opentime": "月～金 ランチ：11:30～14:30(L.O.14:00)(※祝日を除きます。)\n月～日・祝日 ディナー：17:00～24:00(L.O.23:00、ドリンクL.O.23:30)",
          "holiday": "年中無休",
          "access": {
              "line": "ＪＲ",
              "station": "渋谷駅",
              "station_exit": "",
              "walk": "4",
              "note": ""
          },
          "parking_lots": "",
          "pr": {
              "pr_short": "【大山どり専門店】 ■SMILE=すみれ - 笑顔咲く場所 - □焼き鳥は全て大山どりを使用し、手刺しで串打ち ■焼き鳥を日常食に!心地良い空間で気軽に…ご自宅でも笑顔に!",
              "pr_long": "■美味しい焼き鳥を…\n幅広い層のお客様に気軽に食べてもらいたい…\n「焼き鳥、美味しかったよ」の一言が聞きたくて\n今日も、1本1本丁寧に焼きあげます\n■大山どり専門店のこだわり\n【希少】程よい脂の感じがトロっぽい\"ひなトロ\"\n【名物】大山どり一羽分使用した\"王様レバー\"\n【揚物】フワッとサクッと軽い口当たり！\"大山どりのから揚げ\"\n【逸品】しっとり柔らか\"魔法の低温調理\"\n■焼きのこだわり\n強火の遠火で旨味をとじこめ、皮はパリッと、肉はふっくらジューシーに\n\n■自宅でも笑顔になってほしい！\n【テイクアウト】電話予約◎ご家族やご友人と「やきとり家すみれ」の味をご自宅でも\n大切なお客様、スタッフの「安全・安心」のためにコロナ感染症対策を実施しております\n美味しい焼き鳥で笑顔に…スタッフ一同、心よりご来店お待ちしております"
          },
          "code": {
              "areacode": "AREA110",
              "areaname": "関東",
              "prefcode": "PREF13",
              "prefname": "東京都",
              "areacode_s": "AREAS2127",
              "areaname_s": "渋谷東口・宮益坂",
              "category_code_l": [
                  "RSFST09000",
                  ""
              ],
              "category_name_l": [
                  "居酒屋",
                  ""
              ],
              "category_code_s": [
                  "RSFST09004",
                  ""
              ],
              "category_name_s": [
                  "居酒屋",
                  ""
              ]
          },
          "budget": 3000,
          "party": 3500,
          "lunch": 900,
          "credit_card": "VISA,ダイナースクラブ,アメリカン・エキスプレス,JCB,Discover Card",
          "e_money": "Information is not provided",
          "flags": {
              "mobile_site": 1,
              "mobile_coupon": 1,
              "pc_coupon": 1
          }
      },
      {
          "@attributes": {
              "order": 11
          },
          "id": "g317400",
          "update_date": "2020-09-01T01:25:55+09:00",
          "name": "黒船亭",
          "name_kana": "クロフネテイ",
          "latitude": "35.710143",
          "longitude": "139.773206",
          "category": "明治から受け継がれた味",
          "url": "https://r.gnavi.co.jp/g317400/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
          "url_mobile": "http://mobile.gnavi.co.jp/shop/g317400/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
          "coupon_url": {
              "pc": "",
              "mobile": ""
          },
          "image_url": {
              "shop_image1": "https://rimage.gnst.jp/rest/img/gu1nmnzm0000/t_008d.jpg",
              "shop_image2": "https://rimage.gnst.jp/rest/img/gu1nmnzm0000/t_008e.jpg",
              "qrcode": "https://c-r.gnst.jp/tool/qr/?id=g317400&q=6"
          },
          "address": "〒110-0005 東京都台東区上野2-13-13 キクヤビル4Ｆ",
          "tel": "050-3464-4681",
          "tel_sub": "03-3837-1617",
          "fax": "03-3839-3800",
          "opentime": " 11:30～22:45(L.O.22:00)(※5月20日より営業再開とさせていただきます。  (当面の間、ラストオーダー21:00、閉店を22:00にて営業致します。))",
          "holiday": "無",
          "access": {
              "line": "ＪＲ",
              "station": "上野駅",
              "station_exit": "",
              "walk": "4",
              "note": ""
          },
          "parking_lots": "",
          "pr": {
              "pr_short": "上野老舗洋食屋 伝統の味を創業明治より継承 じっくりコトコト手間隙かけ煮込んだデミグラスソースでほっと和む 上野駅近 特典有り!",
              "pr_long": "～下町で愛される老舗洋食屋 黒船亭～\n明治に創業の老舗のレストランが手作りの味を厳しく守り抜いています。\n例えば、デミグラスソースは洋食の華。\n様々な素材をコトコト煮込み、丹念に裏漉すという作業を一週間以上も繰り返して作られます。\nこのソースからハヤシライスやシチューの深い味わいが生まれるのです。\n★一番人気！ビーフシチューコース5,900円\n★お持ち帰りメニューあります♪\n★全国へ配送いたします☆\n★上野池之端＜ＪＲ上野駅 徒歩4分＞\n★シックで清潔感のある店内♪\n\n上野、御徒町でお食事、接待、歓送迎会、パーティー、女子会、親睦会、同窓会などでも！"
          },
          "code": {
              "areacode": "AREA110",
              "areaname": "関東",
              "prefcode": "PREF13",
              "prefname": "東京都",
              "areacode_s": "AREAS2198",
              "areaname_s": "上野",
              "category_code_l": [
                  "RSFST13000",
                  "RSFST13000"
              ],
              "category_name_l": [
                  "洋食",
                  "洋食"
              ],
              "category_code_s": [
                  "RSFST13003",
                  "RSFST13006"
              ],
              "category_name_s": [
                  "洋食屋",
                  "ハヤシライス"
              ]
          },
          "budget": 3000,
          "party": 4000,
          "lunch": 2500,
          "credit_card": "VISA,MasterCard,UC,DC,UFJ,ダイナースクラブ,アメリカン・エキスプレス,JCB,NICOS,セゾン,MUFG",
          "e_money": "PayPay",
          "flags": {
              "mobile_site": 1,
              "mobile_coupon": 0,
              "pc_coupon": 0
          }
      },
      {
        "@attributes": {
            "order": 46
        },
        "id": "g497802",
        "update_date": "2020-09-01T02:11:14+09:00",
        "name": "グラン・パ 中野北口店",
        "name_kana": "グランパ ナカノキタグチテン",
        "latitude": "35.709316",
        "longitude": "139.663734",
        "category": "完全個室/隠れ家一軒家",
        "url": "https://r.gnavi.co.jp/g497802/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
        "url_mobile": "http://mobile.gnavi.co.jp/shop/g497802/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
        "coupon_url": {
            "pc": "https://r.gnavi.co.jp/g497802/coupon/",
            "mobile": "http://mobile.gnavi.co.jp/shop/g497802/coupon"
        },
        "image_url": {
            "shop_image1": "https://rimage.gnst.jp/rest/img/2huhw2km0000/t_006v.jpg",
            "shop_image2": "https://rimage.gnst.jp/rest/img/2huhw2km0000/t_006w.gif",
            "qrcode": "https://c-r.gnst.jp/tool/qr/?id=g497802&q=6"
        },
        "address": "〒164-0001 東京都中野区中野4-6-10 第2芝ビル1F",
        "tel": "050-3463-5063",
        "tel_sub": "03-3389-9060",
        "fax": "03-3389-9060",
        "opentime": "月～日 ランチ：11:15～15:30(L.O.15:00)\n月～日 ディナー：17:00～23:00(L.O.22:00)",
        "holiday": "不定休日あり",
        "access": {
            "line": "ＪＲ",
            "station": "中野駅",
            "station_exit": "北口",
            "walk": "5",
            "note": ""
        },
        "parking_lots": "",
        "pr": {
            "pr_short": "テイクアウト出来ます！グランドメニュー全てOK！ 10名～完全個室貸切プランは3H食べ飲み放題 隠れ家一軒家イタリアン♪グランパのPARTYコースはパスタが食べ放題◎",
            "pr_long": "中野の隠れ家一軒家イタリアン♪\nアットホームな雰囲気で素敵な時間をお過ごし下さい！\n●○● 当店オススメコースはこちら ●○●\n\n【 10名～20名様★完全個室プレミアムプラン 】\nパスタが食べ放題＆飲み放題の限定プラン♪\n嬉しい3時間制★￥4500\n【 ＰＡＲＴＹコース各種 】\nグランパのＰＡＲＴＹコースはピザやパスタが食べ放題♪\n特典付の記念日コースもスタート！\n歓送迎会・ママ会・女子会など幅広くご利用いただいています★\n●○● こだわりの食材 ●○●\nもちもち生パスタは是非一度ご賞味下さい！\n季節の食材をふんだんに使用したナチュラルイタリアン♪\nきっとご満足頂けます◎\n\nスタッフ一同、ご来店心よりお待ちしております！！"
        },
        "code": {
            "areacode": "AREA110",
            "areaname": "関東",
            "prefcode": "PREF13",
            "prefname": "東京都",
            "areacode_s": "AREAS2217",
            "areaname_s": "中野",
            "category_code_l": [
                "RSFST11000",
                "RSFST09000"
            ],
            "category_name_l": [
                "イタリアン・フレンチ",
                "居酒屋"
            ],
            "category_code_s": [
                "RSFST11002",
                "RSFST09004"
            ],
            "category_name_s": [
                "イタリアン(イタリア料理)",
                "居酒屋"
            ]
        },
        "budget": 2500,
        "party": 4000,
        "lunch": 1000,
        "credit_card": "VISA,MasterCard,NICOS,MUFG",
        "e_money": "Information is not provided",
        "flags": {
            "mobile_site": 1,
            "mobile_coupon": 1,
            "pc_coupon": 1
        }
    },
    {
      "@attributes": {
          "order": 45
      },
      "id": "ge6a113",
      "update_date": "2020-09-01T15:01:52+09:00",
      "name": "北海道の恵み 個室居酒屋 北の台所 八王子店",
      "name_kana": "ホッカイドウノメグミコシツイザカヤ キタノダイドコロハチオウジテン",
      "latitude": "35.656901",
      "longitude": "139.337973",
      "category": "個室で食べ飲み放題",
      "url": "https://r.gnavi.co.jp/s01m6dzf0000/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
      "url_mobile": "http://mobile.gnavi.co.jp/shop/ge6a113/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
      "coupon_url": {
          "pc": "https://r.gnavi.co.jp/s01m6dzf0000/coupon/",
          "mobile": "http://mobile.gnavi.co.jp/shop/ge6a113/coupon"
      },
      "image_url": {
          "shop_image1": "https://rimage.gnst.jp/rest/img/s01m6dzf0000/t_0n7d.jpg",
          "shop_image2": "",
          "qrcode": "https://c-r.gnst.jp/tool/qr/?id=ge6a113&q=6"
      },
      "address": "〒192-0083 東京都八王子市旭町6-9 7F",
      "tel": "050-3467-4201",
      "tel_sub": "050-5358-1149",
      "fax": "",
      "opentime": "月～日・祝前日・祝日 12:00～24:00(L.O.23:00、ドリンクL.O.23:30)\n月～木・日・祝日 12:00～17:00\n金・土・祝前日 12:00～16:00(※4名様以上で要予約となります。※24:00～29:00の深夜宴会も10名様以上で承ります。お気軽にお問い合わせください！)",
      "holiday": "年中無休",
      "access": {
          "line": "ＪＲ",
          "station": "八王子駅",
          "station_exit": "",
          "walk": "2",
          "note": ""
      },
      "parking_lots": "",
      "pr": {
          "pr_short": "八王子駅より徒歩２分!! 店内消毒徹底など感染症予防対策バッチリ！ WiFi環境もございます！ ◆ランチ営業始めました!",
          "pr_long": "〈八王子駅チカ！〉\n万全のコロナ対策実施中\n美味しい料理&飲み物、暑さと日焼けを避けられる\n店内空間を提供しております。\n〈個室でまったり♪〉\n掘りごたつやテーブルの完全個室をご用意！\n少人数〜団体様までご案内可能です。\n〈北海道の幸で宴会！〉\n期間限定！「北海道の美味150品以上」食べ飲み放題3,500円⇒2,500円\n食べ放題派のあなたに『十勝地鶏の逸品食べ放題コース』3h飲み放題付き⇒3,000円\n【八王子での宴会・飲み会にご利用ください。】"
      },
      "code": {
          "areacode": "AREA110",
          "areaname": "関東",
          "prefcode": "PREF13",
          "prefname": "東京都",
          "areacode_s": "AREAS2288",
          "areaname_s": "八王子",
          "category_code_l": [
              "RSFST09000",
              ""
          ],
          "category_name_l": [
              "居酒屋",
              ""
          ],
          "category_code_s": [
              "RSFST09004",
              ""
          ],
          "category_name_s": [
              "居酒屋",
              ""
          ]
      },
      "budget": 3000,
      "party": 3000,
      "lunch": 980,
      "credit_card": "VISA,MasterCard,UC,DC,UFJ,ダイナースクラブ,アメリカン・エキスプレス,JCB",
      "e_money": "Information is not provided",
      "flags": {
          "mobile_site": 1,
          "mobile_coupon": 1,
          "pc_coupon": 1
      }
  },
  {
    "@attributes": {
        "order": 43
    },
    "id": "e587800",
    "update_date": "2020-09-01T05:54:15+09:00",
    "name": "蒸し焼き野菜＆天串ダイニング 歌舞伎市場 新宿東口店",
    "name_kana": "ムシヤキヤサイアンドテンクシダイニングカブキイチバ シンジュクヒガシグチテン",
    "latitude": "35.694415",
    "longitude": "139.702658",
    "category": "【新宿】蒸焼鍋の専門店",
    "url": "https://r.gnavi.co.jp/e587800/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
    "url_mobile": "http://mobile.gnavi.co.jp/shop/e587800/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
    "coupon_url": {
        "pc": "https://r.gnavi.co.jp/e587800/coupon/",
        "mobile": "http://mobile.gnavi.co.jp/shop/e587800/coupon"
    },
    "image_url": {
        "shop_image1": "https://rimage.gnst.jp/rest/img/9ycwbrwt0000/t_003b.jpg",
        "shop_image2": "https://rimage.gnst.jp/rest/img/9ycwbrwt0000/t_002e.jpg",
        "qrcode": "https://c-r.gnst.jp/tool/qr/?id=e587800&q=6"
    },
    "address": "〒160-0021 東京都新宿区歌舞伎町1-13-10 フジビル2F",
    "tel": "050-3476-6751",
    "tel_sub": "03-3200-5831",
    "fax": "03-3200-5831",
    "opentime": " 11:00～18:00(昼のママ会コースや、昼間のスペース貸しをご予約の場合はお昼の時間帯も営業致します。その他、お昼のご宴会も承りますのでお気軽にご連絡下さい。それ以外の場合は昼間の営業は行っておりませんのでご了承下さい。)\n月～土 18:00～翌5:00(L.O.4:00、ドリンクL.O.4:30)\n日・祝日 18:00～24:00(L.O.23:00、ドリンクL.O.23:30)",
    "holiday": "無",
    "access": {
        "line": "ＪＲ",
        "station": "新宿駅",
        "station_exit": "東口",
        "walk": "5",
        "note": ""
    },
    "parking_lots": "",
    "pr": {
        "pr_short": "▼旨さ別次元!!白菜と国産豚のミルフィーユ蒸焼鍋 ▼野菜ソムリエ厳選♪旬の味覚と新鮮魚介の名物天串 ▼2H飲放付3,500円～少人数個室 ▼歓送迎会予約受付中！",
        "pr_long": "[西武新宿駅徒歩3分のアクセス良好・ロボットレストランの目の前]\n老舗窯元\"長谷園\"のタジン鍋を使用した蒸焼鍋に厳選素材の天串が味わえる店\n◆看板料理の蒸焼鍋に天串\n白菜と国産豚バラがミルフィーユ状に何層にも重なった一番人気の蒸焼鍋や\nエリンギ、しいたけ、えのき、しめじ等秋の味覚がご堪能出来るきのこ蒸焼鍋\n野菜ソムリエ厳選した彩り鮮やかな旬野菜に鮮度抜群の魚介の天串が愉しめます\n◆歓送迎会コース\n[2H飲放付]選べる蒸焼鍋と天串コース〈全7品〉3,500円\n※蒸焼鍋が和牛鍋の場合+480円\n◆店内のご紹介\nテーブル席：2～14名様（レイアウト自由で各種ご宴会などに）\nカウンター：1～10名様（お一人様や横並びでカップルなどに）\n半個室席：2～4名様（目隠しのれん＆TV付のプライベート空間）\nお店貸切：20～30名様（詳しくはスタッフまで）"
    },
    "code": {
        "areacode": "AREA110",
        "areaname": "関東",
        "prefcode": "PREF13",
        "prefname": "東京都",
        "areacode_s": "AREAS2115",
        "areaname_s": "新宿東口・歌舞伎町",
        "category_code_l": [
            "RSFST04000",
            "RSFST09000"
        ],
        "category_name_l": [
            "鍋",
            "居酒屋"
        ],
        "category_code_s": [
            "RSFST04001",
            "RSFST09004"
        ],
        "category_name_s": [
            "鍋料理",
            "居酒屋"
        ]
    },
    "budget": 2900,
    "party": 3500,
    "lunch": "Information is not provided",
    "credit_card": "VISA,MasterCard,UC,DC,UFJ,ダイナースクラブ,アメリカン・エキスプレス,JCB,NICOS,MUFG",
    "e_money": "Information is not provided",
    "flags": {
        "mobile_site": 1,
        "mobile_coupon": 1,
        "pc_coupon": 1
    }
},
  ]);

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
  res.json([{
    "@attributes": {
        "order": 95
    },
    "id": "ga4h006",
    "update_date": "2020-08-23T00:52:53+09:00",
    "name": "茶鍋カフェ kagurazaka saryo 池袋サンシャインシティー店",
    "name_kana": "チャナベカフェ カグラザカサリョウイケブクロサンシャインシティーテン",
    "latitude": "35.729156",
    "longitude": "139.719003",
    "category": "新スタイル茶鍋カフェ",
    "url": "https://r.gnavi.co.jp/ga4h006/?ak=9b9qOa6Vs33uQ8KhMyrABLuHYAegxPxVl5x9wObFwQ0%3D",
    "url_mobile": "http://mobile.gnavi.co.jp/shop/ga4h006/?ak=9b9qOa6Vs33uQ8KhMyrABLuHYAegxPxVl5x9wObFwQ0%3D",
    "coupon_url": {
        "pc": "",
        "mobile": ""
    },
    "image_url": {
        "shop_image1": "https://rimage.gnst.jp/rest/img/myw5s1u90000/s_0n5k.jpg?t=1526896184",
        "shop_image2": "https://rimage.gnst.jp/rest/img/myw5s1u90000/t_0035.jpg",
        "qrcode": "https://c-r.gnst.jp/tool/qr/?id=ga4h006&q=6"
    },
    "address": "〒170-0013 東京都豊島区東池袋3-1 サンシャインシティ アルパ1F",
    "tel": "03-3986-0063",
    "tel_sub": "",
    "fax": "",
    "opentime": "月～日 10:00～21:00(L.O.20:30)",
    "holiday": "不定休日あり\n※施設に準ずる",
    "access": {
        "line": "ＪＲ",
        "station": "池袋駅",
        "station_exit": "東口",
        "walk": "5",
        "note": ""
    },
    "parking_lots": "",
    "pr": {
        "pr_short": "2018年3月21日リニューアルオープン!! 旬の素材、味、出来立てにこだわった一人鍋。！",
        "pr_long": "ゆったりとした空間とココロと身体にやさしい食事・スイーツをコンセプトとする\n『神楽坂 茶寮』が提案する新しい食事スタイルの茶鍋。\n旬の素材、味、出来立てにこだわった一人鍋。\n皆様のご来店をスタッフ一同心よりお待ちしております！"
    },
    "code": {
        "areacode": "AREA110",
        "areaname": "関東",
        "prefcode": "PREF13",
        "prefname": "東京都",
        "areacode_s": "AREAS2156",
        "areaname_s": "池袋東口・東池袋",
        "category_code_l": [
            "RSFST18000",
            "RSFST04000"
        ],
        "category_name_l": [
            "カフェ・スイーツ",
            "鍋"
        ],
        "category_code_s": [
            "RSFST18001",
            "RSFST04001"
        ],
        "category_name_s": [
            "カフェ",
            "鍋料理"
        ]
    },
    "budget": 900,
    "party": "Information is not provided",
    "lunch": 900,
    "credit_card": "Information is not provided",
    "e_money": "Information is not provided",
    "flags": {
        "mobile_site": 1,
        "mobile_coupon": 0,
        "pc_coupon": 0
    }
},
{
    "@attributes": {
        "order": 36
    },
    "id": "gf8k203",
    "update_date": "2020-09-01T02:26:11+09:00",
    "name": "地鶏酒房 とり藤 京橋駅前店",
    "name_kana": "ジドリシュボウトリフジ キョウバシエキマエテン",
    "latitude": "35.676145",
    "longitude": "139.770463",
    "category": "東京駅/京橋駅 居酒屋",
    "url": "https://r.gnavi.co.jp/kksnrdpa0000/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
    "url_mobile": "http://mobile.gnavi.co.jp/shop/gf8k203/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
    "coupon_url": {
        "pc": "https://r.gnavi.co.jp/kksnrdpa0000/coupon/",
        "mobile": "http://mobile.gnavi.co.jp/shop/gf8k203/coupon"
    },
    "image_url": {
        "shop_image1": "https://rimage.gnst.jp/rest/img/kksnrdpa0000/t_0n5f.jpg",
        "shop_image2": "https://rimage.gnst.jp/rest/img/kksnrdpa0000/t_0n5g.jpg",
        "qrcode": "https://c-r.gnst.jp/tool/qr/?id=gf8k203&q=6"
    },
    "address": "〒104-0031 東京都中央区京橋2-5-17 京橋SKビルB2",
    "tel": "050-3460-7113",
    "tel_sub": "03-6271-0803",
    "fax": "03-5937-5147",
    "opentime": "月～金 ディナー：16:00～23:00(L.O.22:15、ドリンクL.O.23:15)",
    "holiday": "毎週土・日曜日 祝日\n※※ビル休館日に準ずる",
    "access": {
        "line": "地下鉄銀座線",
        "station": "京橋駅",
        "station_exit": "4番出口",
        "walk": "1",
        "note": ""
    },
    "parking_lots": "",
    "pr": {
        "pr_short": "■京橋駅徒歩０分■ 当店では店内衛生として、営業中において窓や換気扇での室内の換気やソーシャルディスタンス確保などを行い、お客様の安全対策を徹底して営業中！！",
        "pr_long": "■東京駅/京橋駅すぐの好立地にNEW OPEN■\n【創作鶏料理 鶏居酒屋】\n当店自慢の創作鶏料理の数々を是非\n和の情緒が溢れる本格和個室空間で鶏尽くしのおもてなし♪\n\n接待にも使用可能な本格和個室全席完備！\n団体様も個室にご案内致します。\n■地鶏堪能プラン■\n・飲み放題付 料理5品3480円\n・飲み放題付 料理6品3980円\n・飲み放題付 料理9品5480円\n■隠れ家的和風空間でゆったりご宴会♪\nお勤め先でのご宴会やプライベートなご宴会にご利用ください。\n特別な接待や歓送迎会、二次会にも！\nお気軽にご相談・お問い合わせを♪\n\n■店内空間にもこだわり、普段は味わえないひと時を心ゆくまでお楽しみください。"
    },
    "code": {
        "areacode": "AREA110",
        "areaname": "関東",
        "prefcode": "PREF13",
        "prefname": "東京都",
        "areacode_s": "AREAS2144",
        "areaname_s": "京橋",
        "category_code_l": [
            "RSFST09000",
            ""
        ],
        "category_name_l": [
            "居酒屋",
            ""
        ],
        "category_code_s": [
            "RSFST09004",
            ""
        ],
        "category_name_s": [
            "居酒屋",
            ""
        ]
    },
    "budget": 3500,
    "party": 3500,
    "lunch": "Information is not provided",
    "credit_card": "VISA,MasterCard,ダイナースクラブ,アメリカン・エキスプレス,JCB",
    "e_money": "Information is not provided",
    "flags": {
        "mobile_site": 1,
        "mobile_coupon": 1,
        "pc_coupon": 1
    }
  },
  {
    "@attributes": {
        "order": 35
    },
    "id": "gb14201",
    "update_date": "2020-08-28T18:30:56+09:00",
    "name": "churrascaria Que bom！ 新虎通りCORE店",
    "name_kana": "シュハスカリアキボン シントラドオリコアテン",
    "latitude": "35.665276",
    "longitude": "139.753810",
    "category": "ブラジル料理の食べ放題",
    "url": "https://r.gnavi.co.jp/14ez962b0000/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
    "url_mobile": "http://mobile.gnavi.co.jp/shop/gb14201/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
    "coupon_url": {
        "pc": "",
        "mobile": ""
    },
    "image_url": {
        "shop_image1": "https://rimage.gnst.jp/rest/img/14ez962b0000/t_0n5h.jpg",
        "shop_image2": "https://rimage.gnst.jp/rest/img/14ez962b0000/t_0n5e.jpg",
        "qrcode": "https://c-r.gnst.jp/tool/qr/?id=gb14201&q=6"
    },
    "address": "〒105-0004 東京都港区新橋4-1-1 新虎通りCORE2F",
    "tel": "050-3461-2192",
    "tel_sub": "03-6402-5685",
    "fax": "",
    "opentime": "月～金 ランチ：11:30～15:00(L.O.14:30)\n土・日・祝 ディナー：17:00～22:00(L.O.21:00、ドリンクL.O.21:00)(当面の間、土日祝の営業はお休みとさせていただきます。)、ランチ：11:30～15:00(L.O.14:30)、ディナー：17:00～22:00(L.O.21:00)",
    "holiday": "無",
    "access": {
        "line": "ＪＲ",
        "station": "新橋駅",
        "station_exit": "烏森口",
        "walk": "6",
        "note": ""
    },
    "parking_lots": "",
    "pr": {
        "pr_short": "6月1日より通常営業再開！バイキングは当面中止しますが、新しい提供方法を提案します。",
        "pr_long": "■加熱調理済シュラスコ食材SETのオンライン販売開始\nフライパン1つでキボンの味をご家庭で再現♪この機会にぜひご利用ください！\nこのSETは通常営業再開後、店舗でのテイクアウトも可能の予定です。\n■焼き立てシュラスコ＆本格的ブラジル料理が食べ放題\n男性3,900円／女性3,900円\n■濃度75％以上の消毒用アルコールを設置、ウイルス無害化に効果のある塩化ベンザルコニウムにて店内の清掃を行っております！"
    },
    "code": {
        "areacode": "AREA110",
        "areaname": "関東",
        "prefcode": "PREF13",
        "prefname": "東京都",
        "areacode_s": "AREAS2107",
        "areaname_s": "新橋",
        "category_code_l": [
            "RSFST06000",
            "RSFST15000"
        ],
        "category_name_l": [
            "焼き鳥・肉料理・串料理",
            "アジア・エスニック料理"
        ],
        "category_code_s": [
            "RSFST06009",
            "RSFST15010"
        ],
        "category_name_s": [
            "ステーキ",
            "ブラジル料理・南米料理"
        ]
    },
    "budget": 5000,
    "party": 6000,
    "lunch": 1500,
    "credit_card": "Information is not provided",
    "e_money": "Information is not provided",
    "flags": {
        "mobile_site": 1,
        "mobile_coupon": 0,
        "pc_coupon": 0
    }
  },
  {
    "@attributes": {
        "order": 63
    },
    "id": "a380603",
    "update_date": "2020-08-26T16:30:40+09:00",
    "name": "札幌成吉思汗 「しろくま」 新橋外堀通り店",
    "name_kana": "サッポロジンギスカンシロクマシンバシソトボリドオリテン",
    "latitude": "35.668073",
    "longitude": "139.757162",
    "category": "北海道羊肉ジンギスカン",
    "url": "https://r.gnavi.co.jp/4h3t2m480000/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
    "url_mobile": "http://mobile.gnavi.co.jp/shop/a380603/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
    "coupon_url": {
        "pc": "https://r.gnavi.co.jp/4h3t2m480000/coupon/",
        "mobile": "http://mobile.gnavi.co.jp/shop/a380603/coupon"
    },
    "image_url": {
        "shop_image1": "https://rimage.gnst.jp/rest/img/4h3t2m480000/t_0n5f.jpg",
        "shop_image2": "https://rimage.gnst.jp/rest/img/4h3t2m480000/t_0n5g.jpg",
        "qrcode": "https://c-r.gnst.jp/tool/qr/?id=a380603&q=6"
    },
    "address": "〒105-0004 東京都港区新橋1-15-9 大塚ビル2F",
    "tel": "050-3491-3222",
    "tel_sub": "03-3591-4690",
    "fax": "",
    "opentime": "月～金 17:00～24:00(L.O.23:30)\n土 17:00～23:00(L.O.22:30)",
    "holiday": "毎週日曜日 祝日",
    "access": {
        "line": "地下鉄銀座線",
        "station": "新橋駅",
        "station_exit": "",
        "walk": "1",
        "note": ""
    },
    "parking_lots": "",
    "pr": {
        "pr_short": "【7月13日】しろくま新橋店の2号店がオープン！ 電話・ネット予約受付中！",
        "pr_long": "2005年、札幌に開店し、北海道の羊肉が食べられる\n鮮度にこだわったお店として愛されてきました\n都内のジンギスカン店ではもちろん、北海道内でもなかなか味わえない\n極上の道産羊肉をお楽しみください！\n★カウンターが特徴の当店ですが、ご宴会も可能♪6名様迄のテーブル席も完備★\n◆ 美味しさの秘密 ◆\n【北海道の牧場から直接買い付け】\n正真正銘北海道産！長年の目利きが仕入れた絶品肉をご賞味あれ\n【いちども冷凍していないフレッシュ肉】\n北海道・オーストラリアからチルド状態で空輸 新鮮そのものをご提供\n【切り置き一切無し！】\n注文後に切り出すから、旨みが逃げず新鮮\n【オーストラリア産ラム・マトン、アイスランド産ラムと食べ比べ】\n希少！異なる羊の味わいが堪能できる店\n【こだわりの道産食材】\n玉ねぎ・長ネギ・じゃがいも・米"
    },
    "code": {
        "areacode": "AREA110",
        "areaname": "関東",
        "prefcode": "PREF13",
        "prefname": "東京都",
        "areacode_s": "AREAS2107",
        "areaname_s": "新橋",
        "category_code_l": [
            "RSFST05000",
            "RSFST05000"
        ],
        "category_name_l": [
            "焼肉・ホルモン",
            "焼肉・ホルモン"
        ],
        "category_code_s": [
            "RSFST05003",
            "RSFST05001"
        ],
        "category_name_s": [
            "ジンギスカン",
            "焼肉"
        ]
    },
    "budget": 5000,
    "party": "Information is not provided",
    "lunch": "Information is not provided",
    "credit_card": "VISA,MasterCard,ダイナースクラブ,アメリカン・エキスプレス,JCB",
    "e_money": "Information is not provided",
    "flags": {
        "mobile_site": 1,
        "mobile_coupon": 1,
        "pc_coupon": 1
    }
},
{
    "@attributes": {
        "order": 63
    },
    "id": "a380603",
    "update_date": "2020-08-26T16:30:40+09:00",
    "name": "札幌成吉思汗 「しろくま」 新橋外堀通り店",
    "name_kana": "サッポロジンギスカンシロクマシンバシソトボリドオリテン",
    "latitude": "35.668073",
    "longitude": "139.757162",
    "category": "北海道羊肉ジンギスカン",
    "url": "https://r.gnavi.co.jp/4h3t2m480000/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
    "url_mobile": "http://mobile.gnavi.co.jp/shop/a380603/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
    "coupon_url": {
        "pc": "https://r.gnavi.co.jp/4h3t2m480000/coupon/",
        "mobile": "http://mobile.gnavi.co.jp/shop/a380603/coupon"
    },
    "image_url": {
        "shop_image1": "https://rimage.gnst.jp/rest/img/4h3t2m480000/t_0n5f.jpg",
        "shop_image2": "https://rimage.gnst.jp/rest/img/4h3t2m480000/t_0n5g.jpg",
        "qrcode": "https://c-r.gnst.jp/tool/qr/?id=a380603&q=6"
    },
    "address": "〒105-0004 東京都港区新橋1-15-9 大塚ビル2F",
    "tel": "050-3491-3222",
    "tel_sub": "03-3591-4690",
    "fax": "",
    "opentime": "月～金 17:00～24:00(L.O.23:30)\n土 17:00～23:00(L.O.22:30)",
    "holiday": "毎週日曜日 祝日",
    "access": {
        "line": "地下鉄銀座線",
        "station": "新橋駅",
        "station_exit": "",
        "walk": "1",
        "note": ""
    },
    "parking_lots": "",
    "pr": {
        "pr_short": "【7月13日】しろくま新橋店の2号店がオープン！ 電話・ネット予約受付中！",
        "pr_long": "2005年、札幌に開店し、北海道の羊肉が食べられる\n鮮度にこだわったお店として愛されてきました\n都内のジンギスカン店ではもちろん、北海道内でもなかなか味わえない\n極上の道産羊肉をお楽しみください！\n★カウンターが特徴の当店ですが、ご宴会も可能♪6名様迄のテーブル席も完備★\n◆ 美味しさの秘密 ◆\n【北海道の牧場から直接買い付け】\n正真正銘北海道産！長年の目利きが仕入れた絶品肉をご賞味あれ\n【いちども冷凍していないフレッシュ肉】\n北海道・オーストラリアからチルド状態で空輸 新鮮そのものをご提供\n【切り置き一切無し！】\n注文後に切り出すから、旨みが逃げず新鮮\n【オーストラリア産ラム・マトン、アイスランド産ラムと食べ比べ】\n希少！異なる羊の味わいが堪能できる店\n【こだわりの道産食材】\n玉ねぎ・長ネギ・じゃがいも・米"
    },
    "code": {
        "areacode": "AREA110",
        "areaname": "関東",
        "prefcode": "PREF13",
        "prefname": "東京都",
        "areacode_s": "AREAS2107",
        "areaname_s": "新橋",
        "category_code_l": [
            "RSFST05000",
            "RSFST05000"
        ],
        "category_name_l": [
            "焼肉・ホルモン",
            "焼肉・ホルモン"
        ],
        "category_code_s": [
            "RSFST05003",
            "RSFST05001"
        ],
        "category_name_s": [
            "ジンギスカン",
            "焼肉"
        ]
    },
    "budget": 5000,
    "party": "Information is not provided",
    "lunch": "Information is not provided",
    "credit_card": "VISA,MasterCard,ダイナースクラブ,アメリカン・エキスプレス,JCB",
    "e_money": "Information is not provided",
    "flags": {
        "mobile_site": 1,
        "mobile_coupon": 1,
        "pc_coupon": 1
    }
},
{
    "@attributes": {
        "order": 50
    },
    "id": "gg6e301",
    "update_date": "2020-09-01T03:11:39+09:00",
    "name": "ヴェネツィア酒場 Ombra",
    "name_kana": "ヴェネツィアサカバオンブラ",
    "latitude": "35.753059",
    "longitude": "139.737131",
    "category": "イタリア料理とワイン",
    "url": "https://r.gnavi.co.jp/na33zkxc0000/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
    "url_mobile": "http://mobile.gnavi.co.jp/shop/gg6e301/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
    "coupon_url": {
        "pc": "https://r.gnavi.co.jp/na33zkxc0000/coupon/",
        "mobile": "http://mobile.gnavi.co.jp/shop/gg6e301/coupon"
    },
    "image_url": {
        "shop_image1": "https://rimage.gnst.jp/rest/img/na33zkxc0000/t_0n6m.jpg",
        "shop_image2": "https://rimage.gnst.jp/rest/img/na33zkxc0000/t_0n64.jpg",
        "qrcode": "https://c-r.gnst.jp/tool/qr/?id=gg6e301&q=6"
    },
    "address": "〒114-0022 東京都北区王子1-2-1",
    "tel": "050-3490-0697",
    "tel_sub": "03-5980-7272",
    "fax": "",
    "opentime": "月～金 ランチ：12:00～14:00\n月～木・日・祝日 12:00～24:00(L.O.23:30)\n金・土・祝前日 12:00～翌2:00(L.O.1:30)",
    "holiday": "不定休日あり",
    "access": {
        "line": "ＪＲ京浜東北線",
        "station": "王子駅",
        "station_exit": "",
        "walk": "1",
        "note": ""
    },
    "parking_lots": "",
    "pr": {
        "pr_short": "イタリア産直素材で仕立てるヴェネツィア料理で乾杯♪ 稀少な現地直送生ハムや肉料理を堪能！飲み放題付コース3,900円〜 各種パーティーに◎B1フロア貸切20名様までOK",
        "pr_long": "小皿料理チケッティやイタリア料理を味わうヴェネツィア居酒屋“バーカロ”スタイル\n店名“Ombra”を意味するワインとともに、素敵な美食の夜をお過ごしください\n■現地直送生ハムや肉料理を堪能！飲み放題付コース\n・パスタからデザートまで内容充実の料理が自慢「イタリアン女子会コース」3,900円\n・本場の伝統料理を存分に味わう豪華プラン「贅沢北イタリアコース」5,500円\nその他、コース＆ランチコース有り\n■本場で修行したシェフが織りなす絶品料理\nカッペレッティ、ヴェネトラザーニャなど自家製もちもちパスタ\nイタリア産チーズ＆生ハム、小皿料理などお酒と相性抜群メニュー\n\n■店主厳選ヴェネト州ワイン\n飲み会で人気！イタリア直送樽生ワイン\n多彩な赤・白・スパークリングワイン\n\n■バーカロをイメージした店内\n各種宴会に◎B1フロア貸切12〜20名様"
    },
    "code": {
        "areacode": "AREA110",
        "areaname": "関東",
        "prefcode": "PREF13",
        "prefname": "東京都",
        "areacode_s": "AREAS2249",
        "areaname_s": "王子",
        "category_code_l": [
            "RSFST11000",
            "RSFST11000"
        ],
        "category_name_l": [
            "イタリアン・フレンチ",
            "イタリアン・フレンチ"
        ],
        "category_code_s": [
            "RSFST11002",
            "RSFST11005"
        ],
        "category_name_s": [
            "イタリアン(イタリア料理)",
            "ビストロ"
        ]
    },
    "budget": 3000,
    "party": 4500,
    "lunch": 1000,
    "credit_card": "VISA,MasterCard,ダイナースクラブ,アメリカン・エキスプレス,JCB,Discover Card",
    "e_money": "PayPay",
    "flags": {
        "mobile_site": 1,
        "mobile_coupon": 1,
        "pc_coupon": 1
    }
},
{
    "@attributes": {
        "order": 47
    },
    "id": "gacb237",
    "update_date": "2020-09-01T07:53:04+09:00",
    "name": "地鶏 個室居酒屋 鶏っく 上野店",
    "name_kana": "ジドリコシツイザカヤトリック ウエノテン",
    "latitude": "35.712612",
    "longitude": "139.777376",
    "category": "日本酒と地鶏を堪能",
    "url": "https://r.gnavi.co.jp/m1sak7tz0000/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
    "url_mobile": "http://mobile.gnavi.co.jp/shop/gacb237/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
    "coupon_url": {
        "pc": "https://r.gnavi.co.jp/m1sak7tz0000/coupon/",
        "mobile": "http://mobile.gnavi.co.jp/shop/gacb237/coupon"
    },
    "image_url": {
        "shop_image1": "https://rimage.gnst.jp/rest/img/m1sak7tz0000/t_0nj0.jpg",
        "shop_image2": "https://rimage.gnst.jp/rest/img/m1sak7tz0000/t_0nif.jpg",
        "qrcode": "https://c-r.gnst.jp/tool/qr/?id=gacb237&q=6"
    },
    "address": "〒110-0005 東京都台東区上野7-2-4 6F",
    "tel": "050-3373-0715",
    "tel_sub": "03-5830-3292",
    "fax": "",
    "opentime": " 17:00～24:00",
    "holiday": "年中無休",
    "access": {
        "line": "ＪＲ",
        "station": "上野駅",
        "station_exit": "",
        "walk": "2",
        "note": ""
    },
    "parking_lots": "",
    "pr": {
        "pr_short": "営業再開致しました！！是非お待ちしております！！",
        "pr_long": "炭火で焼き上げた焼き鳥は間違いない旨さ！\n『大山鶏』『総州古白鶏』『美桜鶏』等こだわりの地鶏を使用。\n大人気《日本酒47都道府県全制覇》\n2時間日本酒飲み放題3,500円⇒2,500円\n【個室完備】個室は2～最大16名様迄ご案内OKです♪\nフロア貸切り50名様～承ります！最大100名様迄◎\n………………………………………………\n宴会コース3時間飲み放題付 ※金曜日は2時間制\n■『雫の宴コース』2時間3980円⇒2980円\n■『暁コース』4500円⇒3500円\n■『漁火コース』5000円⇒4000円\n■『節鶏炭コース』5500円⇒4500円\n■『極みコース』6000円⇒5000円\n■『至福コース』7000円⇒6000円\n■2ｈ単品飲み放題は1500円\n■全コース ＋1000円で47都道府県の日本酒も飲み放題に！"
    },
    "code": {
        "areacode": "AREA110",
        "areaname": "関東",
        "prefcode": "PREF13",
        "prefname": "東京都",
        "areacode_s": "AREAS2198",
        "areaname_s": "上野",
        "category_code_l": [
            "RSFST09000",
            "RSFST06000"
        ],
        "category_name_l": [
            "居酒屋",
            "焼き鳥・肉料理・串料理"
        ],
        "category_code_s": [
            "RSFST09004",
            "RSFST06003"
        ],
        "category_name_s": [
            "居酒屋",
            "焼き鳥"
        ]
    },
    "budget": 3000,
    "party": 3000,
    "lunch": "Information is not provided",
    "credit_card": "VISA,MasterCard,UC,DC,UFJ,ダイナースクラブ,アメリカン・エキスプレス,JCB,銀聯,MUFG",
    "e_money": "Information is not provided",
    "flags": {
        "mobile_site": 1,
        "mobile_coupon": 1,
        "pc_coupon": 1
    }
},
{
    "@attributes": {
        "order": 31
    },
    "id": "gdf5819",
    "update_date": "2020-09-01T01:45:14+09:00",
    "name": "隠れ家個室居酒屋 囲邸 恵比寿店",
    "name_kana": "カクレガコシツイザカヤ カコイテイエビステン",
    "latitude": "35.647866",
    "longitude": "139.708907",
    "category": "恵比寿の完全個室居酒屋",
    "url": "https://r.gnavi.co.jp/317z0pu70000/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
    "url_mobile": "http://mobile.gnavi.co.jp/shop/gdf5819/?ak=tefE1OrJzI%2FSWM3iKvQEgDLfxQeWwD5F8eSl2R1myjE%3D",
    "coupon_url": {
        "pc": "https://r.gnavi.co.jp/317z0pu70000/coupon/",
        "mobile": "http://mobile.gnavi.co.jp/shop/gdf5819/coupon"
    },
    "image_url": {
        "shop_image1": "https://rimage.gnst.jp/rest/img/317z0pu70000/t_0n5c.jpg",
        "shop_image2": "https://rimage.gnst.jp/rest/img/317z0pu70000/t_0n5d.jpg",
        "qrcode": "https://c-r.gnst.jp/tool/qr/?id=gdf5819&q=6"
    },
    "address": "〒150-0021 東京都渋谷区恵比寿西1-7-4 Mビル恵比寿1 4F",
    "tel": "050-3464-9423",
    "tel_sub": "045-550-5107",
    "fax": "",
    "opentime": " ランチ・ディナー：12:00～24:00(L.O.23:00、ドリンクL.O.23:30)(定休日 年中無休 ※ランチタイム不定休の為、事前確認必須※  営業時間 【ランチ】12:00～16:00【ディナー】16:00～24:00 )",
    "holiday": "年中無休",
    "access": {
        "line": "ＪＲ",
        "station": "恵比寿駅",
        "station_exit": "西口",
        "walk": "1",
        "note": ""
    },
    "parking_lots": "",
    "pr": {
        "pr_short": "【夏宴会おすすめのコースを用意しております！】 恵比寿駅1分！完全個室×肉と魚 最大3時飲み放題付コース4,000円～ 少人数宴会に◎2名様～個室有 貸切最大70名様迄OK",
        "pr_long": "恵比寿駅徒歩1分!!全席扉付き完全個室『隠れ家個室居酒屋 囲邸 恵比寿店』\n\n◆大人の雰囲気の和個室\n落ち着いた個室は2名様～OK!大人数の宴会には貸切100名様迄\n飲み会や女子会、合コン、デートなどの各種宴会に◎\n\n◆コスパ恵比寿No.1♪ 最大3H飲み放題付コース\n・カルパッチョや大山どりの柚子胡椒焼き等『風コース』4500円→3500円\n・話題のチーズタッカルビが楽しめる『花コース』5000円→4000円\n・お刺身3点盛り合わせや穴子と旬野菜の天麩羅『雪コース』5500円→4500円\n※+1,000円で獺祭や黒龍を含む日本酒飲み放題に♪\n\n◆幹事無料や誕生日・記念日にサプライズなどお得なクーポン多数"
    },
    "code": {
        "areacode": "AREA110",
        "areaname": "関東",
        "prefcode": "PREF13",
        "prefname": "東京都",
        "areacode_s": "AREAS2262",
        "areaname_s": "恵比寿（中目黒・代官山方面）",
        "category_code_l": [
            "RSFST09000",
            ""
        ],
        "category_name_l": [
            "居酒屋",
            ""
        ],
        "category_code_s": [
            "RSFST09004",
            ""
        ],
        "category_name_s": [
            "居酒屋",
            ""
        ]
    },
    "budget": 3500,
    "party": 3500,
    "lunch": 3500,
    "credit_card": "Information is not provided",
    "e_money": "Information is not provided",
    "flags": {
        "mobile_site": 1,
        "mobile_coupon": 1,
        "pc_coupon": 1
    }
  },
])
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
