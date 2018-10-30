const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Define the schema for users(ID, email, password, registration Date)
 */
const userSchema = new Schema({
    userid: {
        type: Number,
        //required: true,
        unique: true,
        validate: {
            isAsync: true,
            // Manually validate uniqueness to send a "pretty" validation error
            validator: validateUseridUniqueness,
            message: 'User {VALUE} already exists'
        }
    }, 
    email: {
        type: String,
        required: 'Email adress is required',
        unique: true,
        validate: [validateEmail, 'Please fill a valid email adress']
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    },
    registrationDate: {
        type: Date,
        default: Date.now
    }
});


// Define a pre-save method for userSchema: Creation of automatic userid
userSchema.pre('save', function (next) {
    this.constructor.find().sort('-userid').limit(1).exec((err, userList) => {
        if (err) {
            next(err);
        } else {
            if (userList.length === 0) {
                this.userid = 1;
                next();
            } else {
                this.userid = userList[0].userid + 1;
                next();
            }
        }
    });
});


/**
 * Verify if email is valid using regular expression
 * Source: https://stackoverflow.com/questions/46155/how-to-validate-an-email-address-in-javascript
 */
function validateEmail(email) {
    const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return emailRegex.test(String(email).toLowerCase());
}

/**
 * Given a name, calls the callback function with true if no person exists with that name
 * (or the only person that exists is the same as the person being validated).
 */
function validateUseridUniqueness(value, callback) {
    const user = this;
    if (!user.isNew) {
        return callback(true)
    }
    this.constructor.findOne().where('userid').equals(value).exec(function (err, existingUser) {
        callback(!err && !existingUser);
    });
}

// Create the model from the schema and export it
module.exports = mongoose.model('User', userSchema);
