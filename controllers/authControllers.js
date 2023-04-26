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

const { SECRET_KEY } = process.env;
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

	const avatarURL = gravatar.url(email, {
		s: '250',
		d: 'retro',
	});

	const result = await User.create({
		...req.body,
		password: hashPassword,
		avatarURL,
	});

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
	login: ctrlWrapper(login),
	logout: ctrlWrapper(logout),
	getCurrentUser: ctrlWrapper(getCurrentUser),
	updateSubscription: ctrlWrapper(updateSubscription),
	updateAvatar: ctrlWrapper(updateAvatar),
};
