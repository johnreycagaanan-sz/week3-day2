const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');


const UserSchema = new Schema({
    userName: {
        type: String,
        unique: true,
        required: true,
        maxLength: 10
    },
    gender: {
        type: String,
        required: true,
        enum: [
            'Male',
            'Female'
        ]
    },
    age: {
        type: Number,
        required: true,
        validate: (age) => {
            return typeof age === 'number';
        }
        // validate: (age) => {
        //     return validator.isNumeric(age);
        // }
    },
    email: {
        type: String,
        required: true,
        validate: (email) => {
            return validator.isEmail(email);
        }
    },
    password: {
        type: String,
        required: true,
        validate: (password) => {
            return validator.isStrongPassword(password);
        }
    },
    firstName: {
        type: String,
        required: true,
        maxLength: 10
    },
    lastName: {
        type: String,
        required: true,
        maxLength: 10
    },
    resetPasswordToken:{
        type: String
    },
    resetPasswordExpire:{
        type: Date
    },
    admin: {
        type: Boolean,
        default: false
    }
},{
    timestamps: true
})

UserSchema.pre('save', async function(next) {
    // this.userName = this.userName.trim();
    // this.firstName = this.firstName.trim();
    // this.lastName = this.lastName.trim();
    if(!this.isModified) next();

    const salt = await bcrypt.genSalt(10);

    this.password = await bcrypt.hash(this.password, salt);
    
    next();
})

UserSchema.methods.getSignedJwtToken = function() {
    return jwt.sign({id: this._id}, process.env.JWT_SECRET, {
        expiresIn:process.env.JWT_EXPIRE
    })
}

UserSchema.methods.matchPassword = async function(enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password)
}

// UserSchema.post('save', function() {
//     this.gender = this.gender.toUpperCase();
// })

module.exports = mongoose.model('User', UserSchema);