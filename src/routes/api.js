const express = require('express');

const registerRouter = require('./register/register.router');
const contactusRouter = require('./contactus/contactus.router');

const api = express.Router();

api.use('/register', registerRouter);
api.use('/contactus', contactusRouter);

module.exports = api;