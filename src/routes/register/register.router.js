const express = require('express');

const {
    httpAddNewRegisteredUser,
} = require('./register.controller');

const registerRouter = express.Router();

registerRouter.post('/', httpAddNewRegisteredUser);

module.exports = registerRouter;