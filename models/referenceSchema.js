const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReferenceSchema = new Schema({
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
        default: null,
    },
    body: {
        type: String,
        required: true
    },
    tags: {
        type: [String],
        trim: true,
        required: true
    }
});

module.exports = mongoose.model("Reference", ReferenceSchema);