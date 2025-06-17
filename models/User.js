const mongoose = require('mongoose');
// require() used to import function from other files

// userSchema variable holds the definition of our user data structure
// A Schema defines the structure of the documents that will be stored in your MongoDB
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true, // Validation rule. Every user document must have a username value; it cannot be null or undefined.
    // If you try to save a user without a username, Mongoose will throw a validation error.

    unique: true, // An index option. Ensures that every username in the database is unique.

    trim: true // Schema option that applies to strings. Automatically removes leading and trailing whitespace from the username string before saving it to the database.
    // For example, " user " would become "user"
  },
  password: {
    type: String,
    required: true
  }
});

module.exports = mongoose.model('User', userSchema);