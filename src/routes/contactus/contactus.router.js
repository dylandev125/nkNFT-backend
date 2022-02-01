const express = require('express');

const {
    httpAddNewContactusInfo,
} = require('./contactus.controller');

const registerRouter = express.Router();

registerRouter.post('/', httpAddNewContactusInfo);

module.exports = registerRouter;