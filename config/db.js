// DB connection logic file


// to connect mongoDB

const mongoose = require('mongoose');
// require is a node.js built in function used to import modules
// loads the mongoose npm package which we installed and makes all the functionalities available in current file


require('dotenv').config();
// This imports the dotenv npm package.
// The dotenv package is used to load environment variables from a .env file into process.env.

// .config is a method called on the imported dotenv module.
// When executed, it reads key-value pairs from .env file (which should be in the root of your project) and adds them to process.env

// connectDB is an asynchronous function
// async - asynchronous operations, allows to use await
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log('MongoDB Connected: ${conn.connection.host}');

    // if an error occurs in try, the code directly jumps to catch
  } catch (err) {
    console.error('DB connection error:', err.message);
    process.exit(1); // Stop app if DB fails
  }
};

module.exports = connectDB;
// module.exports is used to export values from the current module so they can be imported and used by other files