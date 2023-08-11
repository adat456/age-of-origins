const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BattleSchema = new Schema({
    year: {
        type: Number, 
        required: true,
    },
    week: {
        type: Number, 
        min: 1,
        max: 52,
        required: true,
    },
    score: {
        type: Number,
        min: 1,
        required: true,
    },
    member: {
        type: mongoose.Types.ObjectId,
        ref: "Member"
    }
});
const BattleModel = mongoose.model("Battle", BattleSchema);

BattleSchema.virtual("goal").get(function() {
    return Math.round(this.score * 1.03);
});

BattleSchema.virtual("priorTrend").get(async function() {
    try {
        const lastWeeksBattleScore = await BattleModel.find({  
            week: this.week == 1 ? 52 : this.week - 1,
            year:  this.week == 1 ? this.year - 1 : this.year,
            member: this.member
        }, "score");
        if (lastWeeksBattleScore.length > 0) {
            lastWeeksScore = lastWeeksBattleScore[0].score;
            return {
                lastWeeksScore,
                trend: ((this.score - lastWeeksScore)/lastWeeksScore) * 100
            };
        } else {
            return "No score found from last week.";
        };
    } catch(err) {
        console.error("Unable to perform query for previous week's battle score.");
    };
});

const ContributionSchema = new Schema({
    year: {
        type: Number, 
        required: true,
    },
    week: {
        type: Number, 
        min: 1,
        max: 52,
        required: true,
    },
    score: {
        type: Number,
        min: 1,
        required: true,
    },
    member: {
        type: mongoose.Types.ObjectId,
        ref: "Member"
    }
});
const ContributionModel = mongoose.model("Contribution", ContributionSchema);

exports.BattleModel = BattleModel;
exports.ContributionModel = ContributionModel;