const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const User = require("./user");


/**
 * Define the schema for trips (tripid, tripName, tripDescription, tripCrationDate, tripLastModDate, tripCreator)
 */
const tripSchema = new Schema({
    tripid: {
        type: Number,
        // required: true,
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
    },
    tripCreator: {
        type: Number,
        ref: 'User',
        required: 'Trip Creator is required',
        validate: {
            isAsync: true,
            validator: validateCreator
        }
    },
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


/**
 * Connection with User
 */
function validateCreator(value, callback){
  User.findOne({ 'userid' : value }, function (err, tripCreator){
    if(tripCreator){
      callback(true);
    } else {
      callback(false);
    }
  });
}

/**
 * Define a pre-save method for tripSchema: Creation of automatic tripid
 */
tripSchema.pre('save', function (next) {
    this.constructor.find().sort('-tripid').limit(1).exec((err, tripList) => {
        if (err) {
            next(err);
        } else {
            if (tripList.length === 0) {
                this.tripid = 1;
                next();
            } else {
                this.tripid = tripList[0].tripid + 1;
                next();
            }
        }
    });
});


// Create the model from the schema and export it
module.exports = mongoose.model('Trip', tripSchema);