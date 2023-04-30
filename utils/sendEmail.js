const sgMail = require('@sendgrid/mail');
require('dotenv').config();

const { SENDGRID_API_KEY, SENDGRID_EMAIL_FROM } = process.env;

const sendEmail = async (data) => {
	sgMail.setApiKey(SENDGRID_API_KEY);

	const msg = {
		...data,
		from: SENDGRID_EMAIL_FROM,
	};

	await sgMail.send(msg);
	return true;
};

module.exports = sendEmail;
