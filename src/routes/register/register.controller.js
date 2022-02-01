const {
    saveRegisteredUser,
} = require('../../models/register.model');

async function httpAddNewRegisteredUser(req, res) {
    const payload = req.body;

    if (!payload.email) {
        return res.status(400).json({
            error: 'Please fill email',
        });
    }

    await saveRegisteredUser(payload.email);
    return res.status(201).json(payload);
}


module.exports = {
    httpAddNewRegisteredUser,
};