const express = require('express');
const fs = require('fs');
const auth = require('../../middleware/auth');

const {
    verifyWhitelist,
    addWhiteList,
    removeWhiteList,
    getAllList,
    getRoot
} = require('./merkletree.controller');

const merkleRouter = express.Router();

merkleRouter.get('/verify/:address', (req, res) => {

    try {
        let value = verifyWhitelist(req.params.address);
        res.status(200).send({
            ...value,
            success: true,
        });
    }
    catch (error) {
        console.log(error);
    }
});

merkleRouter.get('/all', (req, res) => {

    try {
        let value = getAllList();
        res.status(200).send({
            value
        });
    }
    catch (error) {
        console.log(error);
    }
});

merkleRouter.get('/getroot', (req, res) => {

    try {
        let value = getRoot();
        res.status(200).send({
            value
        });
    }
    catch (error) {
        console.log(error);
    }
});

merkleRouter.post('/addlist', auth, (req, res) => {
    try {
        const { whitelist } = req.body;
        if(!whitelist) {
            res.status(200).send("no list");
            return;
        }
        addWhiteList(whitelist);
        res.status(200).send(req.user);
    }
    catch (error) {
        console.log(error);
    }
});

merkleRouter.post('/removelist', auth, (req, res) => {
    try {
        const { whitelist } = req.body;
        removeWhiteList(whitelist);
        res.status(200).send(req.user);
    }
    catch (error) {
        console.log(error);
    }
});

module.exports = merkleRouter;