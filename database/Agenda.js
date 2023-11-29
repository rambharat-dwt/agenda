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
// const DB_URL = `mongodb+srv://scrapy:mod123456!@scrapy.uud98fe.mongodb.net/scrapy-django_11?retryWrites=true&w=majority`;

const processScheduleJob = async (job) => {
  try {
    const convertToMinutes = (timeString) => {
      const [time, period] = timeString.split(" ");
      const [hours, minutes] = time.split(":").map(Number);

      if (period === "AM" && hours === 12) {
   
        return minutes;
      } else if (period === "PM" && hours !== 12) {
        
        return (hours + 12) * 60 + minutes;
      }

     
      return hours * 60 + minutes;
    };

    const users = await SiteAudit.find({ isActive: true });

    const currentTime = new Date().toLocaleTimeString("en-US", {
      hour12: true,
      hour: "2-digit",
      minute: "2-digit",
    });


    const currentTimeInMinutes = convertToMinutes(currentTime);

    const dailyUsers = users.filter((user) => {
      if (user.frequency === "daily") {
        const startTimeInMinutes = convertToMinutes(user.startTime);
        const endTimeInMinutes = convertToMinutes(user.endTime);
        
        if (
          currentTimeInMinutes >= startTimeInMinutes &&
          currentTimeInMinutes <= endTimeInMinutes
        ) {
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
          if (
            error.message === "Your Website Crawlling is already in progress."
          ) {
            console.log("Crawling is already in progress for this user");
          } else {
            console.error("Error executing mutation:", error);
          }
        }
      }
    });
    const weeklyUsers = users.filter((user) => {
      if (user.frequency === "weekly") {
        const startDay = user.startDay?.toLowerCase();

        const currentDate = new Date();

        const currentDay = currentDate.getDay();

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
          const currentTimeInMinutes = convertToMinutes(currentTime);
          const startTimeInMinutes = convertToMinutes(user.startTime);
          const endTimeInMinutes = convertToMinutes(user.endTime);

          // Check if the current time is within the specified time range
          if (
            currentTimeInMinutes >= startTimeInMinutes &&
            currentTimeInMinutes <= endTimeInMinutes
          ) {
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
            if (
              error.message === "Your Website Crawlling is already in progress."
            ) {
              console.log("Crawling is already in progress for this user");
            } else {
              console.error("Error executing mutation:", error);
            }
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
          if (
            error.message === "Your Website Crawlling is already in progress."
          ) {
            console.log("Crawling is already in progress for this user");
          } else {
            console.error("Error executing mutation:", error);
          }
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
          const currentTimeInMinutes = convertToMinutes(currentTime);
          const startTimeInMinutes = convertToMinutes(user.startTime);
          const endTimeInMinutes = convertToMinutes(user.endTime);

          // Check if the current day, month, and time match the user's start day and time
          if (startDay === currentDate.getDate()) {
            // Check if the current time is within the specified time range
            if (
              currentTimeInMinutes >= startTimeInMinutes &&
              currentTimeInMinutes <= endTimeInMinutes
            ) {
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
            if (
              error.message === "Your Website Crawlling is already in progress."
            ) {
              console.log("Crawling is already in progress for this user");
            } else {
              console.error("Error executing mutation:", error);
            }
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
          if (
            error.message === "Your Website Crawlling is already in progress."
          ) {
            console.log("Crawling is already in progress for this user");
          } else {
            console.error("Error executing mutation:", error);
          }
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
    const agenda = new Agenda({ db: { address: process.env.DB_URL } });

    await agenda.start();
    console.log("Agenda job started");

    // Define the "processSchedule" job to run every minute
    agenda.define("processSchedule", processScheduleJob);

    agenda.every("1 minute", "processSchedule");

    // Define the "processSchedule30Minute" job to run every 30 minutes
    agenda.define("processSchedule30Minute", processSchedule30Minute);
    agenda.every("30 minutes", "processSchedule30Minute");

    // Uncomment the line below if you want to run the jobs immediately
    await agenda.now("processSchedule");
    // await agenda.now("processSchedule30Minute");
  } catch (error) {
    console.error("Error starting Agenda job:", error);
  }
};

module.exports = { startAgenda };
