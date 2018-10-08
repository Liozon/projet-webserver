// Database: travelLog
// Collections: user, trip, place



//setup express
var express = require('express');
var app = express();

//setup mongoDB
const MongoClient = require('mongodb').MongoClient;

// Database name
var dbName = 'travelLog';

// Connection URL
var connectionString = 'mongodb://localhost:27017/' + dbName;


//connect database to server
var database = {
    connect(connectionString, callback) {
        // Use connect method to connect to the server
        MongoClient.connect(connectionString, {autoReconnect: true}, function (err, connection) {
            if (err) {
                console.log('Failed to connect to mongoDB.', err.message);
                process.exit(1);
            }
            console.log("Connected successfully to server");
            var db = connection.db(dbName);
            connection.close();
            callback();
        });
    },
    
    //creates Test data in DB
    createDBData() {
        MongoClient.connect(connectionString, {autoReconnect: true}, function (err, connection) {

            var db = connection.db(dbName);
                insertDocumentsUser(db, function(){
                    insertDocumentsTrip(db, function(){
                        insertDocumentsPlace(db, function() {
                            connection.close();
                            console.log('Inserted Test Data in DB');
                        });
                    });
                });
        });
    },

    //drops all DB collections
    deleteDBData() {
        MongoClient.connect(connectionString, {autoReconnect: true}, function (err, connection) {
            var db = connection.db(dbName);
            db.dropDatabase();
            /*
            var db = connection.db(dbName);
            db.collection('user').drop();
            db.collection('trip').drop();
            db.collection('place').drop();
            */
            connection.close();
            console.log('Deleted DB data');
        });
    },

    

    //inserts a given dataset in the given DB collection
    //param collectionName: name of collection
    //param dataSet: json which contains the dataset for insertion
    insertDatasetInDB(collectionName, dataSet, callback) {
        MongoClient.connect(connectionString, function (err, connection) {
            // Get the collection
            var collection = connection.db(dbName).collection(collectionName);
            //insert data
            collection.insert(dataSet, function (err, obj) {
                if (err) {
                    console.log('Failed.', err.message);
                    callback({status: 'failed'});
                    process.exit(1);
                } else {
                    callback({status: 'ok'});
                }
                connection.close();
            });
        });
    },

    //removes a dataset that matches a given filter in the given DB collection
    //param collectionName: name of collection
    //param filter: json which contains filter to identify the dataset
    deleteDatasetInDB(collectionName, filter, callback) {
        MongoClient.connect(connectionString, function (err, connection) {
            // Get the collection
            var collection = connection.db(dbName).collection(collectionName);
            //insert data
            collection.remove(filter, function (err, obj) {
                if (err) {
                    console.log('Failed.', err.message);
                    callback({status: 'failed'});
                    process.exit(1);
                } else {
                    callback({status: 'ok'});
                }
                connection.close();
            });
        });
    },

    //updates a dataset that matches a given filter in the given DB collection
    //param collectionName: name of collection
    //param filter: json which contains filter to identify the dataset
    //param updateData: json which contains the update operation and data
    updateData(collectionName, filter, updateData, callback) {
        MongoClient.connect(connectionString, function (err, connection) {
            // Get the collection
            var collection = connection.db(dbName).collection(collectionName);
            collection.update(filter, updateData, function (err, obj) {
                if (err) {
                    console.log('Failed.', err.message);

                    callback({status: 'failed'});


                    process.exit(1);
                } else {

                    callback({status: 'ok'});


                }
                connection.close();
            });
        });
    },

    //finds a dataset that matches a given filter in the given DB collection
    //param collectionName: name of collection
    //param filter: json which contains filter to find the dataset
    findDatasetsByFilter(collectionName, filter, callback) {
        MongoClient.connect(connectionString, function (err, connection) {
            var collection = connection.db(dbName).collection(collectionName);
            // Find some documents
            collection.find(filter).toArray(function (err, docs) {
                if (err) {
                    console.log('Failed to find documents.', err.message);
                    process.exit(1);
                }
                callback(docs);
                connection.close();
            });
        });
    },

    //creates a new user in the user collection with the given data
    //param userData: json which containes the data for the new user
    createUser(userData, callback) {
        MongoClient.connect(connectionString, function (err, connection) {
            // Get the collection
            var collection = connection.db(dbName).collection('user');
            connection.close();
            database.getIdMax('user', {userid: -1}, {userid: 1}, function (id) {
                userData.userid = id.userid + 1;
                database.insertDatasetInDB('user', userData, function (data) {
                    console.log('user '+ userData.credentials.username + 'was created successfully');
                    callback(data, userData.userid);
                });
            });
        });
    },
};

