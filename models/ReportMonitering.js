const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    userId: mongoose.Schema.Types.ObjectId,
    projectId: mongoose.Schema.Types.ObjectId,
    website: String,
    frequency: String,
    startTime: String,
    endTime: String,
    sessionId: String,
    reportCreated: {
      type: String,
      default: new Date().toLocaleDateString("en-US", {
        year: "2-digit",
        month: "2-digit",
        day: "2-digit",
      }),
    },
  },
  { timestamps: true }
);
const ReportMonitorModel = mongoose.model("ReportMonitor", reportSchema);

module.exports = ReportMonitorModel;
