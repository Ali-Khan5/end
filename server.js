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

const cors = require("cors");
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
  res.json({ message: "Welcome to Social Finder application." });
});
//linkdin
app.get("/find/:name&:workEducation", async (req, res) => {
//  gets everything

  let a = await getResult(req.params.name, req.params.workEducation);
  res.send(a);
});
app.get("/instafind/:name", async (req, res) => {
  // gets only instagram data
  let search = { fb: false, insta: true, linkedin: false, twitter: false };
  let a = await getOneResult(req.params.name, "none", search);
  res.send(a);
});
app.get("/twitterfind/:name", async (req, res) => {
  // gets only twitter data
  let search = { fb: false, insta: false, linkedin: false, twitter: true };
  let a = await getOneResult(req.params.name, "none", search);
  res.send(a);
});
app.get("/findfb/:name", async (req, res) => {
  // gets only Fb Data
  let search = { fb: true, insta: false, linkedin: false, twitter: false };
  let a = await getOneResult(req.params.name, "none", search);
  res.send(a);
});
app.get("/findlinkedin/:name&:workEducation", async (req, res) => {
  // gets only linkedin data
  let search = { fb: false, insta: false, linkedin: true, twitter: false };

  let a = await getOneResult(req.params.name, req.params.workEducation, search);
  res.send(a);
});
app.get(
  "/finding/:name&:workEducation/:fb&:twitter&:link&:insta",
  async (req, res) => {
    // gets only 2 or more things

    let a = await getSomeResult(
      req.params.name,
      req.params.workEducation,
      req.params.fb,
      req.params.twitter,
      req.params.link,
      req.params.insta
    );
    res.send(a);
  }
);

let fbdata = "";
const GetFbData = async name => {
  try {
    // opens nightmare
    const nightmare = Nightmare({ show: true });
    let fbDATA = await nightmare
    // await keyword is used to make asynchronous request 
      .goto(`https://en-gb.facebook.com/public/${name}`)
      // goes to the url in the string 
      .scrollTo(1300, 0)
      // scroll down to generate more result 
      .wait(4000)
      // waits 4 sec and then finish operation 
      .evaluate(() => {
        // all the html code of the page is stored here 
        let DATA = [];
        for (var i = 0; i < document.getElementsByClassName("_4p2o").length; i++) {
          DATA.push({
            TITLE: document.getElementsByClassName("_32mo")[i].innerText,
            link: document
              .getElementsByClassName("_32mo")
              [i].getAttribute("href"),
            picture: document
              .getElementsByClassName("_1glk _6phc img")
              [i].getAttribute("src"),
            details: document.getElementsByClassName("_pac")[i].innerText
          });
        }
        // we then, one of one using css classes pick the html elements and extract the text in inside the  tags
        return DATA;
      });
    await nightmare.end();
    // finishes extraction 
    return fbDATA;
    // returns fb payload 
  } catch (e) {
    console.error(e);
  }
};

nightmare = Nightmare({
  show: true
});

