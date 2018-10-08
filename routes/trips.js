var express = require('express');
var router = express.Router();
const User = require('../models/trip');

/* GET users listing. */
router.get('/', function(req, res, next) {
  trip.find().sort('tripid').exec(function(err, trips) {
    if (err) {
      return next(err);
    }
    res.send(trips);
  });
});

module.exports = router;
