const { Agenda } = require("agenda");
const axios = require("axios");
const SiteAudit = require("../models/SiteAudit");
const UptimeModel = require("../models/uptimeModel");
const UserModel = require("../models/Usermodel");
const { client, CREATE_REPORT } = require("../myscript/Apollo");
const { sendEmail } = require("./nodeMailer");
const { URL } = require("url");
const ReportMonitorModel = require("../models/ReportMonitering");
const UptimeRecord = require("../models/UptimeRecord");
const DB_URL = `mongodb+srv://scrapy:mod123456!@scrapy.uud98fe.mongodb.net/scrapy-django_11?retryWrites=true&w=majority`;

const processScheduleJob = async (job) => {
  try {
    const users = await SiteAudit.find({ isActive: true });

    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });

    const dailyUsers = users.filter((user) => {
      if (user.frequency === "daily") {
        if (currentTime >= user.startTime && currentTime <= user.endTime) {
          return true;
        }
      }
      return false;
    });

    dailyUsers.forEach(async (user) => {
      const { _id, userId, projectId, website, frequency, startTime, endTime } =
        user;
      const url = website;
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname.split(".").slice(-2).join(".");
      const payload = {
        domain,
        projectId,
        authorId: userId,
      };
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const mostRecentReport = await ReportMonitorModel.findOne({}).sort({
        reportCreated: -1,
      });
      console.log("mostRecentReport", mostRecentReport);
      if (mostRecentReport) {
        const reportCreatedDate = mostRecentReport.reportCreated;
        if (reportCreatedDate && reportCreatedDate !== currentDate) {
          try {
            const res = await client.mutate({
              mutation: CREATE_REPORT,
              variables: {
                payload,
              },
            });
            const resultData = res.data.ScrapUrl;
            const report = resultData;
            console.log("report", report);

            const newReport = new ReportMonitorModel({
              userId,
              projectId,
              website,
              frequency,
              startTime,
              endTime,
              reportCreated: currentDate,
              sessionId: report.sessionId,
            });
            await newReport.save();

            console.log(
              "User document updated with session ID:",
              mostRecentReport._id
            );
          } catch (error) {
            console.error("Error executing mutation:", error);
          }
        }
      } else {
        try {
          const res = await client.mutate({
            mutation: CREATE_REPORT,
            variables: {
              payload,
            },
          });
          const resultData = res.data.ScrapUrl;
          const report = resultData;
          console.log("report", report);

          // No document exists, create a new one
          const newReport = new ReportMonitorModel({
            userId,
            projectId,
            website,
            frequency,
            startTime,
            endTime,
            reportCreated: currentDate,
            sessionId: report.sessionId,
          });
          await newReport.save();

          console.log("New report created for user:", userId);
        } catch (error) {
          console.error("Error executing mutation:", error);
        }
      }
    });
    const weeklyUsers = users.filter((user) => {
      if (user.frequency === "weekly") {
        const startDay = user.startDay?.toLowerCase(); // Convert start day to lowercase for case-insensitive comparison

        const currentDate = new Date();

        const currentDay = currentDate.getDay(); // Get the current day of the week (0-6, where 0 is Sunday)

        const startDayIndex = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ].indexOf(startDay);

        // Check if the start day matches the current day of the week
        if (startDayIndex !== -1 && startDayIndex === currentDay) {
          if (currentTime >= user.startTime && currentTime <= user.endTime) {
            return true;
          }
        }
      }

      return false;
    });
    weeklyUsers.forEach(async (user) => {
      const { _id, userId, projectId, website, frequency, startTime, endTime } =
        user;
      const url = website;
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname.split(".").slice(-2).join(".");
      const payload = {
        domain,
        projectId,
        authorId: userId,
      };
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const mostRecentReport = await ReportMonitorModel.findOne({}).sort({
        reportCreated: -1,
      });
      if (mostRecentReport) {
        const reportCreatedDate = mostRecentReport.reportCreated;
        if (reportCreatedDate && reportCreatedDate !== currentDate) {
          try {
            const res = await client.mutate({
              mutation: CREATE_REPORT,
              variables: {
                payload,
              },
            });
            const resultData = res.data.ScrapUrl;
            const report = resultData;

            const newReport = new ReportMonitorModel({
              userId,
              projectId,
              website,
              frequency,
              startTime,
              endTime,
              reportCreated: currentDate,
              sessionId: report.sessionId,
            });
            await newReport.save();

            console.log("User document updated :", mostRecentReport._id);
          } catch (error) {
            console.error("Error executing mutation:", error);
          }
        }
      } else {
        try {
          const res = await client.mutate({
            mutation: CREATE_REPORT,
            variables: {
              payload,
            },
          });
          const resultData = res.data.ScrapUrl;
          const report = resultData;
          console.log("report", report);

          // No document exists, create a new one
          const newReport = new ReportMonitorModel({
            userId,
            projectId,
            website,
            frequency,
            startTime,
            endTime,
            reportCreated: currentDate,
            sessionId: report.sessionId,
          });
          await newReport.save();

          console.log("New report created for user:", userId);
        } catch (error) {
          console.error("Error executing mutation:", error);
        }
      }
    });
    const monthlyUsers = users.filter((user) => {
      if (user.frequency === "monthly") {
        const startDay = parseInt(user.startDay);

        const currentDate = new Date();

        const currentMonth = currentDate.getMonth();
        const currentYear = currentDate.getFullYear();

        const lastDayOfMonth = new Date(
          currentYear,
          currentMonth + 1,
          0
        ).getDate();

        if (startDay <= lastDayOfMonth) {
          // Check if the current day, month, and time match the user's start day and time
          if (startDay === currentDate.getDate()) {
            if (currentTime >= user.startTime && currentTime <= user.endTime) {
              return true;
            }
          }
        }
      }

      return false;
    });
    monthlyUsers.forEach(async (user) => {
      const { _id, userId, projectId, website, frequency, startTime, endTime } =
        user;
      const url = website;
      const parsedUrl = new URL(url);
      const domain = parsedUrl.hostname.split(".").slice(-2).join(".");
      const payload = {
        domain,
        projectId,
        authorId: userId,
      };
      const currentDate = new Date().toLocaleDateString("en-US", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });

      const mostRecentReport = await ReportMonitorModel.findOne({}).sort({
        reportCreated: -1,
      });

      if (mostRecentReport) {
        const reportCreatedDate = mostRecentReport.reportCreated;
        if (reportCreatedDate && reportCreatedDate !== currentDate) {
          try {
            const res = await client.mutate({
              mutation: CREATE_REPORT,
              variables: {
                payload,
              },
            });
            const resultData = res.data.ScrapUrl;
            const report = resultData;

            const newReport = new ReportMonitorModel({
              userId,
              projectId,
              website,
              frequency,
              startTime,
              endTime,
              reportCreated: currentDate,
              sessionId: report.sessionId,
            });
            await newReport.save();

            console.log(
              "User document updated with session ID:",
              mostRecentReport._id
            );
          } catch (error) {
            console.error("Error executing mutation:", error);
          }
        }
      } else {
        try {
          const res = await client.mutate({
            mutation: CREATE_REPORT,
            variables: {
              payload,
            },
          });
          const resultData = res.data.ScrapUrl;
          const report = resultData;

          // No document exists, create a new one
          const newReport = new ReportMonitorModel({
            userId,
            projectId,
            website,
            frequency,
            startTime,
            endTime,
            reportCreated: currentDate,
            sessionId: report.sessionId,
          });
          await newReport.save();

          console.log("New report created for user:", userId);
        } catch (error) {
          console.error("Error executing mutation:", error);
        }
      }
    });
  } catch (error) {
    console.error("Error processing schedule:", error);
  }
};

