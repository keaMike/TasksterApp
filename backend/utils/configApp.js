const express = require('express');
const rateLimit = require('express-rate-limit');
const path = require('path');

const apiLimit = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30
});

const setupOptions = (app) => {
    console.log('Configuring options...');
    app.use(express.json());
    app.use('/api/', apiLimit);
};

const pageRoutes = require('../../client/routes/pages');

const setupPagesAndStaticFiles = (app) => {
    app.use(express.static(path.join(__dirname, '..', '/..', '/client', '/public')));
    app.use('/favicon.ico', express.static(path.join(__dirname, '..', '/..', '/client', '/public', '/images', '/favicon.png')));
    app.use(pageRoutes);
};

const authRoutes = require('../routes/auth');
const userRoutes = require('../routes/users');
const taskRoutes = require('../routes/tasks');
const teamRoutes = require('../routes/teams');
const memberRoutes = require('../routes/members');

const setupRoutes = (app) => {
    console.log('Configuring routes...');
    app.use('/api/tasks', taskRoutes);
    app.use('/api/members', memberRoutes);
    app.use('/api/auth', authRoutes);
    app.use('/api/users', userRoutes);
    app.use('/api/teams', teamRoutes);
};

module.exports = {
    setupOptions,
    setupPagesAndStaticFiles,
    setupRoutes
}