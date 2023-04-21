const express = require('express');

const { validateBody } = require('../../utils');
const { schemas } = require('../../models/user.js');
const { register, login } = require('../../controllers/authControllers.js');

const router = express.Router();

// routes
router.post(
	'/register',
	validateBody(schemas.registerValidateSchema),
	register
);

router.post('/login', validateBody(schemas.loginValidateSchema), login);

// export
module.exports = router;
