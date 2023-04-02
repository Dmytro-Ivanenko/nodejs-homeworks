const fs = require('fs/promises');
const path = require('path');
const { nanoid } = require('nanoid');

const contactsPath = path.join(__dirname, 'contacts.json');

// work with file
const rewriteFile = async (contArr) => {
	await fs.writeFile(contactsPath, JSON.stringify(contArr, null, 2));
};

// contacts API
const listContacts = async () => {
	const data = await fs.readFile(contactsPath);
	return JSON.parse(data);
};

const getContactById = async (id) => {
	const data = await listContacts();
	const oneItem = data.find((item) => item.id === id);
	return oneItem || null;
};

const removeContact = async (id) => {
	const contacts = await listContacts();
	const index = contacts.findIndex((item) => {
		return item.id === id;
	});

	if (index === -1) {
		return null;
	}

	const [result] = contacts.splice(index, 1);

	await rewriteFile(contacts);
	return result;
};

const addContact = async (body) => {
	const { name, email, phone } = body;
	const contacts = await listContacts();

	const newContact = {
		id: nanoid(),
		name,
		email,
		phone,
	};

	contacts.push(newContact);
	await rewriteFile(contacts);

	return newContact;
};

const updateContact = async (id, body) => {
	const contacts = await listContacts();
	const index = contacts.findIndex((item) => {
		return item.id === id;
	});

	if (index === -1) {
		return null;
	}

	contacts[index] = { id, ...body };
	await rewriteFile(contacts);

	return contacts[index];
};

module.exports = {
	listContacts,
	getContactById,
	removeContact,
	addContact,
	updateContact,
};
