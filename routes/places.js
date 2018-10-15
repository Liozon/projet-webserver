// TODO: DELETE, PATCH

const debug = require('debug');
var express = require('express');
const mongoose = require('mongoose');
const Place = require('../models/place');

var router = express.Router();


/* 
 * POST: create a new place 
 */
router.post('/', function(req, res, next) {
  // Create a new document from the JSON in the request body
  const newPlace = new Place(req.body);
  // Save that document
  newPlace.save(function(err, savedPlace) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedPlace);
  });
});

/* 
 * GET: list all places
 */
router.get('/', function(req, res, next) {
  Place.find().sort('placeid').exec(function(err, places) {
    if (err) {
      return next(err);
    }
    res.send(places);
  });
});

/* 
 * PATCH: Modify an existing place 
 */

/* 
 * DELETE: Delete an existing place 
 */
router.delete('/', function(req, res, next) {
    
    // remove the place
    req.place.remove(function(err) {
        if (err) {
            return next(err);
        }
        
        debug('Deleted place "${req.place.placeName}"');
        res.sendStatus(204);
    });
});


module.exports = router;