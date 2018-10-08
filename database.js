// Database: TravelLog
// Collections: user, trip, place



//setup express
var express = require('express');
var app = express();

//setup mongoDB
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

// Database name
var dbName = 'TravelLog';

// Connection URL
var connectionString = 'mongodb://localhost:3000/' + dbName;

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
        });
    },

    //drops all DB collections
    deleteDBData() {
        MongoClient.connect(connectionString, {autoReconnect: true}, function (err, connection) {
            var db = connection.db(dbName);
            db.collection('user').drop();
            db.collection('trip').drop();
            db.collection('place').drop();
            connection.close();
            console.log('Deleted DB data');
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

    /*
    //gets the id the datasets which match a given filter in a given user in the collection user
    //param userfilter: json wich contains the filter to find a certain user
    //param filter: json wich contains the filter to match the the data which should be projected
    getIdinUser(userfilter, filter, callback) {
        MongoClient.connect(connectionString, function (err, connection) {

            var collection = connection.db(dbName).collection('user');
            // Find some documents
            collection.aggregate(
                [
                    {
                        $match: userfilter
                    },
                    {
                        $project: filter
                    }
                ]
            ).toArray(function (err, docs) {
                if (err) {
                    console.log('Failed to find documents.', err.message);
                    process.exit(1);
                }
                callback(docs);
                connection.close();
            });
        });
    },
    

    //extracts the data for the sidebar
    extractDataForSidebar(callback) {
        MongoClient.connect(connectionString, function (err, connection) {

                var collection = connection.db(dbName).collection('book');
                collection.aggregate(
                    [
                        {
                            $lookup:
                                {
                                    from: 'offer',
                                    localField: 'bookid',
                                    foreignField: 'bookid',
                                    as: 'joinedOffer'

                                }

                        },
                        {$unwind: '$joinedOffer'},
                        {$match: {'joinedOffer.amount' : {'$gt': 0}}},
                        {
                            $group:
                                {
                                    _id: null,
                                    genres: {$addToSet: '$genre'},
                                    authors: {$addToSet: '$author'}
                                }
                        },
                    ]
                ).toArray(function (err, docs) {
                    if (err) {
                        console.log('Failed to find documents.', err.message);
                        process.exit(1);
                    } else {
                        callback(docs);
                    }
                    connection.close();
                });
        });
    },

    //gets the offer amount for a given id
    //param id: the id of the offer
    getOfferAmount(id, callback) {
        MongoClient.connect(connectionString, function (err, connection) {

            var collection = connection.db(dbName).collection('offer');
            id = parseInt(id);

            collection.find({'offerid': id}).toArray(function (err, docs) {
                if (err) {
                    console.log("getOfferAmount in database failed", err.message);
                    process.exit(1);
                }
                callback(docs[0]['amount']);
                connection.close();
            });
        });
    },

    //gets the data for the offers for the shoppingcart
    //param offers: array of offerids
    getOffersForShoppingCart(offers, callback) {
        MongoClient.connect(connectionString, function (err, connection) {

            var collection = connection.db(dbName).collection('offer');
            offerids = Object.keys(offers).map(x => parseInt(x));
            //console.log(offerids);

            collection.aggregate(
                [
                    {
                        $match: {
                            'offerid': {$in: offerids}
                        }
                    },

                    {
                        $lookup:
                            {
                                from: 'book',
                                localField: 'bookid',
                                foreignField: 'bookid',
                                as: 'joinedBook'

                            }
                    },
                    {$unwind: '$joinedBook'},
                    {
                        $lookup:
                            {
                                from: 'user',
                                localField: 'offerid',
                                foreignField: 'offer.offerid',
                                as: 'joinedUser'
                            }
                    },

                    {$unwind: '$joinedUser'}

                ]
            ).toArray(function (err, docs) {
                if (err) {
                    console.log('Failed to find documents.', err.message);
                    process.exit(1);
                }
                callback(docs);
                connection.close();
            });
        });
    },


    //finds the the data for the offers for the overview by applying filters
    //param filter: json wich contains the filter to match certain offers
    //param sortingFilter: json wich contains the sorting filter to match certain offers
    findOffersForOverview(filter, sortingFilter, callback) {
        MongoClient.connect(connectionString, function (err, connection) {
            var collection = connection.db(dbName).collection('offer');
            filter['pages']['$gt'] = parseInt(filter['pages']['$gt']);
            filter['pages']['$lt'] = parseInt(filter['pages']['$lt']);
            filter['price']['$lt'] = parseInt(filter['price']['$lt']);
            filter['price']['$gt'] = parseInt(filter['price']['$gt']);
            //console.log(collection);

            collection.aggregate([

                {$match: {'amount': {$gt: 0}}},
                {
                    $lookup:
                        {
                            from: 'book',
                            localField: 'bookid',
                            foreignField: 'bookid',
                            as: 'joinedOffer'

                        }
                },
                {
                    $replaceRoot: {
                        newRoot: {
                            $mergeObjects: [{
                                $arrayElemAt: ["$joinedOffer", 0]
                            }, "$$ROOT"
                            ]
                        }
                    }
                },
                {$project: {joinedOffer: 0}},
                {
                    $group:
                        {
                            _id: '$bookid',
                            title: {$first: "$title"},
                            author: {$first: "$author"},
                            genre: {$first: "$genre"},
                            pages: {$first: "$pages"},
                            piclink: {$first: "$piclink"},
                            price: {$min: '$price'}

                        }

                },
                {$match: filter},
                {$sort: sortingFilter}

            ]).toArray(function (err, docs) {
                if (err) {
                    console.log('Failed.', err.message);
                    process.exit(1);
                }
                callback(docs);
                connection.close();
            });
        });
    },
    

    //finds the data for a given userid
    //param userid: the id of the user
    findArticleData(bookid, callback) {
        MongoClient.connect(connectionString, function (err, connection) {

            var collection = connection.db(dbName).collection('book');
            var bookIdInt = bookid;
            if (typeof(bookid) === 'string') {
                bookIdInt = parseInt(bookid);
            }

            collection.aggregate(
                [
                    {
                        $match: {'bookid': bookIdInt}
                    },
                    {
                        $lookup:
                            {
                                from: 'offer',
                                localField: 'bookid',
                                foreignField: 'bookid',
                                as: 'joinedOffer'
                            }
                    },


                    {$unwind: '$joinedOffer'},
                    {$match: {'joinedOffer.amount': {$gt: 0}}},
                    {
                        $lookup:
                            {
                                from: 'user',
                                localField: 'joinedOffer.offerid',
                                foreignField: 'offer.offerid',
                                as: 'joinedUser'
                            }
                    },
                    {
                        $unwind: '$joinedUser'
                    },
                    {
                        $sort:
                            {
                                'joinedOffer.price': 1
                            }
                    }

                ]).toArray(function (err, docs) {
                if (err) {
                    console.log('Failed.', err.message);
                    process.exit(1);
                }
                //console.log("DATABASE CALLS YOU");
                console.log(docs);
                callback(docs);
                connection.close();
            });
        });
    },

    //gets data for the user profil of the user which matches the given userid
    //param userid: userid of a certain user
    findUserInfoForProfile(userId, callback) {
        MongoClient.connect(connectionString, function (err, connection) {

            var collection = connection.db(dbName).collection('user');
            console.log(userId);
            var userIdInt = userId;
            if (typeof(userId) === 'string') {
                userIdInt = parseInt(userId);
            }

            collection.aggregate([

                {
                    $match: {userid: userIdInt}
                },
                {
                    $lookup:
                        {
                            from: 'book',
                            localField: 'soldbooks.bookid',
                            foreignField: 'bookid',
                            as: 'soldbooksInfo'

                        }
                },
                {
                    $lookup:
                        {
                            from: 'order',
                            localField: 'order.orderid',
                            foreignField: 'orderid',
                            as: 'fromOrder'

                        }
                },
                {
                    $lookup:
                        {
                            from: 'book',
                            localField: 'fromOrder.orderedItems.bookid',
                            foreignField: 'bookid',
                            as: 'fromOrderInfo'

                        }
                },
                {
                    $lookup:
                        {
                            from: 'offer',
                            localField: 'offer.offerid',
                            foreignField: 'offerid',
                            as: 'fromOffer'

                        }
                },
                {
                    $lookup:
                        {
                            from: 'book',
                            localField: 'fromOffer.bookid',
                            foreignField: 'bookid',
                            as: 'fromOfferInfo'

                        }
                },
                {
                    $addFields:
                        {
                            'fromOffer': {
                                $filter: {
                                    input: '$fromOffer',
                                    as: 'offer',
                                    cond: {$gte: ['$$offer.amount', 1]}
                                }
                            }
                        }
                },
                {
                    $project:
                        {
                            userid: 1,
                            'credentials.username': 1,
                            personal: 1,
                            'fromOffer.offerid': 1,
                            'fromOffer.bookid': 1,
                            'fromOffer.amount': 1,
                            'fromOffer.price': 1,
                            'fromOfferInfo.bookid': 1,
                            'fromOfferInfo.title': 1,
                            'fromOfferInfo.author': 1,
                            'fromOrder.orderid': 1,
                            'fromOrder.orderedItems.bookid': 1,
                            'fromOrder.orderedItems.price': 1,
                            'fromOrder.orderedItems.amount': 1,
                            'fromOrderInfo.bookid': 1,
                            'fromOrderInfo.title': 1,
                            'fromOrderInfo.author': 1,
                            'soldbooks.bookid': 1,
                            'soldbooks.amount': 1,
                            'soldbooks.price': 1,
                            'soldbooksInfo.bookid': 1,
                            'soldbooksInfo.title': 1,
                            'soldbooksInfo.author': 1
                        }
                }
            ]).toArray(function (err, docs) {
                if (err) {
                    console.log('Failed.', err.message);
                    process.exit(1);
                }
                console.log(docs[0]);
                callback(docs[0]);
                connection.close();
            });
        });
    },

    //gets the title and ids of all books in the collection book
    getTitlesAndIdOfAllBooks(callback) {
        MongoClient.connect(connectionString, function (err, connection) {

            var collection = connection.db(dbName).collection('book');
            // Find some documents
            collection.aggregate(
                [
                    {
                        $project: {bookid: 1, title: 1}
                    }
                ]
            ).toArray(function (err, docs) {
                if (err) {
                    console.log('Failed to find documents.', err.message);
                    process.exit(1);
                }
                callback(docs);
                connection.close();
            });
        });
    },

    //gets data for the offer which matches the given offerid
    //param offerid: offerid of a certain offer
    getOfferData(offerid, callback){
        MongoClient.connect(connectionString, function (err, connection) {
            var collection = connection.db(dbName).collection('offer');
            // Find some documents
            collection.aggregate(
                [
                    {$match: {offerid: offerid}},
                    {
                        $lookup:
                            {
                                from: 'book',
                                localField: 'bookid',
                                foreignField: 'bookid',
                                as: 'joinedBook'

                            }
                    },
                    {
                        $project: {offerid: 1, price: 1, amount: 1, deliverytime: 1, 'joinedBook.title' : 1}
                    }
                ]
            ).toArray(function (err, docs) {
                if (err) {
                    console.log('Failed to find documents.', err.message);
                    process.exit(1);
                }
                console.log("Found the following records");
                console.log(docs);
                console.log(docs[0]);
                callback(docs[0]);
                connection.close();
            });
        });
    },

    //prepares the data for a new offer and sets the id for the new offer and the new book,
    //creates a new book with the user input or finds a book which matches the given bookid int the DB, depending on the value in req.body.book
    //param req: request data
    //param $bookData: json containing the data for the new book
    //param $offerData: json containing the data for the new offer
    prepareDataForNewOffer(req, $bookData, $offerData, callback) {
        var status;
        if (req.body.book == 'newbook') {
            $bookData = req.body.bookData;
            database.getIdMax('book', {bookid: -1}, {bookid: 1}, function (id) {
                $bookData.bookid = id.bookid + 1;
                $bookData.pages = parseInt($bookData.pages);
                if ($bookData.piclink === '') {
                    $bookData.piclink = '/static/photos/buch.png';
                }
                database.insertDatasetInDB('book', $bookData, function (data) {
                    status = data.status;
                    database.getIdMax('offer', {offerid: -1}, {offerid: 1}, function (id) {
                        $offerData.offerid = id.offerid + 1;
                        callback($bookData.bookid, $offerData.offerid);
                    });
                });
            });
        } else {
            database.findDatasetsByFilter('book', {bookid: parseInt(req.body.book)}, function (data) {
                $bookData = data[0];
                console.log(data[0]);
                console.log('bookdata from database');
                database.getIdMax('offer', {offerid: -1}, {offerid: 1}, function (id) {
                    $offerData.offerid = id.offerid + 1;
                    callback($bookData.bookid, $offerData.offerid);
                });
            });
        }
    },

    //gets the maximal biggest id of a collection
    //param collectionName: the name of the collection
    //param idNamequery: json which contains the query for the sort function
    //param idNameProjection: json which contains the query for the project function
    getIdMax(collectionName, sortQuery, idNameProjection, callback) {
        console.log(sortQuery, idNameProjection);
        MongoClient.connect(connectionString, function (err, connection) {

            var collection = connection.db(dbName).collection(collectionName);
            // Find some documents
            collection.aggregate([
                {
                    $sort: sortQuery
                },
                {
                    $limit: 1
                },
                {
                    $project: idNameProjection
                }
            ]).toArray(function (err, docs) {
                if (err) {
                    console.log('Failed.', err.message);
                    process.exit(1);
                }
                console.log(docs[0]);
                callback(docs[0]);
                connection.close();
            });
        })
    }
};

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

