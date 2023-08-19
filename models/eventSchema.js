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
    eventdates: {
        type: [Date],
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
        type: boolean,
        default: false,
        required: true
    }
});

module.exports = mongoose.model("Event", EventSchema);