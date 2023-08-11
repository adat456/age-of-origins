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
    battle: [{ type: mongoose.Types.ObjectId, ref: "Battle"}],
    contributions: [{ type: mongoose.Types.ObjectId, ref: "Contribution" }],
});

module.exports = mongoose.model("Member", MemberSchema)