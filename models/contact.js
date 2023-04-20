const { Schema, model } = require('mongoose');
const Joi = require('joi');
const { handleMongooseError } = require('../helpers');

const ContactSchema = new Schema(
	{
		name: {
			type: String,
			required: [true, 'Set name for contact'],
		},
		email: {
			type: String,
		},
		phone: {
			type: String,
		},
		favorite: {
			type: Boolean,
			default: false,
		},
		owner: {
			type: Schema.Types.ObjectId,
			ref: 'user',
		},
	},
	{ versionKey: false, timestamps: true }
);

const contactValidateSchema = Joi.object({
	name: Joi.string().required(),
	email: Joi.string().email().required(),
	phone: Joi.string()
		.pattern(/^[0-9]+$/)
		.required(),
	favorite: Joi.boolean().required(),
});

const favoriteValidateSchema = Joi.object({
	favorite: Joi.boolean().required(),
});

ContactSchema.post('save', handleMongooseError);

const Contact = model('contact', ContactSchema);

const schemas = {
	contactValidateSchema,
	favoriteValidateSchema,
};

module.exports = { Contact, schemas };
