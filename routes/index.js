var express = require('express');
var router = express.Router();
const { getYear, getWeek } = require("date-fns");
const mongoose = require("mongoose");
const MemberModel = require("../models/memberSchema");
const { BattleModel, ContributionModel } = require("../models/statSchemas");
const AnnouncementModel = require("../models/announcementSchema");

// still need server-side validation... beyond mongodbs?

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

router.post("/update-stats", async function(req, res, next) {
  const { memberid, battle, contribution } = req.body;
  
  try {
    const today = new Date();
    const year = getYear(today);
    const week = getWeek(today, { weekStartsOn: 6 });

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

    res.status(200).json("Battle and contribution stats updated.");
  } catch(err) {
    console.error(err.message);
    res.status(400).json(err.message);
  };
});

router.get("/fetch-this-weeks-stats/:memberid", async function(req, res, next) {
  const { memberid } = req.params;

  try {
    const today = new Date();
    const year = getYear(today);
    const week = getWeek(today, { weekStartsOn: 6 });

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

router.get("/fetch-past-years-stats", async function(req, res, next) {

});

module.exports = router;
