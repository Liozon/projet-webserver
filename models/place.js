const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Trip = require("./trip");

/**
 * Define the schema for places
 */
const placeSchema = new Schema({
    placeid: {
        type: Number,
        required: true,
        unique: true,
        validate: {
            isAsync: true,
            // Manually validate uniqueness to send a "pretty" validation error
            validator: validatePlaceidUniqueness,
            message: 'Place {VALUE} already exists'
        }
    },  
    placeName: {
        type: String,
        required: 'Name of the place is required'
    },
    placeDescription: {
        type: String
    },
    placeGeolocalisation: {
        type: String,
        coordinates: Number
    },
    placePicture: {
        data: Buffer, 
        contentType: String
    },
    placeCreationDate: {
        type: Date,
        default: Date.now
    },
    placeLastModDate: {
        type: Date,
        default: Date.now
    },
    placeCorrTrip:{
        type: Number,
        ref: 'Trip',
        required: 'Correspondig trip is required',
        validate: {
            isAsync: true,
            validator: validateTrip
        }
    }
});

/**
 * Given a place, calls the callback function with true if no place exists with that id
 * (or the only place that exists is the same as the place being validated).
 */
function validatePlaceidUniqueness(value, callback) {
  const place = this;
    if (!place.isNew){
        return callback(true)
    }
  this.constructor.findOne().where('placeid').equals(value).exec(function(err, existingPlace) {
    callback(!err && !existingPlace);
  });
}


/**
 * Connection with Trip
 */
function validateTrip(value, callback){
  Trip.findOne({ 'tripid' : value }, function (err, placeCorrTrip){
    if(placeCorrTrip){
      callback(true);
    } else {
      callback(false);
    }
  });
}


// Create the model from the schema and export it
module.exports = mongoose.model('Place', placeSchema);