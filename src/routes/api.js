const express = require('express');

const registerRouter = require('./register/register.router');
const contactusRouter = require('./contactus/contactus.router');
const MerkleTree = require('./merkletree/merkletree.router');

const api = express.Router();

api.use('/register', registerRouter);
api.use('/contactus', contactusRouter);
api.use('/signature', MerkleTree);

module.exports = api;