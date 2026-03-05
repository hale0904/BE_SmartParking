const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema({

    sensorId: {
        type: Number,
        required: true,
        unique: true
    },

    status: {
        type: Number, // 0 = empty , 1 = occupied
        default: 0
    },

    isOnline: {
        type: Boolean,
        default: false
    },

    lastSeen: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Sensor", sensorSchema);