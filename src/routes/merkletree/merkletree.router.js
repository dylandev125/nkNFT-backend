const express = require('express');

const {
    verifyWhitelist,
} = require('./merkletree.controller');

const merkleRouter = express.Router();

merkleRouter.get('/:address', (req, res) => {

    try{
        let value = verifyWhitelist(req.params.address);
        res.status(200).send({
            ...value,
            success: true,
        });
    }
    catch(error) {
        console.log(error);
    }
});

module.exports = merkleRouter;