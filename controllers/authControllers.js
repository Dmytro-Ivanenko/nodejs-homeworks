const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const { HttpError } = require('../helpers');
const { ctrlWrapper } = require('../decorators');
const { User } = require('../models/user');

const { SECRET_KEY } = process.env;

// CONTROLLERS
// -- singUp
const register = async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (user) {
		throw HttpError(409, 'Email in use');
	}

	const hashPassword = await bcrypt.hash(password, 10);

	const result = await User.create({ ...req.body, password: hashPassword });

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

module.exports = {
	register: ctrlWrapper(register),
	login: ctrlWrapper(login),
	logout: ctrlWrapper(logout),
	getCurrentUser: ctrlWrapper(getCurrentUser),
	updateSubscription: ctrlWrapper(updateSubscription),
};
