const debug = require('debug')('travelLog');
const express = require('express');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Place = require('../models/place');
const utils = require('./utils');
const router = express.Router();
const jwt = require("jsonwebtoken");

//Retrieve the secret key from our configuration
const secretKey = process.env.JWT_KEY || 'dfjsf';


/**
 * @api {post} /places Create a place
 * @apiName CreatePlace
 * @apiGroup Place
 * @apiVersion 1.0.0
 * @apiDescription Create a new place.
 *
 * @apiUse PlaceInRequestBody
 * @apiUse PlaceInResponseBody
 * @apiUse PlaceValidationError
 *
 * @apiExample Example
 *     POST /places HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "placeName": "place_1",
 *       "placeDescription": "This is the description of the place_1.",
 *       "placeCorrTrip": 1,
 *       "location": {
 *           "type": "Point",
 *           "coordinates": [6.63, 46.52]
 *       }
 *     }
 *
 * @apiSuccessExample 201 Created
 *     HTTP/1.1 201 Created
 *     Content-Type: application/json
 *     Location: https://comem-webserv-2018-2019-e.herokuapp.com/places/1
 *
 *     {
 *       "_id": "5be0362d7a0f46001685a341",
 *       "placeid": 1,
 *       "placeName": "place_1",
 *       "placeDescription": "This is the description of the place_1.",
 *       "placePicture": "https://muggli.one/heig/webs/missing-img.png",
 *       "placeCreationDate": "2018-11-05T12:23:09.951Z",
 *       "placeLastModDate": "2018-11-05T12:23:09.951Z",
 *       "location": {"type": "Point", "coordinates" : [6.63, 46.52]}, 
 *       "placeCorrTrip": 1    
 *     }
 */
router.post('/', utils.authenticate, utils.requireJson, function (req, res, next) {
    // Create a new document from the JSON in the request body
    const newPlace = new Place(req.body);
    // Save that document
    newPlace.save(function (err, savedPlace) {
        if (err) {
            return next(err);
        }

        debug(`Created place "${savedPlace.placeName}"`);
        // Send the saved document in the response
        res
            .status(201)
            .send(savedPlace);
    });
});


/**
 * @api {get} /places List places
 * @apiName RetrievePlaces
 * @apiGroup Place
 * @apiVersion 1.0.0
 * @apiDescription Retrieves a list of places sorted by placeid (in ascending order).
 *
 * @apiUse PlaceURLQueryParameters
 * @apiUse PlaceInResponseBody
 * @apiUse PlaceResponseHeader
 *
 * @apiExample Example
 *     GET /places HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Location: https://comem-webserv-2018-2019-e.herokuapp.com/places?page=1&pageSize=10
 *
 *     [
 *       {
 *         "_id": "5be0362d7a0f46001685a341",
 *         "placeid": 1,
 *         "placeName": "place_1",
 *         "placeDescription": "This is the description of the place_1.",
 *         "placePicture": "https://muggli.one/heig/webs/missing-img.png",
 *         "placeCreationDate": "2018-11-05T12:23:09.951Z",
 *         "placeLastModDate": "2018-11-05T12:23:09.951Z",
 *         "location": {"type": "Point", "coordinates" : [6.63, 46.52]}, 
 *         "placeCorrTrip": 1 
 *       },
 *       {
 *         "_id": "5be036d27a0f46001685a342",
 *         "placeid": 2,
 *         "placeName": "place_2",
 *         "placeDescription": "This is the description of the place_2.",
 *         "placePicture": "https://muggli.one/heig/webs/missing-img.png",
 *         "placeCreationDate": "2018-11-05T12:25:54.693Z",
 *         "placeLastModDate": "2018-11-05T12:25:54.693Z",
 *         "location": {"type": "Point", "coordinates" : [6.63, 46.52]}, 
 *         "placeCorrTrip": 1
 *       },
 *       {
 *         "_id": "5be037007a0f46001685a343",
 *         "placeid": 3,
 *         "placeName": "place_3",
 *         "placeDescription": "This is the description of the place_3.",
 *         "placePicture": "https://muggli.one/heig/webs/missing-img.png",
 *         "placeCreationDate": "2018-11-05T12:26:40.020Z",
 *         "placeLastModDate": "2018-11-05T12:26:40.020Z",
 *         "location": {"type": "Point", "coordinates" : [6.63, 46.52]}, 
 *         "placeCorrTrip": 2
 *       }
 *     ]
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Location: https://comem-webserv-2018-2019-e.herokuapp.com/places?placeCorrTrip=2
 *
 *     [
 *       {
 *         "_id": "5be037007a0f46001685a343",
 *         "placeid": 3,
 *         "placeName": "place_3",
 *         "placeDescription": "This is the description of the place_3.",
 *         "placePicture": "https://muggli.one/heig/webs/missing-img.png",
 *         "placeCreationDate": "2018-11-05T12:26:40.020Z",
 *         "placeLastModDate": "2018-11-05T12:26:40.020Z",
 *         "location": {"type": "Point", "coordinates" : [6.63, 46.52]}, 
 *         "placeCorrTrip": 2
 *       }
 *     ]
 */
