// Main imports
const express = require('express');
const { ApolloServer } = require('apollo-server-express');
const mongoose = require('mongoose');
const cors = require('cors');

// Final imports
const schema = require('./schema');
const app = express();

// Database
mongoose.connect("mongodb://oles:0password@ds227469.mlab.com:27469/graphql-everdo", {
    useNewUrlParser: true
});
mongoose.connection.once('open', () => console.log("Server was connected to database!"));

// Middlewares
app.use(cors());
app.use('/files', express.static('./files'));

// Server
const server = new ApolloServer({
    schema,
    tracing: true
});

// Apply middlewares
server.applyMiddleware({ app, path: '/graphql' });

// Start API
app.listen(4000, () => console.log("Server is listening on port 4000!"));