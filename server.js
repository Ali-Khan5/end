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
app.get("/fiind/:name", (req, res) => {
  //  request(`https://duckduckgo.com/?q=sibtain+saleem&ia=web`,
  //  (error, response, html)=>{
  //   if (!error && response.statusCode == 200){
  //     const $ = cheerio.load(html);
  //         const basic = $("#links.results.js-results");
  //         console.log('linkdein data',basic.text());
  //         res.json({'data':'aaa'})
  //   }
  //  })

  //make code like this below
  // const getAddress = async id => {
  //   console.log(`Now checking ${id}`);
  //   const nightmare = new Nightmare({ show: true });
  // // Go to initial start page, navigate to Detail search
  //   try {
  //     await nightmare
  //       .goto(START)
  //       .wait('.bodylinkcopy:first-child')
  //       .click('.bodylinkcopy:first-child');
  //   } catch(e) {
  //     console.error(e);
  //   }
  // }
// important 
  // return [...document.querySelectorAll('.w80p')]
  //       .map(el => el.innerText);

  const nightmare = Nightmare({ show: true });
  nightmare
    .goto("https://duckduckgo.com")
    .type("#search_form_input_homepage", `${req.params.name}`)
    .click("#search_button_homepage")
    .wait(".results--main")
    .evaluate(
       () =>{ //
        let DATA=[];
        for(var i=0;i<document.getElementsByClassName("result__snippet").length;i++){
          DATA.push( {
                  TITLE:document.getElementsByClassName("result__title")[i].innerText,
                  Description:document.getElementsByClassName("result__snippet")[i].innerText,
                  link:document.getElementsByClassName("result__url")[i].getAttribute("href")
                });
        }
     return DATA;
    }
    )
    .end()
    .then(data => {
      console.log(data);
      res.send(data);
    })
    .catch(error => {
      console.error("Search failed:", error);
    });
  //`${req.params.name}`
  
});

const GetWebData=async (name)=>{
  console.log('runing nightmare')
  const nightmare = Nightmare({ show: true });
  try {
        await nightmare
        .goto("https://duckduckgo.com")
        .type("#search_form_input_homepage", `${name}`)
        .click("#search_button_homepage")
        .wait(".results--main")
        .evaluate(
           () =>{ //
            let DATA=[];
            for(var i=0;i<document.getElementsByClassName("result__snippet").length;i++){
              DATA.push( {
                      TITLE:document.getElementsByClassName("result__title")[i].innerText,
                      Description:document.getElementsByClassName("result__snippet")[i].innerText,
                      link:document.getElementsByClassName("result__url")[i].getAttribute("href")
                    });
            }
         return DATA;
        }
        )
        .end()
        .then(data => {
          // console.log(data);
          return data;
        })
      } catch(e) {
        console.error(e);
      }
}
//twitter
app.get("/find/:name", (req, res) => {
  console.log("i am runing the server lol from a folder before");
  console.log("heuheuhuhehue");
  // res.json({'message':'hello?!??!?'});

  request(
    `https://twitter.com/search?f=users&q=${req.params.name}`,
    (error, response, html) => {
      if (!error && response.statusCode == 200) {
        const $ = cheerio.load(html);
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
        //know we dont have to separate it ...
        console.log(
          "from line 61 ",
          cards.text(),
          "screenNAMES",
          screenNameArray,
          "bio",
          Bio.text(),
          "DISPLAY",
          DisplayPictures.html()
        );
        res.json({
          Fullname: arr3,
          screenName: screenNameArray,
          Bios: arr,
          DisplayPictures: arr2
        });
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
    cb(null, true);npn
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
