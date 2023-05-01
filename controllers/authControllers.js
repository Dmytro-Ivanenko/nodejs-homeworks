const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const gravatar = require('gravatar');
const fs = require('fs/promises');
const path = require('path');
const { nanoid } = require('nanoid');
const Jimp = require('jimp');

require('dotenv').config();

const { HttpError } = require('../helpers');
const { ctrlWrapper } = require('../decorators');
const { User } = require('../models/user');
const { sendEmail } = require('../utils');

const { SECRET_KEY, BASE_URL } = process.env;
const avatarsDir = path.join(__dirname, '../', 'public', 'avatars');

// CONTROLLERS
// -- singUp
const register = async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (user) {
		throw HttpError(409, 'Email in use');
	}

	const hashPassword = await bcrypt.hash(password, 10);
	const verificationToken = nanoid();

	const avatarURL = gravatar.url(email, {
		s: '250',
		d: 'retro',
	});

	// add new user to base
	const result = await User.create({
		...req.body,
		password: hashPassword,
		avatarURL,
		verificationToken,
	});

	// send verification email
	const verifyEmail = {
		to: email,
		subject: 'Verify email',
		html: `<a target = "_blank" href="${BASE_URL}/api/users/verify/${verificationToken}" >Click to verify your email ${email}</a>`,
	};

	await sendEmail(verifyEmail);

	res.status(201).json({
		user: {
			email: result.email,
			subscription: result.subscription,
		},
	});
};

// -- singIn
const login = async (req, res) => {
	const { email, password } = req.body;
	const user = await User.findOne({ email });

	if (!user) {
		throw HttpError(401, 'Email or password is wrong');
	}

	if (user.verify === false) {
		throw HttpError(401, 'Email not verify');
	}

	// validate password
	const comparePassword = await bcrypt.compare(password, user.password);
	if (!comparePassword) {
		throw HttpError(401, 'Email or password is wrong');
	}

	// create token
	const payload = { id: user._id };
	const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });

	// save token
	await User.findByIdAndUpdate(user._id, { token });

	res.json({
		token,
		user: {
			email: user.email,
			subscription: user.subscription,
		},
	});
};

// -- verify
const verify = async (req, res) => {
	const { verificationToken } = req.params;

	const user = await User.findOne({ verificationToken });

	if (!user) {
		throw HttpError(404, 'User not found');
	}

	await User.findByIdAndUpdate(user._id, {
		verify: true,
		verificationToken: null,
	});

	res.json({
		message: 'Verification successful',
	});
};

// -- resend verify
const resendVerifyEmail = async (req, res) => {
	const { email } = req.body;

	const user = await User.findOne({ email });

	if (!user) {
		throw HttpError(404, 'User not found');
	}

	if (user.verify) {
		throw HttpError(400, 'Verification has already been passed');
	}

	// send verification email
	const verifyEmail = {
		to: email,
		subject: 'Verify email',
		html: `<a target = "_blank" href="${BASE_URL}/api/users/verify/${user.verificationToken}" >Click to verify your email ${email}</a>`,
	};

	await sendEmail(verifyEmail);

	res.json({
		message: 'Verification email sent',
	});
};

// -- signOut
const logout = async (req, res) => {
	const { _id } = req.user;

	await User.findByIdAndUpdate(_id, { token: '' });
	res.status(204);
};

// -- current user
const getCurrentUser = async (req, res) => {
	const { _id: id, email, subscription } = req.user;
	res.json({ id, email, subscription });
};

// -- update subscription
const updateSubscription = async (req, res) => {
	const { subscription } = req.body;
	const { _id, subscription: currentSubscription } = req.user;

	if (subscription === currentSubscription) {
		throw HttpError(400, `${subscription} already applied`);
	}

	await User.findByIdAndUpdate(_id, { subscription });
	res.status(200).json({
		message: 'Subscription updated',
	});
};

// -- update avatar
const updateAvatar = async (req, res) => {
	const { _id } = req.user;
	const { path: tempUpload, filename } = req.file;
	const newFileName = `${nanoid()}_${filename}`;
	const resultUpload = path.join(avatarsDir, newFileName);

	// resize image
	const img = await Jimp.read(tempUpload);
	img.resize(250, 250).write(resultUpload);

	await fs.rename(tempUpload, resultUpload);
	const avatarURL = `/avatars/${newFileName}`;
	await User.findByIdAndUpdate(_id, { avatarURL });

	res.json({
		avatarURL,
	});
};

module.exports = {
	register: ctrlWrapper(register),
	verify: ctrlWrapper(verify),
	resendVerifyEmail: ctrlWrapper(resendVerifyEmail),
	login: ctrlWrapper(login),
	logout: ctrlWrapper(logout),
	getCurrentUser: ctrlWrapper(getCurrentUser),
	updateSubscription: ctrlWrapper(updateSubscription),
	updateAvatar: ctrlWrapper(updateAvatar),
};