async function getResult(name, workEducation, TobeSearched) {
  // let res = run();
  let resFb = GetFbData(name);
  let resTwitter = twitterData(name);
  let resInstagram = InstagramData(name);
  let resLinkedin = GetLinkedinData(name, workEducation);
  let resLinkedinAgain = GetLinkedinDataSecond(name, workEducation);
  let obj = {};
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
async function getOneResult(name, workEducation, TobeSearched) {
  // let res = run();
  // {fb:false,insta:false,linkedin:true,twitter:false};
  let obj = {};
  if (TobeSearched.fb) {
    let resFb = GetFbData(name);
    obj.fb = await resFb;
  } else if (TobeSearched.insta) {
    let resInstagram = InstagramData(name);
    obj.insta = await resInstagram;
  } else if (TobeSearched.linkedin) {
    let resLinkedin = GetLinkedinData(name, workEducation);
    let resLinkedinAgain = GetLinkedinDataSecond(name, workEducation);
    obj.linkdinsecond = await resLinkedinAgain;
    obj.linkedin = await resLinkedin;
    obj.myLinks = GivesLinkedinLinks(await resLinkedinAgain);
    obj.myLinkstwo = GivesLinkedinLinks(await resLinkedin);
    let firstName = name.split(" ");
    let lastname = name.split(" ");
    containsTheNameOfThePersonInTheLink(firstName[0], lastname[1], obj.myLinks);
    containsTheNameOfThePersonInTheLink(
      firstName[0],
      lastname[1],
      obj.myLinkstwo
    );
  } else if (TobeSearched.twitter) {
    let resTwitter = twitterData(name);
    obj.tweet = await resTwitter;
  }

  // console.log("obj", obj);

  return obj;
}
async function getSomeResult(name, workEducation, FB,TW,LI,IG) {
  // TW=twitter,LI=linkedin,IG=instagram
  let obj = {};
  if (FB) {
    let resFb = GetFbData(name);
    obj.fb = await resFb;
  }  if (IG) {
    let resInstagram = InstagramData(name);
    obj.insta = await resInstagram;
  }  if (LI) {
    let resLinkedin = GetLinkedinData(name, workEducation);
    let resLinkedinAgain = GetLinkedinDataSecond(name, workEducation);
    obj.linkdinsecond = await resLinkedinAgain;
    obj.linkedin = await resLinkedin;
    obj.myLinks = GivesLinkedinLinks(await resLinkedinAgain);
    obj.myLinkstwo = GivesLinkedinLinks(await resLinkedin);
    let firstName = name.split(" ");
    let lastname = name.split(" ");
    containsTheNameOfThePersonInTheLink(firstName[0], lastname[1], obj.myLinks);
    containsTheNameOfThePersonInTheLink(
      firstName[0],
      lastname[1],
      obj.myLinkstwo
    );
  }  if (TW) {
    let resTwitter = twitterData(name);
    obj.tweet = await resTwitter;
  }

  // console.log("obj", obj);

  return obj;
}

//instagram
let InstagramData = async name => {
  try {
    let value = "1";
    // goes to the given URL and returns the HTML of that page 
    var options = {
      uri: `http://gramuser.com/search/${name}`,
      transform: function(body) {
        return cheerio.load(body);
      }
    };
    value = rp(options)
      .then($ => {
        // this picks data inside the html element
        const DatafromtheDomTree=$("td div");

        let arrayOfResult= [];
        let optionn=[];
        DatafromtheDomTree.each((i, name) => {
          arrayOfResult.push($(name).text());
          optionn.push($(name).text());
        })
        // const screenName = $(".ProfileCard-screenname");
       
        // iterating all the text into a array of raw results
     

        const imgs = $("a.timg");
        let arrayOfImages = [];
        // iterating all the images into a array of raw results
        imgs.each((i, images) => {
          arrayOfImages.push(
            $(images)
              .find("img")
              .attr("src")
          );
        });
       
     
      // console.log(arrayOfResult);
     
   

      //  arrayOfResult
      for(let i=0;i<arrayOfResult.length;i++){
        if(arrayOfResult[i]=="" || arrayOfResult[i].search("\n") != -1 ){
          arrayOfResult.splice(i,1);

        }
        if( arrayOfResult[i].search("@") != -1 && arrayOfResult[i+1].search("followers") != -1  ){
              arrayOfResult.splice(i+1, 0, "none");
    
            }
      }
      // for(let i=1;i<arrayOfResult.length;i++){
      //   if( arrayOfResult[i].search("followers") != -1 && arrayOfResult[i-1].search("@") != -1 ){
      //     arrayOfResult.splice(i-1, 0, "none");

      //   }
      // }


     
      
        // finallying structuring our two arrays of into one single array of objects
        let ResultArray=[],k=0,l=0;
        for(;k<arrayOfResult.length;)
        {
          ResultArray.push({
            username: arrayOfResult[k],
            Fullname: arrayOfResult[k+1],
            followers: arrayOfResult[k+2],
            imgLink: arrayOfImages[l]
          })
          k=k+3;
          l++;
        }
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
    // goes to the url and fetches the html code of the page
    value = rp(options)
      .then($ => {
    
        const ResultfromDomtree = $(
          ".fullname.ProfileNameTruncated-link.u-textInheritColor.js-nav"
        );
        const screenName = $(".ProfileCard-screenname");
        let ArrayofText = [];
        ResultfromDomtree.each((i, name) => {
          ArrayofText.push(
            $(name)
              .text()
              .replace(/\s\s+/g, "")
          );
        });
        const DisplayPictures = $(".ProfileCard-avatarLink.js-nav.js-tooltip");
        let ArrayofImagesSrc = [];
        DisplayPictures.map((i, pic) => {
          ArrayofImagesSrc.push(
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
        let ArrayOfUserDescription = [];
        const Bio = $(".ProfileCard-bio.u-dir");
        //this is what we want
        Bio.each((i, bioo) => {
          ArrayOfUserDescription.push($(bioo).text());
        });

        let FinalArray = [];

        for (let i = 0; i < ArrayofImagesSrc.length; i++) {
          let tempObj = {
            Fullname: ArrayofText[i],
            screenName: screenNameArray[i],
            Bios: ArrayOfUserDescription[i],
            DisplayPictures: ArrayofImagesSrc[i]
          };
          FinalArray.push(tempObj);
        }
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
