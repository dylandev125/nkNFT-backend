const express = require('express');
const fs = require('fs');
const auth = require('../../middleware/auth');
const { docClient, whitelistTable } = require('../../services/dynamo');
const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');

const {
    verifyWhitelist,
    addWhiteList,
    removeWhiteList,
} = require('./merkletree.controller');

const merkleRouter = express.Router();

merkleRouter.post('/verify', auth, async (req, res) => {
    if (req.user.email != 'chen@gmail.com') {
        return res.status(409).json({ error: "Access is denied", status: "failed" });
    }
    try {
        let whiteListArray = [];
        params = {
          TableName: whitelistTable,
        }
        await docClient.scan(params, async (err, data) => {
          for(item of data.Items) {
            whiteListArray.push(item.address);
          }
          const leaves = whiteListArray.map((v) => keccak256(v));
          const tree = new MerkleTree(leaves, keccak256, { sort: true });
          const root = tree.getHexRoot();
          const leaf = keccak256(req.body.address);
          const proof = tree.getHexProof(leaf);
          const verified = tree.verify(proof, leaf, root);

          res.status(200).json({
            status : 'success',
            proof : proof,
            verify : verified
            });
        });


    }
    catch (error) {
        return res.status(409).json({ error: "Something went wrong", status: "failed" });
    }
});

merkleRouter.get('/all', auth, async (req, res) => {
    if (req.user.email != 'chen@gmail.com') {
        return res.status(409).json({ error: "Access is denied", status: "failed" });
    }

    try {
        let wholeList = [];
        params = {
            TableName: whitelistTable,
        }
        await docClient.scan(params, async (err, data) => {
            for (item of data.Items) {
                wholeList.push(item.address);
            }
            res.status(200).json({
                wholeList,
                status: "success"
            });
        });
    }
    catch (error) {
        res.status(409).json({ error: "Something went wrong", status: "failed" });
    }
});

merkleRouter.get('/getroot', auth, async (req, res) => {
    if (req.user.email != 'chen@gmail.com') {
        return res.status(409).json({ error: "Access is denied", status: "failed" });
    }

    let whiteListArray = [];
    let root = "";
    params = {
        TableName: whitelistTable,
    }
    try {
        await docClient.scan(params, async (err, data) => {
            if (err) console.log(err);
            else {
                for (let item of data.Items) {
                    whiteListArray.push(item.address);
                }
                const leaves = whiteListArray.map((v) => keccak256(v));
                const tree = new MerkleTree(leaves, keccak256, { sort: true });
                root = await tree.getHexRoot();
                res.status(200).json({ status: "success", MerkleRoot: root });
            }
        });
    }
    catch (err) {
        res.status(409).json({ error: "Something went wrong", status: "failed" });
    }
});

merkleRouter.post('/addlist', auth, async (req, res) => {
    let root;
    if (req.user.email != 'chen@gmail.com') {
        return res.status(409).json({ error: "Access is denied", status: "failed" });
    }
    try {
        const { whitelist } = req.body;
        if (!whitelist) {
            res.status(409).json({ error: "no list", status: "failed" });
            return;
        }

        params = {
            TableName: whitelistTable,
        };

        let curList = [], dupList = [], addedList = [];
        await docClient.scan(params, async (err, data) => {
            if (err) { console.log(err); }
            else {
                for (let item of data.Items) {
                    curList.push(item.address);
                }
                console.log("Current List:", curList)

                addedList = whitelist.filter((item) => curList.indexOf(item) < 0);
                dupList = whitelist.filter((item) => curList.indexOf(item) > 0);

                await addWhiteList(whitelist);
                const leaves = curList.concat(addedList).map((v) => keccak256(v));
                const tree = new MerkleTree(leaves, keccak256, { sort: true });
                root = await tree.getHexRoot();

                res.status(200).json({
                    status: "success",
                    whitelistedAddress: addedList,
                    duplicatedAddress: dupList,
                    merkleRoot: root
                });
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(409).json({ error: "Something Wrong", status: "failed" });
    }
});

merkleRouter.post('/removelist', auth, async (req, res) => {
    let root, curList = [], notFoundList = [], deletedList = [], newArr = [];

    params = {
        TableName: whitelistTable,
    };
    try {
        const { whitelist } = req.body;
        if (!whitelist) {
            res.status(409).json({ error: "no list", status: "failed" });
            return;
        }
        await docClient.scan(params, async (err, data) => {
            if (err) { console.log(err); }
            else {
                for (let item of data.Items) {
                    curList.push(item.address);
                }
                console.log("Current List:", curList);
                notFoundList = whitelist.filter((item) => curList.indexOf(item) < 0);
                deletedList = whitelist.filter((item) => curList.indexOf(item) >= 0);
                console.log("Deleted Address", deletedList);

                removeWhiteList(whitelist);

                newArr = curList.filter(function (el) {
                    return !deletedList.includes(el);
                });
                console.log("New List:", newArr);

                const leaves = newArr.map((v) => keccak256(v));
                const tree = new MerkleTree(leaves, keccak256, { sort: true });
                root = await tree.getHexRoot();

                res.status(200).json({
                    status: "success",
                    deletedAddress: deletedList,
                    addressNotFound: notFoundList,
                    merkleRoot: root
                });
            }
        });
    }
    catch (error) {
        console.log(error);
        res.status(409).json({ error: "Something Wrong", status: "failed" });
    }
});

module.exports = merkleRouter;