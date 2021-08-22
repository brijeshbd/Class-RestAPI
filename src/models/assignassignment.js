const mongoose = require("mongoose");
// const validator = require("validator");

const assignassignmentSchema = new mongoose.Schema({
    sid: {
        type: String,
        required: true
    },
    aid: {
        type: String,
        required: true
    },
    tid: {
        type: String,
        required: true
    },
    status: {
        type: String,
    }
});

const Assignassignment = new mongoose.model('Assignassignment', assignassignmentSchema);

module.exports = Assignassignment;