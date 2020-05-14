const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const CalendarSchema = new Schema({
    tutor:{
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    sessions:[{
        type: Schema.Types.ObjectId,
        ref: 'session'
    }]
});

module.exports = Calendar = mongoose.model('calendar', CalendarSchema)