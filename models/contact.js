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

ContactSchema.post('save', handleMongooseError);

const Contact = model('contact', ContactSchema);

const schemas = {
	contactValidateSchema,
};

module.exports = { Contact, schemas };