router.get('/', function (req, res, next) {
    Place.find().count(function (err, total) {

        if (err) {
            return next(err);
        }

        let query = Place.find().sort('placeid');

        // Filter places by corresponding trip 
        if (req.query.placeCorrTrip) {
            query = query.where('placeCorrTrip').equals(req.query.placeCorrTrip);
        }

        // Parse the "page" param (default to 1 if invalid)
        let page = parseInt(req.query.page, 10);
        if (isNaN(page) || page < 1) {
            page = 1;
        }
        // Parse the "pageSize" param (default to 10 if invalid)
        let pageSize = parseInt(req.query.pageSize, 10);
        if (isNaN(pageSize) || pageSize < 0 || pageSize > 10) {
            pageSize = 10;
        }
        // Apply skip and limit to select the correct page of elements
        query = query.skip((page - 1) * pageSize).limit(pageSize);

        res.set('Pagination-Page', page);
        res.set('Pagination-PageSize', pageSize);
        res.set('Pagination-Total', total);

        query.exec(function (err, places) {
            if (err) {
                return next(err);
            }
            res.send(places);
        });

    });

});


/**
 * @api {get} /places/:placeid Retrieve a place
 * @apiName RetrievePlace
 * @apiGroup Place
 * @apiVersion 1.0.0
 * @apiDescription Retrieves one place.
 *
 * @apiUse PlaceIdInUrlPath
 * @apiUse PlaceInResponseBody
 * @apiUse PlaceNotFoundError
 *
 * @apiExample Example
 *     GET /places/1 HTTP/1.1
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *     Location: https://comem-webserv-2018-2019-e.herokuapp.com/places/1
 *
 *     {
 *       "_id": "5be0362d7a0f46001685a341",
 *       "placeid": 1,
 *       "placeName": "place_1",
 *       "placeDescription": "This is the description of the place_1.",
 *       "placePicture": "https://muggli.one/heig/webs/missing-img.png",
 *       "placeCreationDate": "2018-11-05T12:23:09.951Z",
 *       "placeLastModDate": "2018-11-05T12:23:09.951Z",
 *       "location": {"type": "Point", "coordinates" : [6.63, 46.52]}, 
 *       "placeCorrTrip": 1 
 *     }
 */
router.get('/:placeid', loadPlaceFromParamsMiddleware, function (req, res, next) {
    res.send(req.place);
});


