const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const TutoringSchema = new Schema({
    tutor: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    signature: {
        type: String,
        required: true
    },
    price:{
        type: Number,
        required: true
    },
    tags:{
        type: Array,
        required: true
    },
    from:{
        type: String,
        required: true
    },
    to: {
        type: String,
        required: true
    },
    hours: {
        type: Array,
        required: true
    },
    days: {
        type: Array,
        required: true
    },
    description:{
        type: String,
        required: true
    }
})

module.exports = Tutoring = mongoose.model('tutoring', TutoringSchema);