const { HttpError } = require('../helpers');
const { ctrlWrapper } = require('../decorators');

const { Contact, schemas } = require('../models/contact');

// Controllers

// get
const getContactsList = async (req, res) => {
	const { _id: owner } = req.user;
	const { page = 1, limit = 20, favorite } = req.query;
	const skip = (page - 1) * limit;

	let filter = { owner };

	if (favorite) {
		filter = { ...filter, favorite };
	}

	const result = await Contact.find({ ...filter }, '-updatedAt', {
		skip,
		limit,
	}).populate('owner', 'name email');

	res.status(200).json(result);
};

const getContactByID = async (req, res) => {
	const { contactId } = req.params;
	const result = await Contact.findById(contactId);

	if (!result) {
		throw HttpError(404, `Contact with id ${contactId} not found.`);
	}
	res.status(200).json(result);
};

// post
const postContact = async (req, res) => {
	const { _id: owner } = req.user;
	const { error } = schemas.contactValidateSchema.validate(req.body);

	if (error) {
		throw HttpError(400, 'missing required name field');
	}

	const result = await Contact.create({ ...req.body, owner });
	res.status(201).json(result);
};

// put
const updateContactByID = async (req, res) => {
	const { error } = schemas.contactValidateSchema.validate(req.body);

	if (error) {
		throw HttpError(400, 'missing fields');
	}

	const { contactId } = req.params;
	const result = await Contact.findByIdAndUpdate(contactId, req.body, {
		new: true,
	});

	if (!result) {
		throw HttpError(404, `Contact with id ${contactId} not found.`);
	}

	res.status(200).json(result);
};

// patch
const updateFavorite = async (req, res) => {
	const { error } = schemas.favoriteValidateSchema.validate(req.body);

	if (error) {
		throw HttpError(400, '"missing field favorite');
	}

	const { contactId } = req.params;
	const result = await Contact.findByIdAndUpdate(contactId, req.body, {
		new: true,
	});

	if (!result) {
		throw HttpError(404, `Contact with id ${contactId} not found.`);
	}

	res.status(200).json(result);
};

// delete
const deleteContact = async (req, res) => {
	const { contactId } = req.params;

	const result = await Contact.findByIdAndDelete(contactId);

	if (!result) {
		throw HttpError(404, `Contact with id ${contactId} not found.`);
	}

	res.status(200).json({ message: 'Contact deleted' });
};

module.exports = {
	getContactsList: ctrlWrapper(getContactsList),
	getContactByID: ctrlWrapper(getContactByID),
	postContact: ctrlWrapper(postContact),
	updateContactByID: ctrlWrapper(updateContactByID),
	updateFavorite: ctrlWrapper(updateFavorite),
	deleteContact: ctrlWrapper(deleteContact),
};
