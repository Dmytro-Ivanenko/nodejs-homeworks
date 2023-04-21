const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const { HttpError } = require('../helpers');
const { ctrlWrapper } = require('../decorators');
const { User } = require('../models/user');

const { SECRET_KEY } = process.env;

// controllers
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

const login = async (req, res) => {
	const { email, password } = req.body;

	const user = await User.findOne({ email });

	if (!user) {
		throw HttpError(401, 'Email or password is wrong');
	}

	const comparePassword = await bcrypt.compare(password, user.password);

	if (!comparePassword) {
		throw HttpError(401, 'Email or password is wrong');
	}

	const payload = { id: user._id };
	const token = jwt.sign(payload, SECRET_KEY, { expiresIn: '23h' });

	res.json({
		token,
		user: {
			email: user.email,
			subscription: user.subscription,
		},
	});
};
module.exports = {
	register: ctrlWrapper(register),
	login: ctrlWrapper(login),
};
