require('dotenv').config();
require('./backend/db/mongoose.js');
const express = require('express');
const app = express();
require('./backend/utils/configApp').setupOptions(app);
require('./backend/utils/configApp').setupRoutes(app);
require('./backend/utils/configApp').setupPagesAndStaticFiles(app);
const server = require('http').createServer(app);
require('./backend/chat/ioServer').instantiateSocketServer(server);

const PORT = process.env.PORT;
const ENVIRONMENT = process.env.NODE_ENV.trim();

if (ENVIRONMENT == 'development') {
    server.listen(PORT, () => {
        console.log(`App running in development mode on port ${PORT}`);
    });
} else {
    server.listen(PORT, () => {
        console.log(`App running in production mode on port ${PORT}`);
    });
};