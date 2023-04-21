const jwt = require('jsonwebtoken');
const { HttpError } = require('../helpers');
const { User } = require('../models/user');
require('dotenv').config();

const { SECRET_KEY } = process.env;

const validateToken = async (req, res, next) => {
	const { authorization = '' } = req.headers;
	const [bearer, token] = authorization.split(' ');
	console.log(SECRET_KEY);

	if (bearer !== 'Bearer') {
		next(HttpError(401, 'Not authorized'));
	}

	try {
		const { id } = jwt.verify(token, SECRET_KEY);
		const user = await User.findById(id);

		if (!user) {
			next(HttpError(401, 'Not authorized'));
		}
		req.user = user;
		next();
	} catch (error) {
		console.log(error);
		next(HttpError(401, 'Not authorized'));
	}
};

module.exports = validateToken;
