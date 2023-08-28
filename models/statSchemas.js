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
        max: 99999999,
        required: true,
    },
    member: {
        type: mongoose.Types.ObjectId,
        ref: "Member"
    }
}, { toJSON: { virtuals: true} });

// BattleSchema.virtual("previousgoal").get(function() {
//     let returnValue = "No previous goal found.";
//     return BattleModel.findOne({  
//         week: this.week == 1 ? 52 : this.week - 1,
//         year:  this.week == 1 ? this.year - 1 : this.year,
//         member: this.member
//     }).then((lastWeeksBattleScore) => {
//         if (lastWeeksBattleScore) returnValue = lastWeeksBattleScore.score;
//     }).catch(err => console.log(err))
//     .finally(() => returnValue);
// });

BattleSchema.virtual("nextgoal").get(function() {
    return Math.round(this.score * 1.03);
});

const BattleModel = mongoose.model("Battle", BattleSchema);

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
        max: 99999,
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