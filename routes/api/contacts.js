const express = require('express');

const {
	getContactsList,
	getContactByID,
	postContact,
	updateContactByID,
	updateFavorite,
	deleteContact,
} = require('../../controllers/contactsControllers');
const { validateToken } = require('../../utils');

const router = express.Router();

// routes
router.get('/', validateToken, getContactsList);
router.get('/:contactId', validateToken, getContactByID);
router.post('/', validateToken, postContact);
router.put('/:contactId', validateToken, updateContactByID);
router.put('/:contactId/favorite', validateToken, updateFavorite);
router.delete('/:contactId', validateToken, deleteContact);

// export
module.exports = router;
