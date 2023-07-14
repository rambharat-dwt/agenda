const mongoose = require("mongoose");

const siteAuditSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    projectId: mongoose.Schema.Types.ObjectId,
    projectName: String,
    website: String,
    frequency: String,
    startTime: String,
    endTime: String,
    startDay: String,
    sessionId: String,
    isActive: Boolean,
  },
  { timestamps: true }
);
const SiteAudit = mongoose.model("SiteAudit", siteAuditSchema, "SiteAudit");

module.exports = SiteAudit;
