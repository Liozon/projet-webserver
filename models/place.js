// TODO: placeGeolocalisation & placePicture in Schema

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Define the schema for places(ID, desciption, geolocalisation, picture, creation Date, last modification Date)
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
    }
});

/**
 * Given a place, calls the callback function with true if no place exists with that id
 * (or the only place that exists is the same as the place being validated).
 */
function validatePlaceidUniqueness(value, callback) {
  const place = this;
  this.constructor.findOne().where('placeid').equals(value).exec(function(err, existingPlace) {
    callback(!err && !existingPlace);
  });
}

// Create the model from the schema and export it
module.exports = mongoose.model('Place', placeSchema);