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

userRouter.get("/checkUsername", async (req, res) => {
    const {username} = req.body
    try{
        params = {
            TableName: table,
            FilterExpression: "username = :t",
            ExpressionAttributeValues: {
                ":t": capitalizeWords(username)
            },
        };
        result = await docClient.scan(params).promise()
        if (result.Count > 0) {
            return res.status(409).send({"status":"failed","error": "Username already exists"});
        }
        return res.status(200).json({"status": "success", "message": "Username available"})
    }catch (err) {
        console.log(err);
    }
})

userRouter.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        if (!(email && password && username)) {
            return res.status(400).json({"status":"failed","error": "Please fill all details"});
        }
        
        if (! /(\w+)(\.|_)?(\w*)@(\w+)(\.(\w+))+/.test(email)) {
            return res.status(400).send({"status":"failed","error": "Provide a valid email"});
        }

        if(! /^([A-z]{3,16})$/.test(username)) {
            return res.status(400).send({"status":"failed","error": "Invalid username. Only letters allowed and must be of length 3-16"});
        }

        var params = {
            TableName: table,
            Key: {
                "email": email,
            }
        };
        var result = await docClient.get(params).promise();
        if(result.Item) {
            return res.status(409).send({"status":"failed","error": "User already exists.Please Login"});
        }
        
        params = {
            TableName: table,
            FilterExpression: "username = :t",
            ExpressionAttributeValues: {
                ":t": capitalizeWords(username)
            },
        };
        result = await docClient.scan(params).promise()
        if (result.Count > 0) {
            return res.status(409).send({"status":"failed","error": "Username Already Exists"});
        }
        const hexId = uuidToHex(uuidv4());
        const hashWord = capitalizeWords(username) + ':neko:' + password;

        encryptedPassword = crypto.createHash('sha256').update(hashWord).digest('hex')

        params = {
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
                    const token = jwt.sign(
                    { user_id: hexId, email },
                    process.env.TOKEN_KEY,
                    {
                        expiresIn: "2h",
                    }
                );
                res.status(200).json({"status":"success","token":token});
            }
        });
    } catch (err) {
        console.log(err);
    }
});

userRouter.post("/login", async (req, res) => {

    try {
        const { email, password } = req.body;

        if (!(email && password)) {
            res.status(400).send({"status":"failed","error":"Please fill all details"});
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
                return res.status(200).json({"status":"success","token":token});
            }
        }
        res.status(400).send({"status":"failed","error":"Invalid Credentials"});
    } catch (err) {
        console.log(err);
    }
});

module.exports = userRouter;
