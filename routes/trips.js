const debug = require('debug')('travelLog');
const express = require('express');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Trip = require('../models/trip');
const Place = require('../models/place');
const utils = require('./utils');
const router = express.Router();
const formatLinkHeader = require('format-link-header');
const jwt = require("jsonwebtoken");

//Retrieve the secret key from our configuration
const secretKey = process.env.JWT_KEY || 'dfjsf';

const links = {};


/**
 * @api {post} /trips Create a trip
 * @apiName CreateTrip
 * @apiGroup Trip
 * @apiVersion 1.0.0
 * @apiDescription Create a new trip.
 *
 * @apiUse TripInRequestBody
 * @apiUse TripInResponseBody
 * @apiUse TripValidationError
 *
 * @apiExample Example
 *     POST /trips HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "tripName": "trip_1",
 *       "tripDescription": "This is the description of the trip_1.",
 *       "tripCreator": 1
 *     }
 *
 * @apiSuccessExample 201 Created
 *     HTTP/1.1 201 Created
 *     Content-Type: application/json
 *     Location: https://comem-webserv-2018-2019-e.herokuapp.com/trips/1
 *
 *     {
 *       "_id": "5bd9e744e80f0065a0c7fcd6",
 *       "tripid": 1,
 *       "tripName": "trip_1",
 *       "tripDescription": "This is the description of the trip_1.",
 *       "tripCreationDate": "2018-10-31T17:32:52.449Z",
 *       "tripLastModDate": "2018-10-31T17:32:52.449Z",
 *       "tripCreator": 1
 *     }
 */
router.post('/', authenticate, utils.requireJson, function (req, res, next) {
    // Create a new document from the JSON in the request body
    const newTrip = new Trip(req.body);
    // Save that document
    newTrip.save(function (err, savedTrip) {
        if (err) {
            return next(err);
        }

        debug(`Created trip "${savedTrip.tripName}"`);
        // Send the saved document in the response
        res
            .status(201)
            .send(savedTrip);
    });
});


/**
 * @api {get} /trips List trips
 * @apiName RetrieveTrips
 * @apiGroup Trip
 * @apiVersion 1.0.0
 * @apiDescription Retrieves a list of trips sorted by tripid (in ascending order).
 *
 * @apiUse TripURLQueryParameters
 * @apiUse TripInResponseBody
 * @apiUse TripResponseHeader
 *
 * @apiExample Example
 *     GET /trips HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Location: https://comem-webserv-2018-2019-e.herokuapp.com/trips/page=1&pageSize=10
 *
 *     [
 *       {
 *         "_id": "5bd9e744e80f0065a0c7fcd6",
 *         "tripid": 1,
 *         "tripName": "trip_1",
 *         "tripDescription": "This is the description of the trip_1.",
 *         "tripCreationDate": "2018-10-31T17:32:52.449Z",
 *         "tripLastModDate": "2018-10-31T17:32:52.449Z",
 *         "tripCreator": 1
 *       },
 *       {
 *         "_id": "5bd6bd0637fec753c40a89bb",
 *         "tripid": 2,
 *         "tripName": "trip_2",
 *         "tripDescription": "This is the description of the trip_2.",
 *         "tripCreationDate": "2018-10-29T07:55:50.995Z",
 *         "tripLastModDate": "2018-10-29T07:55:50.995Z",
 *         "tripCreator": 1
 *       },
 *       {
 *         "_id": "5bd6cbe57aa3be18a856dfbf",
 *         "tripid": 3,
 *         "tripName": "trip_3",
 *         "tripDescription": "This is the description of the trip_3.",
 *         "tripCreationDate": "2018-10-29T08:59:17.167Z",
 *         "tripLastModDate": "2018-10-29T08:59:17.167Z",
 *         "tripCreator": 2
 *       }
 *     ]
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Location: https://comem-webserv-2018-2019-e.herokuapp.com/trips?tripCreator=2
 *
 *     [
 *       {
 *         "_id": "5bd6cbe57aa3be18a856dfbf",
 *         "tripid": 3,
 *         "tripName": "trip_3",
 *         "tripDescription": "This is the description of the trip_3.",
 *         "tripCreationDate": "2018-10-29T08:59:17.167Z",
 *         "tripLastModDate": "2018-10-29T08:59:17.167Z",
 *         "tripCreator": 2
 *       }
 *     ]
 */
