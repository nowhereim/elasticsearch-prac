var mongoose = require("mongoose");
const { Schema } = mongoose;
const moment = require("moment");
require("moment-timezone");
const now = moment().format("YYYY-MM-DD HH:mm:ss");
const userSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: false,
  },
  createdAt: {
    type: String,
    default: now, // data 생성 당시의 시간
    required: true,
  },
  updatedAt: {
    type: String,
    default: now,
    required: true,
  },
});

module.exports = mongoose.model("Word", userSchema);
