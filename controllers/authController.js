// authentication logic

const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
// require() imports modules, the string is actually the path


// logic for a new user signing up
exports.register = async (req, res) => {
    // exports allows the 'register' function to be exported
    // other files can use require() to use the register function
  try {
    const { username, password } = req.body;
    // req.body contains data sent from the client
    
    // Check if user exists
    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ msg: 'User already exists' });

    // Hash password
    const salt = await bcrypt.genSalt(10);
    // a salt is random string added to the password before hashing, this makes the hashing unique
    // The argument 10 represents the number of rounds (computational complexity) for salt generation;
    // a higher number means more secure but slower hashing.

    const hashed = await bcrypt.hash(password, salt);

    // Save user if it doesn't exist in the database
    const newUser = new User({ username, password: hashed });
    await newUser.save();
    // Calls the Mongoose save() method on the newUser instance

    res.status(201).json({ msg: 'User registered' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};

exports.login = async (req, res) => {
  try {
    const { username, password } = req.body;
    // Open that req.body box, find the piece of information labeled 'username', and store it in a variable also called username
    // Do the same thing for the piece of information labeled 'password', and store it in a variable called password
    // It's a quick way to unpack specific items from the box without having to say req.body.username and req.body.password separately every time.

    const user = await User.findOne({ username });
    if (!user) return res.status(400).json({ msg: 'Invalid credentials' });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ msg: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '7d'
    });

    res.json({ token });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
};
