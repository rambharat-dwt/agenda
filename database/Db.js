const mongoose = require("mongoose");

// Function to establish the database connection

const DB_URL = `mongodb+srv://scrapy:mod123456!@scrapy.uud98fe.mongodb.net/scrapy-django_11?retryWrites=true&w=majority`;
const connectDB = async () => {
  try {
    await mongoose.connect(DB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("Connected to MongoDB");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }

  // Retrieve documents from the collection
};

module.exports = { connectDB };
