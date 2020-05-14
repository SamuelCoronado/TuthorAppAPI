const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const UserSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state:{
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    about: {
        type: String
    },
    opinionsAsTutor:[{
        student:{
            type: Schema.Types.ObjectId,
            ref: 'user'
        },
        studentName:{
            type: String,
            required: true
        },
        profileImage:{
            type: String,
            required: true
        },
        session:{
            type: Schema.Types.ObjectId,
            ref: 'session'
        },
        sessionName:{
            type: String,
            required: true
        },
        opinion: {
           type: String
        },
        date: {
          type: Date,
          default: Date.now
        },
        rating:{
            type: Number,
            default: 0
        }

    }],
    opinionsAsStudent:[{
       tutor:{
           type: Schema.Types.ObjectId,
           ref: 'user'
       },
       session:{
        type: Schema.Types.ObjectId,
        ref: 'session'
       },
       opinion: {
           type: String
       },
       date: {
           type: Date,
           default: Date.now
       },
       rating:{
           type: Number,
           default: 0
       }
    }],
    birthdate:{
        type: Date,
        required: true
    },
    studies:[{
        institute:{
            type: String,
            required: true
        },
        period:{
            type: String,
            required: true
        },
        signature:{
            type: String,
            required: true
        },
        description:{
            type: String,
            required: true
        }
    }],
    calendar:{
        type: Schema.Types.ObjectId,
        ref: 'calendar'
    }
})

module.exports = User = mongoose.model('user', UserSchema);