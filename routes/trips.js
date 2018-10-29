const debug = require('debug')('travelLog');
const express = require('express');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Trip = require('../models/trip');
const utils = require('./utils');
const router = express.Router();


/* 
 * POST: create a new trip 
 */
router.post('/', authenticate, utils.requireJson, function(req, res, next) {
  // Create a new document from the JSON in the request body
  const newTrip = new Trip(req.body);
  // Save that document
  newTrip.save(function(err, savedTrip) {
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
router.get('/', function(req, res, next) {
  Trip.find().sort('tripid').exec(function(err, trips) {
    if (err) {
      return next(err);
    }
    res.send(trips);
  });
});

/* 
 * GET: list one trip
 */
router.get('/:tripid', function(req, res, next) {
    const tripid = req.params.tripid; 
  Trip.findOne({ tripid : tripid }).exec(function(err, trip) {
    if (err) {
      return next(err);
    }
    res.send(trip);
  });
});

/* 
 * PATCH: Modify an existing trip 
 */
router.patch('/:tripid', utils.requireJson, loadTripFromParamsMiddleware, function(req, res, next) {

  // Update properties present in the request body
  if (req.body.tripName !== undefined) {
    req.trip.tripName = req.body.tripName;
  }
  if (req.body.tripDescription !== undefined) {
    req.trip.tripDescription = req.body.tripDescription;
  }

  req.trip.set("tripLastModDate",Date.now());
    
  req.trip.save(function(err, savedTrip) {
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
router.delete('/:tripid', loadTripFromParamsMiddleware, function(req, res, next) {
    
    // remove the trip
    req.trip.remove(function(err) {
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

  query.exec(function(err, trip) {
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
  jwt.verify(token, secretKey, function(err, payload) {
    if (err) {
      return res.status(401).send('Your token is invalid or has expired');
    } else {
      req.currentUserid = payload.sub;
      next(); // Pass the ID of the authenticated user to the next middleware.
        }
  })
}

module.exports = router;