router.get('/', function (req, res, next) {

    Trip.find().count(function (err, total) {
        if (err) {
            return next(err);
        }

        let query = Trip.find().sort('tripid');

        // Filter trips by tripCreator (user) 
        if (req.query.tripCreator) {
            query = query.where('tripCreator').equals(req.query.tripCreator);
        }

        // Parse the "page" param (default to 1 if invalid)
        let page = parseInt(req.query.page, 10);
        if (isNaN(page) || page < 1) {
            page = 1;
        }
        // Parse the "pageSize" param (default to 50 if invalid)
        let pageSize = parseInt(req.query.pageSize, 10);
        if (isNaN(pageSize) || pageSize < 0 || pageSize > 10) {
            pageSize = 10;
        }
        // Apply skip and limit to select the correct page of elements
        query = query.skip((page - 1) * pageSize).limit(pageSize);

        res.set('Pagination-Page', page);
        res.set('Pagination-PageSize', pageSize);
        res.set('Pagination-Total', total);

        query.exec(function (err, trips) {
            if (err) {
                return next(err);
            }

            const tripIds = trips.map(trip => trip.tripid);
            Place.aggregate([
                {
                    $match: { // Select movies directed by the people we are interested in
                        placeCorrTrip: {
                            $in: tripIds
                        }
                    }
                },
                {
                    $group: { // Group the documents by the placeCorrTrip ID
                        _id: '$placeCorrTrip',
                        placesCount: { // Count the number of places for that ID
                            $sum: 1
                        }
                    }
                }
            ], function (err, results) {
                if (err) {
                    return next(err);
                }
                const tripsJson = trips.map(trip => trip.toJSON());
                results.forEach(function (result) {
                    // Get the trip ID (that was used to $group)...
                    const resultId = result._id.toString();
                    // Find the corresponding place...
                    const correspondingTrip = tripsJson.find(trip => trip.tripid == resultId);
                    // And attach the new property
                    correspondingTrip.placesCount = result.placesCount;
                });
                // Send the enriched response
                res.send(tripsJson);
            });

        });
    });
});


/**
 * @api {get} /trips/:tripid Retrieve a trip
 * @apiName RetrieveTrip
 * @apiGroup Trip
 * @apiVersion 1.0.0
 * @apiDescription Retrieves one trip.
 *
 * @apiUse TripIdInUrlPath
 * @apiUse TripInResponseBody
 * @apiUse TripNotFoundError
 *
 * @apiExample Example
 *     GET /trips/1 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Location: https://comem-webserv-2018-2019-e.herokuapp.com/trips/1
 *
 *     {
 *       "_id": "5bd9e744e80f0065a0c7fcd6",
 *       "tripid": 1,
 *       "tripName": "trip_1",
 *       "tripDescription": "This is the description of the trip_1.",
 *       "tripCreationDate": "2018-10-31T17:32:52.449Z",
 *       "tripLastModDate": "2018-10-31T17:32:52.449Z",
 *       "tripCreator": 1
 *     }
 */
router.get('/:tripid', function (req, res, next) {
    const tripid = req.params.tripid;
    Trip.findOne({
        tripid: tripid
    }).exec(function (err, trip) {
        if (err) {
            return next(err);
        }
        res.send(trip);
    });
});


/**
 * @api {get} /trips/agg/:tripid Retrieve aggregata datas of a trip
 * @apiName RetrieveAggTrip
 * @apiGroup Trip
 * @apiVersion 1.0.0
 * @apiDescription Retrieves aggregata dateas of a trip.
 *
 * @apiUse TripIdInUrlPath
 * @apiUse PlaceInResponseBody
 * @apiUse TripNotFoundError
 *
 * @apiExample Example
 *     GET /trips/1 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Location: https://comem-webserv-2018-2019-e.herokuapp.com/trips/agg/1
 *
 *     [
 *       {
 *         "_id": "5bdb19ad8cee2d018c55e6fa",
 *         "placeid": 1,
 *         "placeName": "place_1",
 *         "placeDescription": "This is the description of the place_1.",
 *         "placePicture": "https://muggli.one/heig/webs/missing-img.png",
 *         "placeCreationDate": "2018-11-01T15:20:13.951Z",
 *         "placeLastModDate": "2018-11-01T15:20:13.951Z",
 *         "placeLatitude": 0,
 *         "placeLongitude": 0,
 *         "placeCorrTrip": 1
 *       },
 *       {
 *         "_id": "5bdb1a808cee2d018c55e6fc",
 *         "placeid": 2,
 *         "placeName": "place_2",
 *         "placeDescription": "This is the description of the place_2.",
 *         "placePicture": "https://muggli.one/heig/webs/missing-img.png",
 *         "placeCreationDate": "2018-11-01T15:23:44.008Z",
 *         "placeLastModDate": "2018-11-01T15:23:44.008Z",
 *         "placeLatitude": 0,
 *         "placeLongitude": 0,
 *         "placeCorrTrip": 1
 *       }
 *     ]
 */
