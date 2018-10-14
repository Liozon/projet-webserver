// TODO: DELETE, PATCH

const debug = require('debug');
var express = require('express');
const mongoose = require('mongoose');
const Trip = require('../models/trip');

var router = express.Router();


/* 
 * POST: create a new trip 
 */
router.post('/', function(req, res, next) {
  // Create a new document from the JSON in the request body
  const newTrip = new Trip(req.body);
  // Save that document
  newTrip.save(function(err, savedTrip) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedTrip);
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
 * PATCH: Modify an existing trip 
 */

/* 
 * DELETE: Delete an existing trip 
 */
router.delete('/', function(req, res, next) {
    
    // remove the trip
    req.trip.remove(function(err) {
        if (err) {
            return next(err);
        }
        
        debug('Deleted trip "${req.trip.tripName}"');
        res.sendStatus(204);
    });
});


module.exports = router;