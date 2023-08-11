const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AnnouncementSchema = new Schema({
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
    postdate: {
        type: Date,
        required: true
    },
    editdate: {
        type: Date,
        required: true
    },
    body: {
        type: String,
        required: true
    },
    pinned: {
        type: Boolean,
        trim: true,
        required: true
    }
});

module.exports = mongoose.model("Announcement", AnnouncementSchema);
