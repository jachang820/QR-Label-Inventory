const users = require('./users');
const express = require('express');
const request = require('supertest');

const init = () => {
    const app = express();
    app.use(users);
    return app;
}

describe('GET /api/users/all', () => {
    test('It should say in api', async () => {
        const app = init();
        const res = await request(app).get('/');
        expect(res.text).toEqual('in api');
    });
});
