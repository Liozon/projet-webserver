const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Define the schema for trips(ID, description, creation Date, last modification date)
 */
const tripSchema = new Schema({
    tripid: {
        type: Number,
        required: true,
        unique: true,
        validate: {
            isAsync: true,
            // Manually validate uniqueness to send a "pretty" validation error
            validator: validateTripidUniqueness,
            message: 'Trip {VALUE} already exists'
        }
    }, 
    tripName: {
        type: String,
        required: 'Name of the trip is required'
    },
    tripDescription: {
        type: String
    },
    tripCreationDate: {
        type: Date,
        default: Date.now
    },
    tripLastModDate: {
        type: Date,
        default: Date.now
    }
});

/**
 * Given a trip, calls the callback function with true if no trip exists with that id
 * (or the only trip that exists is the same as the trip being validated).
 */
function validateTripidUniqueness(value, callback) {
  const trip = this;
    if (!trip.isNew){
        return callback(true)
    }
  this.constructor.findOne().where('tripid').equals(value).exec(function(err, existingTrip) {
    callback(!err && !existingTrip );
  });
}

// Create the model from the schema and export it
module.exports = mongoose.model('Trip', tripSchema);