router.get('/agg/:tripid', function (req, res, next) {

    Place.find({
        placeCorrTrip: req.params.tripid
    }).populate().exec(function (err, place) {
        if (err) {
            return next(err);
        }
        res.send(place);
    });
});


/**
 * @api {patch} /trips/:tripid Partially update a trip
 * @apiName PartiallyUpdateTrip
 * @apiGroup Trip
 * @apiVersion 1.0.0
 * @apiDescription Partially updates a trip's data (only the properties found in the request body will be updated).
 * All properties are optional.
 *
 * @apiUse TripIdInUrlPath
 * @apiUse TripInRequestBody
 * @apiUse TripInResponseBody
 * @apiUse TripNotFoundError
 * @apiUse TripValidationError
 *
 * @apiExample Example
 *     PATCH /trips/1 HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "tripName": "trip_1_new"
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *       "_id": "5bd9e744e80f0065a0c7fcd6",
 *       "tripid": 1,
 *       "tripName": "trip_1_new",
 *       "tripDescription": "This is the description of the trip_1.",
 *       "tripCreationDate": "2018-10-31T17:32:52.449Z",
 *       "tripLastModDate": "2018-11-31T20:15:10.613Z",
 *       "tripCreator": 1
 *     }
 */
router.patch('/:tripid', utils.requireJson, loadTripFromParamsMiddleware, function (req, res, next) {

    // Update properties present in the request body
    if (req.body.tripName !== undefined) {
        req.trip.tripName = req.body.tripName;
    }
    if (req.body.tripDescription !== undefined) {
        req.trip.tripDescription = req.body.tripDescription;
    }
    if (req.body.tripCreator !== undefined) {
        req.trip.tripCreator = req.body.tripCreator;
    }

    req.trip.set("tripLastModDate", Date.now());

    req.trip.save(function (err, savedTrip) {
        if (err) {
            return next(err);
        }

        req.trip.set("tripLastModDate", Date.now());

        req.trip.save(function (err, savedTrip) {
            if (err) {
                return next(err);
            }


            debug(`Updated Trip "${savedTrip.tripName}"`);
            res.send(savedTrip);
        });
    });
});


/**
 * @api {put} /trips/:tripid Update a trip
 * @apiName UpdateTrip
 * @apiGroup Trip
 * @apiVersion 1.0.0
 * @apiDescription Replaces all the trip's data (the request body must represent a full, valid trip).
 *
 * @apiUse TripIdInUrlPath
 * @apiUse TripInRequestBody
 * @apiUse TripInResponseBody
 * @apiUse TripNotFoundError
 * @apiUse TripValidationError
 *
 * @apiExample Example
 *     PUT /trips/1 HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "tripName": "trip_1_new",
 *       "tripDescription": "This is the new description of the trip_1.",
 *       "tripCreator": 2
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *       "_id": "5bd9e744e80f0065a0c7fcd6",
 *       "tripid": 1,
 *       "tripName": "trip_1_new",
 *       "tripDescription": "This is the new description of the trip_1.",
 *       "tripCreationDate": "2018-10-31T17:32:52.449Z",
 *       "tripLastModDate": "2018-11-31T20:15:10.613Z",
 *       "tripCreator": 2
 *     }
 */
router.put('/:tripid', utils.requireJson, loadTripFromParamsMiddleware, function (req, res, next) {

    // Update all properties (regardless of whether they are in the request body or not)
    req.trip.tripName = req.body.tripName;
    req.trip.tripDescription = req.body.tripDescription;
    req.trip.tripCreator = req.body.tripCreator;

    req.trip.set("tripLastModDate", Date.now());

    req.trip.save(function (err, savedTrip) {
        if (err) {
            return next(err);
        }

        req.trip.set("tripLastModDate", Date.now());

        req.trip.save(function (err, savedTrip) {
            if (err) {
                return next(err);
            }

            debug(`Updated Trip "${savedTrip.tripName}"`);
            res.send(savedTrip);
        });
    });
});


/**
 * @api {delete} /trips/:tripid Delete a trip
 * @apiName DeleteTrip
 * @apiGroup Trip
 * @apiVersion 1.0.0
 * @apiDescription Permanently deletes a trip.
 *
 * @apiUse TripIdInUrlPath
 * @apiUse TripNotFoundError
 *
 * @apiExample Example
 *     DELETE /trips/1 HTTP/1.1
 *
 * @apiSuccessExample 204 No Content
 *     HTTP/1.1 204 No Content
 */
