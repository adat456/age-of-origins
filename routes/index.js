var express = require('express');
var router = express.Router();
const { getYear, getWeek } = require("date-fns");
const mongoose = require("mongoose");
const MemberModel = require("../models/memberSchema");
const { BattleModel, ContributionModel } = require("../models/statSchemas");
const AnnouncementModel = require("../models/announcementSchema");

function generateCurrentYearWeek() {
  const today = new Date();
  const year = getYear(today);
  const week = getWeek(today, { weekStartsOn: 6 });

  return { year, week };
};

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
        sort({ week: -1 }).
        exec();
      const lastYearsBattleStats = await BattleModel.
        find({
          year: year - 1,
          week: { $gt: week },
          member: memberid
        }).
        sort({ week: -1 }).
        exec();
      battleRankings = [...thisYearsBattleStats, ...lastYearsBattleStats];

      const thisYearsContributionStats = await ContributionModel.
        find({
          year,
          week: { $lte: week },
          member: memberid
        }).
        sort({ week: -1 }).
        exec();
      const lastYearsContributionStats = await ContributionModel.
        find({
          year: year - 1,
          week: { $gt: week },
          member: memberid
        }).
        sort({ week: -1 }).
        exec();
      contributions = [...thisYearsContributionStats, ...lastYearsContributionStats];

    } else if (week === 52) {
      battleRankings = await BattleModel.
        find({
          year,
          week: { $lte: week },
          member: memberid
        }).
        sort({ week: -1 }).
        exec();
      contributions = await ContributionModel.
        find({
          year,
          week: { $lte: week },
          member: memberid
        }).
        sort({ week: -1 }).
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

module.exports = router;
