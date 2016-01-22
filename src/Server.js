'use strict';

const express = require('express');

module.exports = (instance, host, port) => {
    const app = express();

    app.get('/list', (req, res) => {
        res.send(instance.list);
    });

    app.get('/all', (req, res) => {
        res.send(instance.pickAll(req.query.protocols));
    });

    app.get('/best', (req, res) => {
        res.send(instance.pickBest(req.query.protocols));
    });

    app.get('/random', (req, res) => {
        res.send(instance.pickRandom(req.query.protocols));
    });

    let server;

    const start = () => {
        port = port || 3000;
        host = host || '127.0.0.1';
        server = app.listen(port, host);
        server.on('error', (error) => console.log('Error initializing server'));
        server.on('listening', () => console.log(`Listening at ${host}:${port}`));
    };

    return {stop: () => server.close(), start: start};
};