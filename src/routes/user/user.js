const User = require("../../models/user.mongo");
const express = require("express");
const bcrypt = require('bcryptjs');
const uuidToHex = require('uuid-to-hex');
const { v4: uuidv4 } = require('uuid');
const jwt = require('jsonwebtoken');
const { docClient, table, dynamodb } = require('../../services/dynamo');
const crypto = require('crypto');


const userRouter = express.Router();

function capitalizeWords(string) {
    return string.toLowerCase().replace(/(?:^|\s)\S/g, function(a) { return a.toUpperCase(); });
};


userRouter.get("/all", async (req, res) => {
    var params = {
        TableName: table
    };

    docClient.scan(params, (err, data) => {
        if (err) {
            console.log(err);
        } else {
            var items = [];
            for (var i in data.Items)
                items.push(data.Items[i]);

            res.contentType = 'application/json';
            res.send(items);
        }
    });
});

userRouter.post("/register", async (req, res) => {

    try {
        const { username, email, password } = req.body;

        if (!(email && password && username)) {
            return res.status(400).send("All input is required");
        }

        if (! /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
            return res.status(400).send("Email is not valid");
        }

        if(! /^([A-z]{3,16})$/.test(username)) {
            return res.status(400).send("Username is not valid");
        }

        var params = {
            TableName: table,
            Key: {
                "email": email,
            }
        };
        var result = await docClient.get(params).promise();

        if(result.Item) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        var params2 = {
            TableName: table,
            Key: {
                "username": capitalizeWords(username),
            }
        };
        var result2 = await docClient.get(params2).promise();
        if (result2.Item) {
            return res.status(409).send("Username Already Exist.");
        }
        const Id = uuidv4();
        const hexId = uuidToHex(Id);
        const hashWord = capitalizeWords(username) + ':neko:' + password;

        encryptedPassword = crypto.createHash('sha256').update(hashWord).digest('hex')

        var params = {
            TableName: table,
            Item: {
                "userid": hexId,
                "username": capitalizeWords(username),
                "email": email,
                "password": encryptedPassword,
                "highscore": 0
            }
        };

        await docClient.put(params, (err, data) => {
            if (err) {
                console.error("Unable to add item.");
                console.error("Error JSON:", JSON.stringify(err, null, 2));
            } else {
                //console.log("Added item:", JSON.stringify(data, null, 2));
            }
        });

        const token = jwt.sign(
            { user_id: hexId, email },
            process.env.TOKEN_KEY,
            {
                expiresIn: "2h",
            }
        );
        res.status(200).json(token);
    } catch (err) {
        console.log(err);
    }
});

userRouter.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            res.status(400).send("All input is required");
        }

        var params = {
            TableName: table,
            Key: {
                "email": email,
            }
        };
        var result = await docClient.get(params).promise();
        if(result.Item) {
            let hashWord = capitalizeWords(result.Item.username) + ':neko:' + password;
            let hashPassword = crypto.createHash('sha256').update(hashWord).digest('hex')
            if(result.Item.password == hashPassword) {
                const token = jwt.sign(
                    { user_id: result.Item.userid, email },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "2h",
                    }
                );
                return res.status(200).send(token);
            }
        }
        res.status(400).send("Invalid Credentials");
    } catch (err) {
        console.log(err);
    }
});

module.exports = userRouter;