const processSchedule30Minute = async (job) => {
  try {
    const data = await UptimeModel.find({ isMonitoring: true });
    // console.log("data", data);
    const errorStatuses = [400, 401, 402, 403, 404, 500];

    for (const item of data) {
      const { domain, userId, projectId } = item;
      // console.log("domain", domain);
      try {
        const startTime = new Date();

        const response = await axios.get(`https://${domain}`);

        const endTime = new Date();
        const responseTime = endTime - startTime;
        const { status } = response;
        // console.log("status", status);

        if (!errorStatuses.includes(status)) {
          await UptimeRecord.create({
            userId,
            projectId,
            website: domain,
            isUp: true,
            responseTime,
            timestamp: new Date(),
          });
        }
      } catch (error) {
        console.error("Error fetching website status:", error);

        await UptimeRecord.create({
          userId,
          projectId,
          website: domain,
          isUp: false,
          timestamp: new Date(),
        });

        const user = await UserModel.findOne({ _id: userId });
        if (user) {
          const errorDetails = `Website: ${domain}\nStatus: ${
            error.response ? error.response.status : "Unknown"
          }\n\nAdditional error details...\n`;

          try {
            await sendEmail(user, errorDetails);
          } catch (emailError) {
            console.error("Error sending email:", emailError);
          }
        }
      }
    }
  } catch (error) {
    console.error("Error fetching uptime data:", error);
    try {
      const users = await UserModel.find(); // Fetch all users

      for (const user of users) {
        const errorDetails = `Status: ${
          error.response ? error.response.status : "Unknown"
        }\n\nAdditional error details...\n`;

        try {
          await sendEmail(user, errorDetails);
        } catch (emailError) {
          console.error("Error sending email:", emailError);
        }
      }
    } catch (userFetchError) {
      console.error("Error fetching users:", userFetchError);
    }
  }
};

const startAgenda = async () => {
  try {
    const agenda = new Agenda({ db: { address: DB_URL } });
    await agenda.start();

    console.log("Agenda job started");

    // agenda.define("processSchedule", processScheduleJob);
    // agenda.every("1 minute", "processSchedule");
    agenda.define("processSchedule30Minute", processSchedule30Minute);
    agenda.every("1 minute", "processSchedule30Minute");
    await agenda.now("processSchedule", "processSchedule30Minute");
  } catch (error) {
    console.error("Error starting Agenda job:", error);
  }
};

module.exports = { startAgenda };
