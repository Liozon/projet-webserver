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
    },
    tripCreator:{
        type: Schema.Types.ObjectId,
        ref: 'User',
        default: null,
        validate: {
            isAsync: true,
            // Manually validate uniqueness to send a "pretty" validation error
            validator: validateCreator
        }
    }
});

/**
 * Add a virtual "directorHref" property:
 *
 * * "movie.directorHref" will return the result of calling getDirectorHref with the movie as this
 * * "movie.directorHref = value" will return the result of calling setDirectorHref with the movie as this and value as an argument
 */
tripSchema.virtual('creatorHref').get(getCreatorHref).set(setCreatorHref);

// Customize the behavior of trip.toJSON() (called when using res.send)
tripSchema.set('toJSON', {
  transform: transformJsonTrip, // Modify the serialized JSON with a custom function
  virtuals: true // Include virtual properties when serializing documents to JSON
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

function validateCreator(value, callback) {
  if (!value && !this._creatorHref) {
    this.invalidate('creatorHref', 'Path `creatorHref` is required', value, 'required');
    return callback();
  } else if (!ObjectId.isValid(value)) {
    this.invalidate('creatorHref', 'Path `creatorHref` is not a valid User reference', this._creatorHref, 'resourceNotFound');
    return callback();
  }

  mongoose.model('User').findOne({ userid: ObjectId(value) }).exec(function(err, user) {
    if (err || !user) {
      this.invalidate('creatorHref', 'Path `creatorHref` does not reference a User that exists', this._creatorHref, 'resourceNotFound');
    }

    callback();
  });
}

/**
 * Returns the hyperlink to the trip's creator.
 * (If the creator has been populated, the _id will be extracted from it.)
 */
function getCreatorHref() {
  return `/user/${this.creator.userid || this.creator}`;
}

/**
 * Sets the trip's creator from a user hyperlink.
 */
function setCreatorHref(value) {

  // Store the original hyperlink 
  this._creatorHref = value;

  // Remove "/user" from the beginning of the value
  const userId = value.replace(/^\/user\//, '');

  if (ObjectId.isValid(userId)) {
    // Set the creator if the value is a valid MongoDB ObjectId
    this.creator = userId;
  } else {
    // Unset the creator otherwise
    this.creator = null;
  }
}

/**
 * Removes extra MongoDB properties from serialized movies,
 * and includes the creator's data if it has been populated.
 */
function transformJsonTrip(doc, json, options) {

  // Remove MongoDB userid(there's a default virtual "id" property)
  delete json.userid;

  if (json.creator instanceof ObjectId) {
    // Remove the creator property by default (there's a "creatorHref" virtual property)
    delete json.creator;
  } else {
    // If the creator was populated, include it in the serialization
    json.creator = doc.creator.toJSON();
  }

  return json;
}
// Create the model from the schema and export it
module.exports = mongoose.model('Trip', tripSchema);