/**
 * @api {patch} /places/:placeid Partially update a place
 * @apiName PartiallyUpdatePlace
 * @apiGroup Place
 * @apiVersion 1.0.0
 * @apiDescription Partially updates a place's data (only the properties found in the request body will be updated).
 * All properties are optional.
 *
 * @apiUse PlaceIdInUrlPath
 * @apiUse PlaceInRequestBody
 * @apiUse PlaceInResponseBody
 * @apiUse PlaceNotFoundError
 * @apiUse PlaceValidationError
 *
 * @apiExample Example
 *     PATCH /places/1 HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "placeName": "place_1_new"
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *       "_id": "5be0362d7a0f46001685a341",
 *       "placeid": 1,
 *       "placeName": "place_1_new",
 *       "placeDescription": "This is the description of the place_1.",
 *       "placePicture": "https://muggli.one/heig/webs/missing-img.png",
 *       "placeCreationDate": "2018-11-05T12:23:09.951Z",
 *       "placeLastModDate": "2018-11-05T12:26:40.020Z",
 *       "location": {"type": "Point", "coordinates" : [6.63, 46.52]}, 
 *       "placeCorrTrip": 1 
 *     }
 */
router.patch('/:placeid', utils.requireJson, loadPlaceFromParamsMiddleware, function (req, res, next) {

    // Update properties present in the request body
    if (req.body.placeName !== undefined) {
        req.place.placeName = req.body.placeName;
    }
    if (req.body.placeDescription !== undefined) {
        req.place.placeDescription = req.body.placeDescription;
    }
    if (req.body.placeCorrTrip !== undefined) {
        req.place.placeCorrTrip = req.body.placeCorrTrip;
    }

    req.place.set("placeLastModDate", Date.now());

    req.place.save(function (err, savedPlace) {
        if (err) {
            return next(err);
        }
        debug(`Updated Place "${savedPlace.placeName}"`);
        res.send(savedPlace);
    });
});


/**
 * @api {put} /places/:placeid Update a place
 * @apiName UpdatePlace
 * @apiGroup Place
 * @apiVersion 1.0.0
 * @apiDescription Replaces all the place's data (the request body must represent a full, valid place).
 *
 * @apiUse PlaceIdInUrlPath
 * @apiUse PlaceInRequestBody
 * @apiUse PlaceInResponseBody
 * @apiUse PlaceNotFoundError
 * @apiUse PlaceValidationError
 *
 * @apiExample Example
 *     PUT /places/1 HTTP/1.1
 *     Content-Type: application/json
 *
 *     {
 *       "placeName": "place_1_new",
 *       "placeDescription": "This is the new description of the place_1.",
 *       "placeCreator": 2
 *     }
 *
 * @apiSuccessExample 200 OK
 *     HTTP/1.1 200 OK
 *     Content-Type: application/json
 *
 *     {
 *       "_id": "5be0362d7a0f46001685a341",
 *       "placeid": 1,
 *       "placeName": "place_1_new",
 *       "placeDescription": "This is the new description of the place_1.",
 *       "placePicture": "https://muggli.one/heig/webs/missing-img.png",
 *       "placeCreationDate": "2018-11-05T12:23:09.951Z",
 *       "placeLastModDate": "2018-11-05T12:26:40.020Z",
 *       "location": {"type": "Point", "coordinates" : [6.63, 46.52]}, 
 *       "placeCorrTrip": 2 
 *     }
 */
router.put('/:placeid', utils.requireJson, loadPlaceFromParamsMiddleware, function (req, res, next) {

    // Update all properties (regardless of whether they are in the request body or not)
    req.place.placeName = req.body.placeName;
    req.place.placeDescription = req.body.placeDescription;
    req.place.placeCorrTrip = req.body.placeCorrTrip;

    req.place.set("placeLastModDate", Date.now());

    req.place.save(function (err, savedPlace) {
        if (err) {
            return next(err);
        }

        debug(`Updated Place "${savedPlace.placeName}"`);
        res.send(savedPlace);
    });
});


/**
 * @api {delete} /places/:placeid Delete a place
 * @apiName DeletePlace
 * @apiGroup Place
 * @apiVersion 1.0.0
 * @apiDescription Permanently deletes a place.
 *
 * @apiUse PlaceIdInUrlPath
 * @apiUse PlaceNotFoundError
 *
 * @apiExample Example
 *     DELETE /places/1 HTTP/1.1
 *
 * @apiSuccessExample 204 No Content
 *     HTTP/1.1 204 No Content
 */
