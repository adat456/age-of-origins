var express = require('express');
var router = express.Router();
const { getYear, getWeek } = require("date-fns");
const mongoose = require("mongoose");
const MemberModel = require("../models/memberSchema");
const { BattleModel, ContributionModel } = require("../models/statSchemas");
const AnnouncementModel = require("../models/announcementSchema");
const ReferenceModel = require("../models/referenceSchema");

// still need server-side validation... beyond mongodbs?

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

router.post("/create-member", async function(req, res, next) {
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

  try {

    const today = new Date();
    const year = getYear(today);
    const week = getWeek(today, { weekStartsOn: 6 });

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

    } else if (week === 52) {
      battleRankings = await BattleModel.
        find({
          year,
          week: { $lte: week },
          member: memberid
        }).
        sort({ week: 1 }).
        exec();
      contributions = await ContributionModel.
        find({
          year,
          week: { $lte: week },
          member: memberid
        }).
        sort({ week: 1 }).
        exec();
    };

    res.status(200).json({ battleRankings, contributions });
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };  
});

// for both adding and updating stats; will check first if there is an existing stat for that week
router.post("/update-stats", async function(req, res, next) {
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

router.post("/add-announcement", async function(req, res, next) {
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

router.patch("/edit-announcement", async function(req, res, next) {
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

router.delete("/delete-announcement/:announcementid", async function(req, res, next) {
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
    const allReferences = await ReferenceModel.find();
    res.status(200).json(allReferences);
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.get("/fetch-reference-by-tag", async function(req, res, next) {

});

router.get("/fetch-reference-by-search/:search", async function(req, res, next) {
  let { search } = req.params;
  search = decodeURIComponent(search);

  try {
    
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
    res.status(200).json(tagSetArr);
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.post("/add-reference", async function(req, res, next) {
  const { author, title, body, tags } = req.body;

  try {
    await ReferenceModel.create({
      author, title, body, tags,
      postdate: new Date(),
      editdate: undefined,
    });
    res.status(200).json("Reference post created.");
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.patch("/edit-reference", async function(req, res, next) {
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

module.exports = router;
