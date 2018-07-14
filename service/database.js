require('dotenv').config();
var mongoose = require('mongoose'),
    options = {autoReconnect: true};

// Connect to database with auto-reonnect enabled
mongoose.connect(process.env.MLAB_KEY, options);

// When successfully connected
mongoose.connection.on('connected', () => {
    console.log('Mongoose default connection open to ' + process.env.MLAB_KEY);
});

// If the connection throws an error
mongoose.connection.on('error', (err) => {
    console.log('Mongoose default connection error: ' + err);
});

// When the connection is disconnected
mongoose.connection.on('disconnected', () => {
    console.log('Mongoose default connection disconnected');
});

// If the Node process ends, close the Mongoose connection 
process.on('SIGINT', () => {
    mongoose.connection.close(() => {
        console.log('Mongoose default connection disconnected through app termination');
        process.exit(0);
    });
});