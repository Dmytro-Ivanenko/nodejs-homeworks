const express = require('express');

const {
	getContactsList,
	getContactByID,
	postContact,
	updateContactByID,
	updateFavorite,
	deleteContact,
} = require('../../controllers/contactsControllers');

const router = express.Router();

// routes
router.get('/', getContactsList);
router.get('/:contactId', getContactByID);
router.post('/', postContact);
router.put('/:contactId', updateContactByID);
router.put('/:contactId/favorite', updateFavorite);
router.delete('/:contactId', deleteContact);

// export
module.exports = router;
