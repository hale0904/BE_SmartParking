const mongoose = require("mongoose")

const slotSchema = new mongoose.Schema({

  slotId: String,

  status: Number,

  updatedAt: {
    type: Date,
    default: Date.now
  }

})

module.exports = mongoose.model("Slot", slotSchema)