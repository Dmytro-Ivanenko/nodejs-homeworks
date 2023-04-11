const { HttpError } = require('../helpers');
const { ctrlWrapper } = require('../decorators');

const { Contact, schemas } = require('../models/contact');

// controllers
const getContactsList = async (req, res) => {
	const result = await Contact.find();
	res.status(200).json(result);
};

// const getContactByID = async (req, res) => {
// 	const { contactId } = req.params;
// 	const result = await getContactById(contactId);

// 	if (!result) {
// 		throw HttpError(404, `Contact with id ${contactId} not found.`);
// 	}
// 	res.status(200).json(result);
// };

const postContact = async (req, res) => {
	const { error } = schemas.contactValidateSchema.validate(req.body);

	if (error) {
		throw HttpError(400, 'missing required name field');
	}

	const result = await Contact.create(req.body);
	res.status(201).json(result);
};

// const updateContactByID = async (req, res) => {
// 	const { error } = schemas.validate(req.body);

// 	if (error) {
// 		throw HttpError(400, 'missing fields');
// 	}

// 	const { contactId } = req.params;
// 	const result = await updateContact(contactId, req.body);

// 	if (!result) {
// 		throw HttpError(404, `Contact with id ${contactId} not found.`);
// 	}

// 	res.status(200).json(result);
// };

// const deleteContact = async (req, res) => {
// 	const { contactId } = req.params;

// 	const result = await removeContact(contactId);

// 	if (!result) {
// 		throw HttpError(404, `Contact with id ${contactId} not found.`);
// 	}

// 	res.status(200).json({ message: 'Contact deleted' });
// };

module.exports = {
	getContactsList: ctrlWrapper(getContactsList),
	// getContactByID: ctrlWrapper(getContactByID),
	postContact: ctrlWrapper(postContact),
	// updateContactByID: ctrlWrapper(updateContactByID),
	// deleteContact: ctrlWrapper(deleteContact),
};
