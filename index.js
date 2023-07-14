const express = require("express");
const { connectDB } = require("./database/Db");
const { startAgenda } = require("./database/Agenda");

const app = express();
app.use(express.json());

connectDB()
  .then(() => {
    app.listen(5600, () => {
      startAgenda();
      console.log("Server is running on port 5600");
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
