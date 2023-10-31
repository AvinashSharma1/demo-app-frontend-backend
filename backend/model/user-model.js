const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({

    name:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
        unique:true
    },
    pancard:{
        type:String,
        //required:true,
        //unique:true
    },
    dob:{
        type:String,
       // required:true,
    },
    role: {
        type: String,
        default: "subscriber"
        // roles available to this proj: admin, moderator, subscriber
    },
    password:{
        type:String,
        required:true,
        minLength:6
    },
    refreshToken:{
        type:String,
    },

});

module.exports = mongoose.model('User',userSchema);