/*
database.connect(connectionString, function() {
    
});
*/

//------------------------------------------------------
//Test data insert functions:

// Collection "user":

// Insert some documents to the collection user
var insertDocumentsUser = function (db, callback) {
    // Get the documents collection
    var collection = db.collection('user');
    // Insert some documents
    collection.insertMany([
        {
            userid: 1,
            username: 'test',
            email: 'test@heig-vd.ch',
            password: 'test',
            registrationDate: 2018-10-08,
            trip: [
                {tripid: 1}
            ]
        },
        {
            userid: 2,
            username: 'test2',
            email: 'test2@heig-vd.ch',
            password: 'test2',
            registrationDate: 2018-10-07,
            trip: [
                {tripid: 2}
            ]
        }
    ], function (err, result) {
        if (err) {
            console.log('Failed to insert documents into the collection user.', err.message);
            process.exit(1);
        }

        console.log('Inserted 2 documents into the collection user.');
        callback(result);
    });
};

// Find the documents of the collection user
var findDocumentsUser = function (db, callback) {
    // Get the documents collection
    var collection = db.collection('user');
    // Find some documents
    collection.find({}).toArray(function (err, docs) {
        if (err) {
            console.log('Failed to find documents.', err.message);
            process.exit(1);
        } else if (docs == 0) {
            console.log('There are no documents in the collection user')
        } else {
            console.log('Found the following records in the collection user:');

            console.log(docs)
            callback(docs);
        }
    });
};

//------------------------------------------------------
// Collection "trip":

// Insert some documents to the collection trip
var insertDocumentsTrip = function (db, callback) {
    // Get the documents collection
    var collection = db.collection('trip');
    // Insert some documents
    collection.insertMany([
        {
            tripid: 1,
            description: 'description of the trip',
            creationDate: 2018-10-01,
            lastModDate: 2018-10-08,
            place: [
                {placeid: 1}
            ]
        },
        {
            tripid: 2,
            description: 'other description of a trip',
            creationDate: 2018-10-07,
            lastModDate: 2018-10-08,
            place: [
                {placeid: 2}
            ]
        }
    ], function (err, result) {
        if (err) {
            console.log('Failed to insert documents into the collection trip.', err.message);
            process.exit(1);
        }

        console.log('Inserted 2 documents into the collection trip.');
        callback(result);
    });
};

// Find the documents of the collection trip
var findDocumentsTrip = function (db, callback) {
    // Get the documents collection
    var collection = db.collection('trip');
    // Find some documents
    collection.find({}).toArray(function (err, docs) {
        if (err) {
            console.log('Failed to find documents.', err.message);
            process.exit(1);
        } else if (docs == 0) {
            console.log('There are no documents in the collection trip')
        } else {
            console.log('Found the following records in the collection trip:');

            console.log(docs)
            callback(docs);
        }
    });
};


//------------------------------------------------------
// Collection "place":

// Insert some documents to the collection place
var insertDocumentsPlace = function (db, callback) {
    // Get the documents collection
    var collection = db.collection('place');
    // Insert some documents
    collection.insertMany([
        {
            placeid: 1,
            description: 'description of the place',
            // geolocation: ???,
            picture: 'picture.jpg',
            creationDate: 2018-10-01,
            lastModDate: 2018-10-08
        },
        {
            placeid: 2,
            description: 'other description of a place',
            // geolocation: ???,
            picture: 'picture2.jpg',
            creationDate: 2018-10-07,
            lastModDate: 2018-10-08
        }
    ], function (err, result) {
        if (err) {
            console.log('Failed to insert documents into the collection place.', err.message);
            process.exit(1);
        }

        console.log('Inserted 2 documents into the collection place.');
        callback(result);
    });
};

// Find the documents of the collection place
var findDocumentsPlace = function (db, callback) {
    // Get the documents collection
    var collection = db.collection('place');
    // Find some documents
    collection.find({}).toArray(function (err, docs) {
        if (err) {
            console.log('Failed to find documents.', err.message);
            process.exit(1);
        } else if (docs == 0) {
            console.log('There are no documents in the collection place')
        } else {
            console.log('Found the following records in the collection place:');

            console.log(docs)
            callback(docs);
        }
    });
};


//-----------------------------------------------------------------

// Database export:

module.exports = database;

