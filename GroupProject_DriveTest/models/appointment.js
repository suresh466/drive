const mongoose = require('mongoose');
const uniqueValidator = require('mongoose-unique-validator');

const appointmentSchema = new mongoose.Schema({
    date: { type: String, required: true },
    time: { type: String, required: true },
    isTimeSlotAvailable: { type: Boolean, default: true }
});

// Unique index for the combination of date and time
appointmentSchema.index({ date: 1, time: 1 }, { unique: true });

// Applying the uniqueValidator plugin to the schema
appointmentSchema.plugin(uniqueValidator, {
    message: 'Error,{PATH} is duplicate'
});

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;
