const debug = require('debug')('travelLog');
const express = require('express');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Trip = require('../models/trip');
const Place = require('../models/place');
const utils = require('./utils');
const router = express.Router();


/* 
 * POST: create a new trip 
 */
router.post('/', utils.requireJson, function (req, res, next) {
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

/* 
 * GET: list all trips
 */
router.get('/', function (req, res, next) {
  Trip.find().sort('tripid').exec(function (err, trips) {
    if (err) {
      return next(err);
    }
    const tripIds = trips.map(trip => trip.tripid);
    Place.aggregate([
      {
        $match: { // Select movies directed by the people we are interested in
          placeCorrTrip: { $in: tripIds }
        }
      },
      {
        $group: { // Group the documents by director ID
          _id: '$placeCorrTrip',
          placesCount: { // Count the number of movies for that ID
            $sum: 1
          }
        }
      }
    ], function (err, results) {
      if (err) {
        return next(err);
      }
      const tripsJson = trips.map(trip => trip.toJSON());
      results.forEach(function(result) {
        // Get the director ID (that was used to $group)...
        const resultId = result._id.toString();
        // Find the corresponding person...
        const correspondingTrip = tripsJson.find(trip => trip.tripid == resultId);
        // And attach the new property
        correspondingTrip.placesCount = result.placesCount;
      });
      // Send the enriched response
      res.send(tripsJson);
    });
  });
});

/* 
 * GET: list one trip
 */
router.get('/:tripid', function (req, res, next) {
  const tripid = req.params.tripid;
  Trip.findOne({ tripid: tripid }).exec(function (err, trip) {
    if (err) {
      return next(err);
    }
    res.send(trip);
  });
});


/* 
 * GET: list one trip aggreggate
 */
router.get('/agg/:tripid', function (req, res, next) {

  Place.find({ placeCorrTrip: req.params.tripid }).populate().exec(function (err, place) {
    if (err) {
      return next(err);
    }
    res.send(place);
  })
});

/* 
 * PATCH: Modify an existing trip 
 */
router.patch('/:tripid', utils.requireJson, loadTripFromParamsMiddleware, function (req, res, next) {

  // Update properties present in the request body
  if (req.body.tripName !== undefined) {
    req.trip.tripName = req.body.tripName;
  }
  if (req.body.tripDescription !== undefined) {
    req.trip.tripDescription = req.body.tripDescription;
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


/* 
 * DELETE: Delete an existing trip 
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

  let query = Trip.findOne({ tripid: tripid });

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

module.exports = router;