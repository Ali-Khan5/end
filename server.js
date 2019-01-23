// const express = require('express');
// const app = express();
// const port = process.env.PORT || 5000;
// app.get('/api/hello', (req, res) => {
//   res.send({ express: 'Hello From Express bitches XD' });
//   console.log('i am runing the server lol from a folder before')
//   console.log("heuheuhuhehue")
// });
// app.listen(port, () => console.log(`Listening on port ${port}`));

const request = require("request");
const cheerio = require("cheerio");
var rp = require("request-promise");
const Nightmare = require("nightmare");
// const nightmare = Nightmare({ show: true });
//

var jquery = require("jquery");
//
const express = require("express");
const bodyParser = require("body-parser");
// create express app
const app = express();
//for our photo upload
const multer = require("multer");
// parse requests of content-type - application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: true }));

// parse requests of content-type - application/json
app.use(bodyParser.json());
//
app.use("/uploads", express.static("uploads"));
app.use(express.static(__dirname + "/public"));
// Configuring the database
const dbConfig = require("./config/database.config");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose
  .connect(
    dbConfig.url,
    { useNewUrlParser: true }
  )
  .then(() => {
    console.log("Successfully connected to the database");
  })
  .catch(err => {
    console.log("Could not connect to the database. Exiting now...");
    // process.exit();
  });

// define a simple route
app.get("/", (req, res) => {
  res.json({ message: "Welcome to Article application." });
});
//linkdin
app.get("/fiind/:name", async (req, res) => {
  //  request(`https://www.linkedin.com/pub/dir/humera/farooq`,

  let a = await getResult(req.params.name);
  res.send(a);
});
let fbdata = "";
const GetFbData = async name => {
  try {
    const nightmare = Nightmare({ show: true });
    let fbDATA = await nightmare
      .goto(`https://en-gb.facebook.com/public/${name}`)
      .scrollTo(1300, 0)
      .wait(2000)
      .wait("._4-u2._58b7._4-u8")
      .evaluate(() => {
        //
        let DATA = [];
        for (
          var i = 0;
          i < document.getElementsByClassName("_4p2o").length;
          i++
        ) {
          DATA.push({
            TITLE: document.getElementsByClassName("_32mo")[i].innerText,
            // Description: document.getElementsByClassName("result__snippet")[i]
            //   .innerText,
            link: document
              .getElementsByClassName("_32mo")
              [i].getAttribute("href"),
            picture: document
              .getElementsByClassName("_1glk _6phc img")
              [i].getAttribute("src"),
            details: document.getElementsByClassName("_pac")[i].innerText
          });
        }
        return DATA;
      });
    await nightmare.end();
    console.log(fbDATA, "188");
    return fbDATA;
  } catch (e) {
    console.error(e);
  }
};

nightmare = Nightmare({
  show: true
});

async function run() {
  let abc = "a";
  try {
    abc = await nightmare
      .goto("https://duckduckgo.com")
      .type("#search_form_input_homepage", "github nightmare")
      .click("#search_button_homepage")
      .wait("#r1-0 a.result__a")
      .evaluate(() => {
        return document.querySelector("#r1-0 a.result__a").href;
      });

    //queue and end the Nightmare instance along with the Electron instance it wraps
    await nightmare.end();
    console.log(abc, "232");
    return abc;
  } catch (e) {
    console.log(e);
  }
}
async function getResult(name) {
  // let res = run();
  let resFb = GetFbData(name);
  let resTwitter = twitterData(name);
  let obj = {};
  // console.log("geee",  res, "fb", await resFb);
  // obj.link = await res;
  obj.fb = await resFb;
  obj.tweet = await resTwitter;
  console.log("obj", obj);
  return obj;
}

