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