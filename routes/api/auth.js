const express = require('express');

const { validateBody } = require('../../utils');
const { schemas } = require('../../models/user.js');
const {
	register,
	login,
	getCurrentUser,
	logout,
	updateSubscription,
} = require('../../controllers/authControllers.js');
const { validateToken } = require('../../utils');

const router = express.Router();

// routes
router.post(
	'/register',
	validateBody(schemas.registerValidateSchema),
	register
);

router.post('/login', validateBody(schemas.loginValidateSchema), login);
router.post('/logout', validateToken, logout);
router.get('/current', validateToken, getCurrentUser);
router.patch(
	'/',
	validateToken,
	validateBody(schemas.subscriptionValidateSchema),
	updateSubscription
);

// export
module.exports = router;
