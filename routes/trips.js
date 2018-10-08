var express = require('express');
var router = express.Router();
const Trip = require('../models/trip');

/* POST new trip */
router.post('/', function(req, res, next) {
  // Create a new document from the JSON in the request body
  const newTrip = new trip(req.body);
  // Save that document
  newTrip.save(function(err, savedTrip) {
    if (err) {
      return next(err);
    }
    // Send the saved document in the response
    res.send(savedTrip);
  });
});

/* GET users listing. */
router.get('/', function(req, res, next) {
  Trip.find().sort('tripid').exec(function(err, trips) {
    if (err) {
      return next(err);
    }
    res.send(trips);
  });
});

module.exports = router;
