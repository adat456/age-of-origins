const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EventSchema = new Schema({
    author: {
        type: mongoose.Types.ObjectId,
        ref: "Member",
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    range: {
        type: Boolean,
        required: true,
    },
    eventdates: {
        type: [String],
        required: true,
    },
    postdate: {
        type: Date,
        required: true
    },
    editdate: {
        type: Date,
        default: null,
    },
    body: {
        type: String,
        required: true
    },
    participation: {
        type: [mongoose.Types.ObjectId],
        default: [],
        required: true
    },
    archived: {
        type: Boolean,
        default: false,
        required: true
    }
}, {
    getters: true
});

module.exports = mongoose.model("Event", EventSchema);