const mongoose = require("mongoose");
// const validator = require("validator");

const assignmentSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
        unique: true
    },
    // students: {
    //     type: [String],
    //     required: true
    // },
    tid: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true,
    },
    publishedat: {
        type: Date,
        required: true
    },
    deadlinedate: {
        type: Date,
        required: true
    },
    status: {
        type: String
    }
});

const Assignment = new mongoose.model('Assignment', assignmentSchema);

module.exports = Assignment;