const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const SessionSchema = new Schema({
    tutoring:{
        type: Schema.Types.ObjectId,
        ref: 'tutoring'
    },
    sessionName: {
        type: String,
        required: true
    },
    tutorName:{
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    tags: {
        type: Array,
        required: true
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    tutor:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    totalPrice: {
        type: Number,
        required: true
    },
    location:{
        type: String,
        required: true
    },
    //Every element in the hours array is a part of the schedule
    hours:{
        type: Array,
        required: true
    },
    status:{
        type: String,
        enum:['active', 'finished', 'cancelled'],
        default: 'active'
    },
    date:{
        type: Date,
        default: Date.now
    }
});

module.exports = Session = mongoose.model('session', SessionSchema)