const mongoose = require('mongoose');
const request = require('supertest');
require('dotenv').config();

const { DB_HOST_TEST, PORT = 3000 } = process.env;

const app = require('../app');
const { User } = require('../models/user');

describe('test api/users/login route', () => {
	let server = null;
	beforeAll(async () => {
		server = app.listen(PORT);
		await mongoose.connect(DB_HOST_TEST);
	});

	afterAll(async () => {
		server.close();
		await mongoose.connection.close();
	});

	test('test login route with correct data', async () => {
		const registerData = {
			password: '223444422',
			email: 'userWithAvatar@gmail.com',
		};

		const res = await request(app).post('/api/users/login').send(registerData);
		const user = await User.findOne({ email: registerData.email });

		expect(res.statusCode).toBe(200);
		expect(res.body.token).toBe(user.token);
		expect(res.body.user.email).toBe(user.email);
		expect(res.body.user.subscription).toBe(user.subscription);
	});
});
