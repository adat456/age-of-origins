var express = require('express');
var router = express.Router();
const AWS = require("aws-sdk");
const multer = require("multer");
const fs = require("fs");
const jwt = require("jsonwebtoken");
const { getYear, getWeek, parseISO, eachDayOfInterval } = require("date-fns");
const mongoose = require("mongoose");
const MemberModel = require("../models/memberSchema");
const { BattleModel, ContributionModel } = require("../models/statSchemas");
const AnnouncementModel = require("../models/announcementSchema");
const ReferenceModel = require("../models/referenceSchema");
const EventModel = require("../models/eventSchema");

// setting up AWS
AWS.config.update({
  // this does not work, even though process.env.BUCKET_REGION === "us-east-2"
  // region: process.env.BUCKET_REGION,
  region: "us-east-2",
  credentials: new AWS.CognitoIdentityCredentials({
    IdentityPoolId: process.env.IDENTITY_POOL_ID
  })
});

const s3 = new AWS.S3({
  apiVersion: "2006-03-01",
  params: { Bucket: process.env.BUCKET_NAME }
});

// still need server-side validation... beyond mongodbs?

async function authenticate(req, res, next) {
  const token = req.cookies.jwt;

  try {
    if (token) {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      if (decodedToken.username === process.env.ADMIN_USERNAME) {
        next();
      } else {
        throw new Error("Token payload does not match.");
      };
    } else {
      throw new Error("No token found.");
    };
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
};

router.post("/log-in", async function(req, res, next) {
  let { username, password } = req.body;
  username = username.toLowerCase().trim();

  try {
    if (username === process.env.ADMIN_USERNAME) {
      if (password === process.env.ADMIN_PASSWORD) {
        const token = await jwt.sign({ username }, process.env.JWT_SECRET, { expiresIn: "86400s" });
        res.status(200).cookie("jwt", token, { maxAge: 86400000 , httpOnly: true }).json("Everything matches!");
      } else {
        throw new Error("Password does not match.");
      };
    } else {
      throw new Error ("Username does not match.")
    };
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };  
});

router.get("/verify-authentication", async function(req, res, next) {
  const token = req.cookies.jwt;

  try {
    if (token) {
      const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
      if (decodedToken.username === process.env.ADMIN_USERNAME) {
        res.status(200).json("Token still valid.");
      } else {
        throw new Error("Token payload does not match.");
      };
    } else {
      throw new Error("No token found.");
    };
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.get("/log-out", async function(req, res, next) {
  try {
    const token = await jwt.sign({ invalidated: process.env.ADMIN_INVALIDATED }, process.env.JWT_SECRET, { expiresIn: "86400s" });
    res.status(200).cookie("jwt", token, { maxAge: 86400000 , httpOnly: true }).json("New (expired) cookie for you!");
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

/// MEMBERS ///
router.get("/fetch-members", async function(req, res, next) {
  try {
    const allMembers = await MemberModel.find({});
    res.status(200).json(allMembers);
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.post("/create-member", authenticate, async function(req, res, next) {
  const { username, firstname } = req.body;

  try {
    await MemberModel.create({ username, firstname });
    res.status(200).json(`Member ${username} created.`);
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

/// STATS ///
router.get("/fetch-all-members-stats/:stat/:year/:week", async function(req, res, next) {
  const { stat, year, week } = req.params;

  try {
    let result;
    if (stat === "battle") result = await BattleModel.find({ year, week }).sort({ score: -1 }).populate("member");
    if (stat === "contribution") result = await ContributionModel.find({ year, week }).sort({ score: -1 }).populate("member");

    res.status(200).json(result);
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.get("/fetch-week-stats/:memberid/:year/:week", async function(req, res, next) {
  let { memberid, year, week } = req.params;

  try {
    const result = {
      battle: 0,
      contribution: 0
    };

    const existingBattleThisWeek = await BattleModel.find({
      year, week, member: new mongoose.Types.ObjectId(memberid)
    });
    if (existingBattleThisWeek.length > 0) {
      result.battle = existingBattleThisWeek[0].score;
    };
    
    const existingContributionThisWeek = await ContributionModel.find({
      year, week, member: new mongoose.Types.ObjectId(memberid)
    });
    if (existingContributionThisWeek.length > 0) {
      result.contribution = existingContributionThisWeek[0].score;
    };

    console.log(result);
    res.status(200).json(result);
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };  
});

router.get("/fetch-past-year-stats/:memberid", async function(req, res, next) {
  let { memberid } = req.params;
  // if the week number is 3, then pull 3, 2, 1 of this year (less than or equal to 3)
  // and 4 onward of the previous year (greater than 3)

  // fills in for weeks with a week year object when there is no data (takes in an array of either battle rankings or contributions that have already been pulled)
  function fillInMissingWeeks(weekNum, year, allStats) {
    if (weekNum !== 52) {
      let filledOutStats = [];
      let weekYears = [];
      // starts with previous year's weeks and continues with this year's weeks up until the current week
      for (let i = weekNum + 1; i <= 52; i++) weekYears.push({ week: i, year: year - 1 });
      for (let i = 1; i <= weekNum; i++) weekYears.push({ week: i, year });
      
      weekYears.forEach(weekYear => {
        const statForThisWeekNum = allStats.find(stat => stat.week === weekYear.week);
        if (statForThisWeekNum) {
          filledOutStats.push(statForThisWeekNum);
        } else {
          filledOutStats.push(weekYear);
        };
      });

      return filledOutStats;
    } else if (weekNum === 52) {
      let filledOutStats = [];
      for (let i = 1; i <= weekNum; i++) {
        const statForThisWeekNum = allStats.find(stat => stat.week === i);
        if (statForThisWeekNum) {
          filledOutStats.push(statForThisWeekNum);
        } else {
          filledOutStats.push({ week: i, year });
        };
      };

      return filledOutStats;
    };
  };

  try {
    const today = new Date();
    const year = getYear(today);
    const week = getWeek(today, { weekStartsOn: 6 });
    console.log(week);

    let battleRankings = [];
    let contributions = [];
    if (week !== 52) {
      const thisYearsBattleStats = await BattleModel.
        find({
          year,
          week: { $lte: week },
          member: memberid
        }).
        sort({ week: 1 }).
        exec();
      const lastYearsBattleStats = await BattleModel.
        find({
          year: year - 1,
          week: { $gt: week },
          member: memberid
        }).
        sort({ week: 1 }).
        exec();
      battleRankings = [...thisYearsBattleStats, ...lastYearsBattleStats];
      battleRankings = fillInMissingWeeks(week, year, battleRankings);

      const thisYearsContributionStats = await ContributionModel.
        find({
          year,
          week: { $lte: week },
          member: memberid
        }).
        sort({ week: 1 }).
        exec();
      const lastYearsContributionStats = await ContributionModel.
        find({
          year: year - 1,
          week: { $gt: week },
          member: memberid
        }).
        sort({ week: 1 }).
        exec();
      contributions = [...thisYearsContributionStats, ...lastYearsContributionStats];
      contributions = fillInMissingWeeks(week, year, contributions);

    } else if (week === 52) {
      battleRankings = await BattleModel.
        find({
          year,
          week: { $lte: week },
          member: memberid
        }).
        sort({ week: 1 }).
        exec();
      battleRankings = fillInMissingWeeks(week, year, battleRankings);

      contributions = await ContributionModel.
        find({
          year,
          week: { $lte: week },
          member: memberid
        }).
        sort({ week: 1 }).
        exec();
      contributions = fillInMissingWeeks(week, year, contributions);
    };

    res.status(200).json({ battleRankings, contributions });
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };  
});

// for both adding and updating stats; will check first if there is an existing stat for that week
router.post("/update-stats", authenticate, async function(req, res, next) {
  const { memberid, battle, contribution, year, week } = req.body;
  
  try {
    if (battle) {
      const existingBattleThisWeek = await BattleModel.find({
        year, week, member: new mongoose.Types.ObjectId(memberid)
      });
      if (existingBattleThisWeek.length === 0) {
        await BattleModel.create({
          year, week, score: battle, member: new mongoose.Types.ObjectId(memberid)
        });
      } else {
        existingBattleThisWeek[0].score = battle;
        await existingBattleThisWeek[0].save();
      };
    };
    
    if (contribution) {
      const existingContributionThisWeek = await ContributionModel.find({
        year, week, member: new mongoose.Types.ObjectId(memberid)
      });
      if (existingContributionThisWeek.length === 0) {
        await ContributionModel.create({
          year, week, score: contribution, member: new mongoose.Types.ObjectId(memberid)
        });
      } else {
        existingContributionThisWeek[0].score = contribution;
        await existingContributionThisWeek[0].save();
      };
    };
    
    res.status(200).json("Stats updated.");
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

/// ANNOUNCEMENTS ///
router.get("/fetch-announcements", async function(req, res, next) {
  try {
    const announcements = await AnnouncementModel.find({}).sort({ postdate: -1 });
    announcements.sort((a, b) => {
      if (!a.pinned && b.pinned) return 1;
      if (a.pinned && !b.pinned) return -1;
      if (a.pinned === b.pinned) return 0;
    });
    res.status(200).json(announcements);
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.post("/add-announcement", authenticate, async function(req, res, next) {
  const { author, title, body, pinned } = req.body;

  try {
    await AnnouncementModel.create({
      author, title, body, pinned,
      postdate: new Date(),
      editdate: undefined,
    });
    res.status(200).json("Announcement created.");
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.patch("/edit-announcement", authenticate, async function(req, res, next) {
  const { announcementid, title, body, pinned } = req.body;

  try {
    const announcement = await AnnouncementModel.findOne({ _id: announcementid });
    if (title) {
      announcement.title = title;
      announcement.editdate = new Date();
    };
    if (body) {
      announcement.body = body;
      announcement.editdate = new Date();
    };
    if (pinned === true || pinned === false) {
      announcement.pinned = pinned;
    };
    announcement.save();

    res.status(200).json("Announcement updated.");
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.delete("/delete-announcement/:announcementid", authenticate, async function(req, res, next) {
  const { announcementid } = req.params;
  console.log(announcementid);
  try {
    await AnnouncementModel.deleteOne({ _id: announcementid });
    res.status(200).json("Announcement deleted.");
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

/// REFERENCE ///
router.get("/fetch-recent-references", async function(req, res, next) {
  try {
    const recentThreeReferences = await ReferenceModel.find().sort({ _id: -1 }).limit(3);
    res.status(200).json(recentThreeReferences);
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.get("/fetch-all-references", async function(req, res, next) {
  try {
    const allReferences = await ReferenceModel.find().sort({ _id: -1 });
    res.status(200).json(allReferences);
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.get("/fetch-existing-tags", async function(req, res, next) {
  try {
    const allReferences = await ReferenceModel.find({ });
    const tagSet = new Set();
    allReferences.forEach(reference => {
      reference.tags.forEach(tag => tagSet.add(tag));
    });
    const tagSetArr = [...tagSet];
    tagSetArr.sort();
    res.status(200).json(tagSetArr);
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.get("/fetch-reference-images/:referenceid", async function(req, res, next) {
  const { referenceid } = req.params;
  const albumPath = referenceid + "/";

  try {
    s3.listObjects({ Prefix: albumPath }, function(err, data) {
      if (err) throw new Error("Unable to view album " + albumPath);

      const href = this.request.httpRequest.endpoint.href;
      const bucketPath = href + process.env.BUCKET_NAME + "/";

      const photos = data.Contents.map(photo => {
        const photoKey = photo.Key;
        const photoPath = bucketPath + encodeURIComponent(photoKey);
        return photoPath;
      });

      res.status(200).json(photos);
    });
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.post("/add-reference", authenticate, multer({ dest: "../image_uploads/" }).array("images"), async function(req, res, next) {
  const { author, title, body, tags } = req.body;
  console.log("files:", req.files);
  
  try {
    // create the reference in mongoose
    const newReference = await ReferenceModel.create({
      author, title, body, tags,
      postdate: new Date(),
      editdate: undefined,
    });

    // create the album using the reference's object ID, which is an alphanumeric string
    const albumName = newReference._id.toString();
    s3.headObject({ Key: albumName }, function(err, data) {
      if (!err) throw new Error("Album already exists.");
      if (err.code !== "NotFound") throw new Error(`There was an error creating the ${albumName} album.`);

      s3.putObject({ Key: albumName }, function(err, data) {
        if (err) throw new Error(`There was an error creating the ${albumName} album.`);
      });
    });

    // if there are one or more files attached, add them to the newly created album
    if (req.files.length > 0) {
      req.files.forEach(file => {
        fs.readFile(`../image_uploads/${file.filename}`, function(err, data) {
          if (err) throw err;

          params = {
            Bucket: process.env.BUCKET_NAME,
            Key: albumName + "/" + file.originalname,
            Body: data,
          };

          s3.putObject(params, function(err, data) {
            if (err) throw err;
            console.log("Successfully uploaded photo.");
          });
        });
      });
    };

    // send successful response
    res.status(200).json(newReference._id);
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.patch("/edit-reference", authenticate, async function(req, res, next) {
  const { referenceid, title, body, tags } = req.body;

  try {
    const existingReference = await ReferenceModel.findOne({ _id: referenceid });

    if (title) existingReference.title = title;
    if (body) existingReference.body = body;
    if (tags) existingReference.tags = tags;

    existingReference.editdate = new Date();
    existingReference.save();
    res.status(200).json("Saved edits to reference post.");
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.delete("/delete-reference/:referenceid", authenticate, async function(req, res, next) {
  const { referenceid } = req.params;
  console.log(referenceid);

  try {
    await ReferenceModel.deleteOne({ _id: referenceid });
    res.status(200).json("Reference deleted.");
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});


/// EVENTS ///
router.get("/fetch-events", async function(req, res, next) {
  try {
    let events = await EventModel.find();
    
    const eventsWithExpRanges = events.map(event => {
      if (event.range) {
        let daysBetweenInclusive = eachDayOfInterval({
          start: parseISO(event.eventdates[0]),
          end: parseISO(event.eventdates[1])
        });
        return {
          ...event.toObject(),
          eventdates: daysBetweenInclusive.map(date => date.toISOString().slice(0, 10))
        };
      } else {
        return event;
      };
    });

    res.status(200).json(eventsWithExpRanges);
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.post("/add-event", authenticate, async function(req, res, next) {
  const { author, title, range, eventdates, body } = req.body;

  try {
    const newEvent = await EventModel.create({ author, title, range, eventdates, body, postdate: new Date() });
    res.status(200).json(newEvent._id);
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.patch("/toggle-event-archival/:eventid", authenticate, async function(req, res, next) {
  const { eventid } = req.params;

  try {
    const matchingEvent = await EventModel.findOne({ _id: eventid });
    matchingEvent.archived = !matchingEvent.archived;
    matchingEvent.save();
    res.status(200).json("Event archival status toggled.");
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.patch("/edit-event", authenticate, async function(req, res, next) {
  const { eventid, title, range, eventdates, body, participation } = req.body;

  try {
    const matchingEvent = await EventModel.findOne({ _id: eventid });
  
    if (title) matchingEvent.title = title; 
    if (eventdates?.length > 0) {
      matchingEvent.range = range;
      matchingEvent.eventdates = eventdates;
    };
    if (body) matchingEvent.body = body;
    if (participation) matchingEvent.participation = participation;

    matchingEvent.editdate = new Date().toISOString().slice(0, 10);
    matchingEvent.markModified("eventdates");
    await matchingEvent.save();
    res.status(200).json("Event saved.");
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.delete("/delete-event/:eventid", authenticate, async function(req, res, next) {
  const { eventid } = req.params;

  try {
    await EventModel.deleteOne({ _id: eventid });
    res.status(200).json("Event deleted.");
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

module.exports = router;
