const mongoose = require("mongoose");

const uptimeMoniterSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  projectId: mongoose.Schema.Types.ObjectId,
  domain: { type: String, required: true },
  isMonitering: Boolean,
});
const UptimeModel = mongoose.model(
  "uptimeschemas",
  uptimeMoniterSchema,
  "uptimeschemas"
);

module.exports = UptimeModel;
