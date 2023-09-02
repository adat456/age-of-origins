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
    category: {
        type: String,
        required: true,
    },
    tags: {
        type: [String],
        trim: true,
        required: true
    }
});
const ReferenceModel = mongoose.model("Reference", ReferenceSchema);
exports.ReferenceModel = ReferenceModel;

const CategorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
});
const CategoryModel = mongoose.model("Category", CategorySchema);
exports.CategoryModel = CategoryModel;