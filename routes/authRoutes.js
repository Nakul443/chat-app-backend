// all authentication related endpoints

const express = require('express'); // imports express.js framework
const router = express.Router(); // method provided by Express.js that creates a new router object.
// A router object is a mini-application capable of performing middleware and routing functions.


const { register, login } = require('../controllers/authController');

// router.post() - This method defines a route that handles HTTP POST requests

router.post('/register', register); // When a POST request comes in to /register, this route handler will be triggered.
router.post('/login', login); // '/login': This is the path for the login endpoint.

// register and login are callback functions imported from '../controllers/authController'

module.exports = router; // used to export values from current module to outside