router.delete('/:placeid', loadPlaceFromParamsMiddleware, function (req, res, next) {

    // remove the place
    req.place.remove(function (err) {
        if (err) {
            return next(err);
        }

        debug(`Deleted place "${req.place.placeName}"`);
        res.sendStatus(204);
    });
});

/**
 * Middleware that loads the place corresponding to the ID in the URL path.
 * Responds with 404 Not Found if the ID is not valid or the place doesn't exist.
 */
function loadPlaceFromParamsMiddleware(req, res, next) {

    const placeid = req.params.placeid;

    let query = Place.findOne({
        placeid: placeid
    });

    query.exec(function (err, place) {
        if (err) {
            return next(err);
        } else if (!place) {
            return placeNotFound(res, placeid);
        }

        req.place = place;
        next();
    });
}

/**
 * Responds with 404 Not Found and a message indicating that the place with the specified ID was not found.
 */
function placeNotFound(res, placeid) {
    return res.status(404).type('text').send(`No place found with ID ${placeid}`);
}

/**
 * @apiDefine PlaceIdInUrlPath
 * @apiParam (URL path parameters) {Number} placeid The unique identifier of the place to retrieve
 */

/**
 * @apiDefine PlaceURLQueryParameters
 * @apiParam (URL query parameters) {Number} [placeCorrTrip] Select only places corresponding to a specific trip (this parameter can be given multiple times)
 * @apiParam (URL query parameters) {Number {1..}} [page] The page to retrieve (defaults to 1)
 * @apiParam (URL query parameters) {Number {1..10}} [pageSize] The number of elements to retrieve in one page (defaults to 10)
 */

/**
 * @apiDefine PlaceInRequestBody
 * @apiParam (Request body) {String{3..}} placeName The name of the place
 * @apiParam (Request body) {String} [placeDescription] The description of the place
 * @apiParam (Request body) {Number} placeCorrTrip The tripid of the corresponding trip to the place
 * @apiParam (Request body) {String} [placePicture] The picture of the place with default value "https://muggli.one/heig/webs/missing-img.png"
 * @apiParam (Request body) {Point} location Coordinates of the places location with default value [-122.5, 37.7]
 */

/**
 * @apiDefine PlaceInResponseBody
 * @apiSuccess (Response body) {String} _id A unique identifier for the place generated by the server
 * @apiSuccess (Response body) {Number} placeid The unique identifier of the place
 * @apiSuccess (Response body) {String} placeName The name of the place
 * @apiSuccess (Response body) {String} placeDescription The description of the place (if any)
 * @apiSuccess (Response body) {String} placePicture The picture of the place, default value "https://muggli.one/heig/webs/missing-img.png"
 * @apiSuccess (Response body) {String} placeCreationDate The date at which the place was created with default value Date.now 
 * @apiSuccess (Response body) {Date} placeLastModDate The date at which the place was modified with default value Date.now
 * @apiSuccess (Response body) {Point} location Coordinates of the places location with default value [-122.5, 37.7]
 * @apiSuccess (Response body) {Number} placeCorrTrip The tripid of the corresponding trip to the place
 */

/**
 * @apiDefine PlaceResponseHeader
 * @apiParam (Response headers) {String} Link Links to the first, previous, next and last pages of the collection (if applicable) => Custom headers (solution 2)
 */

/**
 * @apiDefine PlaceNotFoundError
 *
 * @apiError {Object} 404/NotFound No place was found corresponding to the placeid in the URL path
 *
 * @apiErrorExample {json} 404 Not Found
 *     HTTP/1.1 404 Not Found
 *     Content-Type: text/plain
 *
 *     No place found with ID 1
 */

/**
 * @apiDefine PlaceValidationError
 *
 * @apiError (Error 4xx) {Object} 401/Unauthorized User is not authorized to create this place.
 * @apiError (Error 5xx) {Object} 500/InternalServerError Some of the place's properties are invalid
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
 *       "message": Place validation failed: placeName: Path `placeName` (`1`) is shorter than the minimum allowed length (3).
 *     }
 */


module.exports = router;