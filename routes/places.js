var express = require('express');
var router = express.Router();
const Place = require('../models/place');

/* POST new place */
router.post('/', function(req, res, next) {
  // Create a new document from the JSON in the request body
  const newPlace = new place(req.body);
  // Save that document
  newPlace.save(function(err, savedPlace) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedPlace);
  });
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  Place.find().sort('placeid').exec(function(err, places) {
    if (err) {
      return next(err);
    }
    res.send(places);
  });
});

module.exports = router;
