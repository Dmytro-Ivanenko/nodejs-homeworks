const { Schema, model } = require('mongoose');
const Joi = require('joi');
const { handleMongooseError } = require('../helpers');

const emailRegexp = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;

const UserSchema = new Schema(
	{
		password: {
			type: String,
			required: [true, 'Set password for user'],
		},
		email: {
			type: String,
			required: [true, 'Email is required'],
			unique: true,
			match: emailRegexp,
		},
		subscription: {
			type: String,
			enum: ['starter', 'pro', 'business'],
			default: 'starter',
		},
		token: String,
	},
	{ versionKey: false, timestamps: true }
);

const registerValidateSchema = Joi.object({
	email: Joi.string().pattern(emailRegexp).required(),
	password: Joi.string().required(),
	subscription: Joi.string().valid('starter', 'pro', 'business'),
});

const loginValidateSchema = Joi.object({
	email: Joi.string().pattern(emailRegexp).required(),
	password: Joi.string().required(),
});

UserSchema.post('save', handleMongooseError);

const User = model('user', UserSchema);

const schemas = {
	registerValidateSchema,
	loginValidateSchema,
};

module.exports = { User, schemas };