router.delete('/:tripid', loadTripFromParamsMiddleware, function (req, res, next) {

    // remove the trip
    req.trip.remove(function (err) {
        if (err) {
            return next(err);
        }

        debug(`Deleted trip "${req.trip.tripName}"`);
        res.sendStatus(204);
    });
});

/**
 * Middleware that loads the trip corresponding to the ID in the URL path.
 * Responds with 404 Not Found if the ID is not valid or the trip doesn't exist.
 */
function loadTripFromParamsMiddleware(req, res, next) {

    const tripid = req.params.tripid;

    let query = Trip.findOne({
        tripid: tripid
    });

    query.exec(function (err, trip) {
        if (err) {
            return next(err);
        } else if (!trip) {
            return tripNotFound(res, tripid);
        }
        req.trip = trip;
        next();
    });
}

/**
 * Responds with 404 Not Found and a message indicating that the trip with the specified ID was not found.
 */
function tripNotFound(res, tripid) {
    return res.status(404).type('text').send(`No trip found with ID ${tripid}`);
}

/**
 *  JWT authentication middleware
 */
function authenticate(req, res, next) {
    // Ensure the header is present.
    const authorization = req.get('Authorization');
    if (!authorization) {
        return res.status(401).send('Authorization header is missing');
    }
    // Check that the header has the correct format.
    const match = authorization.match(/^Bearer (.+)$/);
    if (!match) {
        return res.status(401).send('Authorization header is not a bearer token');
    }
    // Extract and verify the JWT.
    const token = match[1];
    jwt.verify(token, secretKey, function (err, payload) {
        if (err) {
            return res.status(401).send('Your token is invalid or has expired');
        } else {
            req.currentUserid = payload.sub;
            next(); // Pass the ID of the authenticated user to the next middleware.
        }
    });
}




/**
 * @apiDefine TripIdInUrlPath
 * @apiParam (URL path parameters) {Number} tripid The unique identifier of the trip to retrieve
 */

/**
 * @apiDefine TripURLQueryParameters
 * @apiParam (URL query parameters) {Number} [tripCreator] Select only trips by a specific tripCreator (this parameter can be given multiple times)
 * @apiParam (URL query parameters) {Number {1..}} [page] The page to retrieve (defaults to 1)
 * @apiParam (URL query parameters) {Number {1..10}} [pageSize] The number of elements to retrieve in one page (defaults to 10)
 */

/**
 * @apiDefine TripInRequestBody
 * @apiParam (Request body) {String{3..}} tripName The name of the trip
 * @apiParam (Request body) {String} [tripDescription] The description of the trip
 * @apiParam (Request body) {Number} tripCreator The userid of the creator of the trip
 */

/**
 * @apiDefine TripInResponseBody
 * @apiSuccess (Response body) {String} _id A unique identifier for the trip generated by the server
 * @apiSuccess (Response body) {Number} tripid The unique identifier of the trip
 * @apiSuccess (Response body) {String} tripName The name of the trip
 * @apiSuccess (Response body) {String} tripDescription The description of the trip (if any)
 * @apiSuccess (Response body) {Date} tripCreationDate The date at which the trip was created with default value Date.now 
 * @apiSuccess (Response body) {Date} tripLastModDate The date at which the trip was modified with default value Date.now
 * @apiSuccess (Response body) {Number} tripCreator The userid of the creator of the trip
 */

/**
 * @apiDefine TripResponseHeader
 * @apiParam (Response headers) {String} Link Links to the first, previous, next and last pages of the collection (if applicable) => Custom headers (solution 2)
 */

/**
 * @apiDefine TripNotFoundError
 *
 * @apiError {Object} 404/NotFound No trip was found corresponding to the tripid in the URL path
 *
 * @apiErrorExample {json} 404 Not Found
 *     HTTP/1.1 404 Not Found
 *     Content-Type: text/plain
 *
 *     No trip found with ID 1
 */

/**
 * @apiDefine TripValidationError
 *
 * @apiError (Error 4xx) {Object} 401/Unauthorized User is not authorized to create this trip.
 * @apiError (Error 5xx) {Object} 500/InternalServerError Some of the trip's properties are invalid
 *
 * @apiErrorExample {json} 401 Unauthorized
 *     HTTP/1.1 401 Unauthorized
 *     Content-Type: application/json
 *
 *     Authorization header is missing
 *
 * @apiErrorExample {json} 500 Internal Server Error
 *     HTTP/1.1 500 Internal Server Error
 *     Content-Type: application/json
 *
 *     {
 *       "message": Trip validation failed: tripName: Path `tripName` (`1`) is shorter than the minimum allowed length (3).
 *     }
 */


module.exports = router;