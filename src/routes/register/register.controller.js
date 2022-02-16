const {
    saveRegisteredUser,
} = require('../../models/register.model');
const {
    sendEmail
} = require('../../services/mail')

async function httpAddNewRegisteredUser(req, res) {
    const payload = req.body;

    if (!payload.email) {
        return res.status(400).json({
            error: 'Please fill email',
        });
    }

    await saveRegisteredUser(payload.email);
    await sendEmail('[WEBSITE] [Register] Form Submission', `<p>Hi,</p> </br><p>The following email was registered on the website.</p></br><div><strong>Email: </strong>${payload.email}</div><br><div>Thanks,</div><div>Info Account</div><div><a href="https://nekotopia.co/" target="_blank">nekotopia.co</a></div>`)
    return res.status(201).json(payload);
}


module.exports = {
    httpAddNewRegisteredUser,
};