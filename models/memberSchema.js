const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MemberSchema = new Schema({
    username: {
        type: String,
        trim: true,
        unique: [true, "This username already exists."],
        required: true
    },
    firstname: {
        type: String,
        trim: true,
    },
    battlepower: [{ type: mongoose.Types.ObjectId, ref: "BattlePower "}],
    contributions: [{ type: mongoose.Types.ObjectId, ref: "Contributions" }],
});

module.exports = mongoose.model("Member", MemberSchema)