const mongoose = require("mongoose");

const uptimeRecordSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  projectId: mongoose.Schema.Types.ObjectId,
  website: String,
  isUp: Boolean,
  responseTime: Number,
  timestamp: Date,
});
const UptimeRecord = mongoose.model(
  "uptimerecords",
  uptimeRecordSchema,
  "uptimerecords"
);

module.exports = UptimeRecord;
