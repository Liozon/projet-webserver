const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Define the schema for users
const userSchema = new Schema({
    userid: {
        type: int,
        required: true,
        unique: true,
        validate: {
            validator:validateUseridUniquness,
            message: 'User {VALUE} already exists'
        }
    }, 
    username: {
        type: string,
        required: true,
        minlength: 3,
        maxlength: 50,
    },
    email: {
        type: string,
        required: true,
    },
    password: {
        type: string,
        required: true,
        minlength: 8,
        maxlength: 20,
        
    },
    registrationDate: {
        type: date,
        required: true,
    },
});

// Create the model from the schema and export it
module.exports = mongoose.model('user', userSchema);