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
var Nightmare = require("nightmare");
var nightmare = Nightmare({ show: false });
//

var jquery = require("jquery");
//
const cors = require('cors');
const express = require("express");
const bodyParser = require("body-parser");
// create express app
const app = express();
//for our photo upload
const multer = require("multer");
//for cors and shit
app.use(cors());
// app.options('*', cors());
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
  .connect(dbConfig.url, { useNewUrlParser: true })
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
app.get("/fiind/:name&:workEducation", async (req, res) => {
  //  request(`https://www.linkedin.com/pub/dir/humera/farooq`,

  let a = await getResult(req.params.name, req.params.workEducation);
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
async function getResult(name, workEducation) {
  // let res = run();
  let resFb = GetFbData(name);
  let resTwitter = twitterData(name);
  let resInstagram = InstagramData(name);
  let resLinkedin = GetLinkedinData(name, workEducation);
  let resLinkedinAgain = GetLinkedinDataSecond(name, workEducation);
  let obj = {};
  // console.log("geee",  res, "fb", await resFb);
  // obj.link = await res;
  // obj.insta=await resInstagram;
  obj.fb = await resFb;
  obj.tweet = await resTwitter;
  obj.insta = await resInstagram;
  obj.linkdinsecond = await resLinkedinAgain;
  obj.linkedin = await resLinkedin;
  obj.myLinks = GivesLinkedinLinks(await resLinkedinAgain);
  obj.myLinkstwo = GivesLinkedinLinks(await resLinkedin);
  // console.log("obj", obj);
  let firstName = name.split(" ");
  let lastname = name.split(" ");
  containsTheNameOfThePersonInTheLink(firstName[0], lastname[1], obj.myLinks);
  containsTheNameOfThePersonInTheLink(
    firstName[0],
    lastname[1],
    obj.myLinkstwo
  );
  return obj;
}

const GetWebData = async name => {
  console.log("runing nightmare");
  const nightmare = Nightmare({ show: true });
  try {
    await nightmare
      .goto(
        "https://duckduckgo.com/?q=site%3Alinkedin.com%2Fin+%22eric+bhatti%22+AND+%22gdg+kolachi%22&t=h_&ia=web"
      )
      // .type("#search_form_input_homepage", `${name}`)
      // .click("#search_button_homepage")
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
        console.log(data);
        return data;
      });
  } catch (e) {
    console.error(e);
  }
};
//instagram
let InstagramData = async name => {
  try {
    let value = "1";
    var options = {
      uri: `http://gramuser.com/search/${name}`,
      transform: function(body) {
        return cheerio.load(body);
      }
    };
    value = rp(options)
      .then($ => {
        // const $ = cheerio.load(html);
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
              imgLink: arrayOfImages[count]
            });
            count++;
          }
        });
        console.log("res soo far", arrayOfImages);
        return ResultArray;
      })
      .catch(e => {
        console.log(e);
      });
    return value;
  } catch (e) {
    //ending try bracket
    console.log(e);
  }
};

app.get("/find/:name", (req, res) => {
  console.log("i am runing the server lol from a folder before");
  console.log("heuheuhuhehue");

  console.log("runing nightmare");
  const nightmare = Nightmare({ show: true });
  try {
    nightmare
      .goto("https://pk.linkedin.com/")
      .type(".same-name-search > :nth-child(2)", "humera")
      .type(".same-name-search > :nth-child(3)", "farooq")
      .click(".submit-btn")
      .scrollTo(800, 0)
      .wait(2000)
      .wait(".content")

      .end()
      .then(function(result) {
        console.log(result);
      })
      .catch(function(error) {
        console.error("Error:", error);
      });
  } catch (e) {
    console.error(e);
  }
});

