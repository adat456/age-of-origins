const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ImageDescriptionSchema = new Schema({
    reference: {
        type: mongoose.Types.ObjectId,
        ref: "Reference",
        required: true
    },
    image: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
        trim: true
    },
});

module.exports = mongoose.model("ImageDescription", ImageDescriptionSchema);