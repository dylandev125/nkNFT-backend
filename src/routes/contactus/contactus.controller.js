const {
    saveContactusInfo,
} = require('../../models/contactus.model');
const {
    sendEmail
} = require('../../services/mail')

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
    console.log("Saved Contact Us Info!")
    await sendEmail('[WEBSITE] [Contact us] Form Submission', `<p>Hi,</p> </br><p>The following details were submitted in the contact us page on the website.</p></br><div><strong>Name: </strong>${payload.name}</div> <div><strong>Email: </strong>${payload.email}</div> <div><strong>Subject: </strong>${payload.subject}</div> <div><strong>Message: </strong>${payload.message}</div><br><div>Thanks,</div><div>Info Account</div><div><a href="https://nekotopia.co/" target="_blank">nekotopia.co</a></div>`)
    return res.status(201).json(payload);
}


module.exports = {
    httpAddNewContactusInfo,
};