const GetLinkedinData = async (name, place) => {
  try {
    const nightmare = Nightmare({ show: true });
    let LIDATA = await nightmare
      // .goto("https://pk.linkedin.com/")
      // .type(".same-name-search > :nth-child(2)", "humera")
      // .type(".same-name-search > :nth-child(3)", "farooq")
      // .click(".submit-btn")
      // .scrollTo(800, 0)
      // .wait(2000)
      // .wait(".content")
      .goto(
        `https://duckduckgo.com/?q=site%3Alinkedin.com%2Fin+%22${name}%22+AND+%22${place}%22&t=h_&ia=web`
      )
      // .type("#search_form_input_homepage", `${name}`)
      // .click("#search_button_homepage")
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
      });
    await nightmare.end();
    console.log(LIDATA, "188");
    return LIDATA;
  } catch (e) {
    console.error(e);
  }
};
const GetLinkedinDataSecond = async (name, place) => {
  try {
    const nightmare = Nightmare({ show: true });
    let LIDATA = await nightmare
      // .goto("https://pk.linkedin.com/")
      // .type(".same-name-search > :nth-child(2)", "humera")
      // .type(".same-name-search > :nth-child(3)", "farooq")
      // .click(".submit-btn")
      // .scrollTo(800, 0)
      // .wait(2000)
      // .wait(".content")
      .goto(`https://duckduckgo.com/?q="${name}"+"${place}"&t=h_&ia=web`)
      // .type("#search_form_input_homepage", `${name}`)
      // .click("#search_button_homepage")
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
      });
    await nightmare.end();
    console.log(LIDATA, "188");
    return LIDATA;
  } catch (e) {
    console.error(e);
  }
};

function GivesLinkedinLinks(passedArray) {
  let linkedinLink = [];
  if (Array.isArray(passedArray)) {
    passedArray.map((x, i) => {
      console.log("x in loop ", x.link);
      // checks if the link of the site if of linkedin.com/in and if it isnt repeating the same title because of language prefixes..
      if (
        x.link.search("linkedin.com/in/") != -1 &&
        !containsTheSameTitle(x.TITLE, linkedinLink)
      ) {
        linkedinLink.push(x);
      }
    });
  }
  console.log("linkedin links in this search so far :P ", linkedinLink);
  return linkedinLink;
}

function containsTheSameTitle(titleToBeAdded, arrayOfNewLinkedinData) {
  let answer = false;
  if (arrayOfNewLinkedinData.length >= 1) {
    arrayOfNewLinkedinData.map(x => {
      if (x.TITLE == titleToBeAdded) {
        answer = true;
      }
    });
    return answer;
  } else {
    return answer;
  }
}

function containsTheNameOfThePersonInTheLink(
  firstName,
  LastName,
  objectToBeTested
) {
  let nameFirst = new RegExp(firstName, "i"),
    nameLast = new RegExp(LastName, "i");

  objectToBeTested.map(x => {
    if (nameFirst.test(x.TITLE) && nameLast.test(x.TITLE)) {
      x.revelant = "likly";

      console.log("found likely link !, added to array");
    } else if (nameFirst.test(x.TITLE)) {
      x.revelant = "maybe";

      console.log("found maybe link !, added to array");
    } else if (nameLast.test(x.TITLE)) {
      x.revelant = "not likly";

      console.log("found not likely link !, added to array");
    } else {
      x.revelant = "not close";

      console.log("found not close link !, added to array");
    }
  });
}
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
    "https://api.social-searcher.com/v2/search?q=%22maheen%20siddiqui%20bahria%20university%20%22&type=link&network=facebook,&limit=100&key=09ebbbcebeb50ac5d2776448f7204eb3",
    // `https://duckduckgo.com/?q=site%3Alinkedin.com%2Fin+%22eric+bhatti%22+AND+%22gdg+kolachi%22&t=h_&ia=web`,
    (error, response, html) => {
      if (!error && response.statusCode == 200) {
        console.log(response.body);
        res.json("data sent" + response.body);
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

const port = process.env.PORT || 80;
// listen for requests
app.listen(port, () => console.log(`Listening on port ${port}`));
