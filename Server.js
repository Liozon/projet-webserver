//Import express for filehandling
var express = require('express'),
    //init expressRequestHandler
    app = express(),
    //import bodyparser to read parameter send via ajax
    bodyParser = require('body-parser'),
    //import our database module
    database = require('./database'),
    parseCookie = require('cookie').parse;

//Server settings
var port = 3000;
var serverAdress= 'localhost:' + port;
var connectionString = 'mongodb://localhost:27017/travelLog';

//Connects server to the database
database.connect(connectionString, function (err, connection) {
    if (err) {
        logger.error('Failed to connect to database.', {err});
        process.exit(1);
    } else {
        database.deleteDBData();
        database.createDBData();
    }
});



console.log('Server running at http://127.0.0.1:' + port + '/');