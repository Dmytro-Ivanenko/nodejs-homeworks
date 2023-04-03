const express = require('express');
const Joi = require('joi');
const { HttpError } = require('../../helpers');
const {
	listContacts,
	getContactById,
	addContact,
	removeContact,
	updateContact,
} = require('../../models/contacts');

const router = express.Router();

// validation schema
const schema = Joi.object({
	name: Joi.string().required(),
	email: Joi.string().email().required(),
	phone: Joi.string()
		.pattern(/^[0-9]+$/)
		.required(),
});

// controllers
router.get('/', async (req, res, next) => {
	try {
		const result = await listContacts();
		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
});

router.get('/:contactId', async (req, res, next) => {
	try {
		const { contactId } = req.params;

		const result = await getContactById(contactId);

		if (!result) {
			throw HttpError(404, `Contact with id ${contactId} not found.`);
		}

		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
});

router.post('/', async (req, res, next) => {
	try {
		const { error } = schema.validate(req.body);

		if (error) {
			throw HttpError(400, 'missing required name field');
		}

		const result = await addContact(req.body);
		res.status(201).json(result);
	} catch (error) {
		next(error);
	}
});

router.put('/:contactId', async (req, res, next) => {
	try {
		const { error } = schema.validate(req.body);

		if (error) {
			throw HttpError(400, 'missing fields');
		}

		const { contactId } = req.params;
		const result = await updateContact(contactId, req.body);

		if (!result) {
			throw HttpError(404, `Contact with id ${contactId} not found.`);
		}

		res.status(200).json(result);
	} catch (error) {
		next(error);
	}
});

router.delete('/:contactId', async (req, res, next) => {
	try {
		const { contactId } = req.params;

		const result = await removeContact(contactId);

		if (!result) {
			throw HttpError(404, `Contact with id ${contactId} not found.`);
		}

		res.status(200).json({ message: 'Contact deleted' });
	} catch (error) {
		next(error);
	}
});

module.exports = router;
