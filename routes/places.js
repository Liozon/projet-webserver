const debug = require('debug')('travelLog');
const express = require('express');
const mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;
const Place = require('../models/place');
const utils = require('./utils');
const router = express.Router();


/* 
 * POST: create a new place 
 */
router.post('/', authenticate, utils.requireJson, function(req, res, next) {
  // Create a new document from the JSON in the request body
  const newPlace = new Place(req.body);
  // Save that document
  newPlace.save(function(err, savedPlace) {
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
 * GET: list one place
 */
router.get('/:placeid', function(req, res, next) {
const placeid = req.params.placeid; 
  Place.findOne({ placeid : placeid }).exec(function(err, place) {
    if (err) {
      return next(err);
    }
    res.send(place);
  });
});

/* 
 * PATCH: Modify an existing trip 
 */
router.patch('/:placeid', utils.requireJson, loadPlaceFromParamsMiddleware, function(req, res, next) {

  // Update properties present in the request body
  if (req.body.placeName !== undefined) {
    req.place.placeName = req.body.placeName;
  }
  if (req.body.placeDescription !== undefined) {
    req.place.placeDescription = req.body.placeDescription;
  }

    req.place.set("placeLastModDate", Date.now());
    
  req.place.save(function(err, savedPlace) {
    if (err) {
      return next(err);
    }


    debug(`Updated Place "${savedPlace.placeName}"`);
    res.send(savedPlace);
  });
});

/* 
 * DELETE: Delete an existing place 
 */
router.delete('/:placeid', loadPlaceFromParamsMiddleware, function(req, res, next) {
    
    // remove the place
    req.place.remove(function(err) {
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

  let query = Place.findOne({ placeid: placeid });

  query.exec(function(err, place) {
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