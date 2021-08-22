const mongoose = require("mongoose");
// const validator = require("validator");

const submissionSchema = new mongoose.Schema({
    sid: {
        type: String,
    },
    aid: {
        type: String,
    }
});

const Submission = new mongoose.model('Submission', submissionSchema);

module.exports = Submission;