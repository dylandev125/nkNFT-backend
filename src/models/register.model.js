const registerDatabase = require('./register.mongo');

async function saveRegisteredUser(email) {
    await registerDatabase.create({
        email: email,
    });
}


module.exports = {
    saveRegisteredUser
};