const GetWebData = async name => {
  console.log("runing nightmare");
  const nightmare = Nightmare({ show: false });
  try {
    await nightmare
      .goto("https://duckduckgo.com")
      .type("#search_form_input_homepage", `${name}`)
      .click("#search_button_homepage")
      .wait(".results--main")
      .evaluate(() => {
        //
        let DATA = [];
        for (
          var i = 0;
          i < document.getElementsByClassName("result__snippet").length;
          i++
        ) {
          DATA.push({
            TITLE: document.getElementsByClassName("result__title")[i]
              .innerText,
            Description: document.getElementsByClassName("result__snippet")[i]
              .innerText,
            link: document
              .getElementsByClassName("result__url")
              [i].getAttribute("href")
          });
        }
        return DATA;
      })
      .end()
      .then(data => {
        // console.log(data);
        return data;
      });
  } catch (e) {
    console.error(e);
  }
};
//twitter
app.get("/find/:name", (req, res) => {
  console.log("i am runing the server lol from a folder before");
  console.log("heuheuhuhehue");
  // res.json({'message':'hello?!??!?'});

  request(
    `http://gramuser.com/search/${req.params.name}`,
    (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        const cardsData = $("a.timg div");
        // const screenName = $(".ProfileCard-screenname");
        let arr3 = [];
        cardsData.each((i, name) => {
          arr3.push($(name).text());
        });

        const imgs = $("a.timg");
        let arrayOfImages = [];
        imgs.each((i, images) => {
          arrayOfImages.push(
            $(images)
              .find("img")
              .attr("src")
          );
        });
        let count = 0;
        let ResultArray = [];
        arr3.map((x, i) => {
          if (x == "") {
            ResultArray.push({
              username: arr3[i - 3],
              Fullname: arr3[i - 2],
              followers: arr3[i - 1],
              imgLink:arrayOfImages[count]
            });
            count++;
          }
        });
        console.log('res soo far',arrayOfImages)
         res.json(ResultArray);
      }
    }
  );
});
let twitterData = async name => {
  try {
    let value = "1";
    var options = {
      uri: `https://twitter.com/search?f=users&q=${name}`,
      transform: function(body) {
        return cheerio.load(body);
      }
    };
    value = rp(options)
      .then($ => {
        // const $ = cheerio.load(html);
        const cards = $(
          ".fullname.ProfileNameTruncated-link.u-textInheritColor.js-nav"
        );
        const screenName = $(".ProfileCard-screenname");
        let arr3 = [];
        cards.each((i, name) => {
          arr3.push(
            $(name)
              .text()
              .replace(/\s\s+/g, "")
          );
        });
        const DisplayPictures = $(".ProfileCard-avatarLink.js-nav.js-tooltip");
        let arr2 = [];
        DisplayPictures.map((i, pic) => {
          arr2.push(
            $(pic)
              .find("img")
              .attr("src")
          );
        });
        let screenNameArray = [];
        screenName.each((i, name) => {
          screenNameArray.push(
            $(name)
              .text()
              .replace(/\s\s+/g, "")
          );
        });
        let arr = [];
        const Bio = $(".ProfileCard-bio.u-dir");
        //this is what we want
        Bio.each((i, bioo) => {
          arr.push($(bioo).text());
        });

        let FinalArray = [];

        for (let i = 0; i < arr2.length; i++) {
          let tempObj = {
            Fullname: arr3[i],
            screenName: screenNameArray[i],
            Bios: arr[i],
            DisplayPictures: arr2[i]
          };
          FinalArray.push(tempObj);
        }
        // console.log('result 399',result);
        return FinalArray;
      })
      .catch(e => {
        console.log(e);
      });
    return value;
  } catch (e) {
    //ending try bracket
    console.log(e);
  }
  //ending function bracket
};
app.get("/findfb/:name", (req, res) => {
  console.log("i am runing fb before");
  console.log("heuheuhuhehue");
  // res.json({'message':'hello?!??!?'});

  request(
    `https://en-gb.facebook.com/public/zeeshan%20nazar`,
    (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
        const cards = $("._4p2o").html();

        console.log(
          "from names",
          cards,
          "screenNAMES"
          // screenNameArray,
          // "bio",
          // Bio.text(),
          // "DISPLAY",
          // DisplayPictures.html()
        );
        res.json("data sent" + $);
      }
    }
  );
});

//multer stores the pictures first in /upload folder and then sends that url to our DB
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "./uploads/");
  },
  filename: function(req, file, cb) {
    cb(null, new Date().toISOString().replace(/:/g, "-") + file.originalname);
  }
});
// making sure only our mentioned files are uploaded
const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
    npn;
  } else {
    cb(null, false);
  }
};
//what will the maximum filesize of our photos will be
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5
  },
  fileFilter: fileFilter
});
//   const upload=multer({
//       dest:"uploads/"
//   });

//gets our note controller
const notes = require("./app/controllers/note.controller");
//makes a post request
app.post("/notes", upload.single("img"), notes.create);
require("./app/routes/note.routes")(app);

const port = process.env.PORT || 5000;
// listen for requests
app.listen(port, () => console.log(`Listening on port ${port}`));
