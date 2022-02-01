const registerDatabase = require('./contactus.mongo');

async function saveContactusInfo(payload) {
    await registerDatabase.create({
        ...payload
    });
}


module.exports = {
    saveContactusInfo
};
