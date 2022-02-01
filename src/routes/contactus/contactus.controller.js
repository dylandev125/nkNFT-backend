const {
    saveContactusInfo,
} = require('../../models/contactus.model');

async function httpAddNewContactusInfo(req, res) {
    const payload = req.body;

    if (!payload.email) {
        return res.status(400).json({
            error: 'Please fill email',
        });
    }

    if (!payload.name) {
        return res.status(400).json({
            error: 'Please fill name',
        });
    }

    if (!payload.subject) {
        return res.status(400).json({
            error: 'Please fill subject',
        });
    }

    await saveContactusInfo(payload);
    return res.status(201).json(payload);
}


module.exports = {
    httpAddNewContactusInfo,
};